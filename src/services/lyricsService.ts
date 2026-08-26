import { LyricsData, LyricsRecord } from '../types';
import { parseLrcString, createDistributedSyncedLines } from './lrcParser';
import { SAMPLE_SYNCED_LYRICS } from '../data/simpMusicData';

// Multi-tier client cache
const MEMORY_CACHE = new Map<string, LyricsData>();
const LOCAL_STORAGE_KEY = 'eshu_lyrics_cache_v3';

function getStorageCache(): Record<string, LyricsData> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStorageCache(key: string, data: LyricsData) {
  try {
    const existing = getStorageCache();
    // Keep max 150 entries in localStorage to avoid storage limits
    const keys = Object.keys(existing);
    if (keys.length > 150) {
      delete existing[keys[0]];
    }
    existing[key] = data;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // Ignore storage quota errors
  }
}

function removeStorageCache(key: string) {
  try {
    const existing = getStorageCache();
    delete existing[key];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // Ignore
  }
}

/**
 * Normalizes title / artist for client-side cache and query preparation.
 * Preserves Nepali & Hindi Devanagari Unicode (\u0900-\u097F).
 */
export function cleanTrackTitle(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/(\(|\[)(official\s*(music\s*)?(video|audio|lyrics|hd|4k|remastered|lyric\s*video|visualizer)|remastered\s*\d*|full\s*audio|new\s*nepali\s*song\s*\d*).*?(\)|\])/gi, '')
    .replace(/\s*-\s*(official\s*(music\s*)?(video|audio|lyrics)|visualizer)/gi, '')
    .replace(/\s+(ft\.|feat\.|featuring)\s+.*/gi, '')
    .replace(/\s*-\s*Topic$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function clearLyricsCacheForTrack(title: string, artist?: string, videoId?: string) {
  const normTitle = cleanTrackTitle(title).toLowerCase().trim();
  const normArtist = cleanTrackTitle(artist || '').toLowerCase().trim();
  const metaKey = `meta_${normTitle}_${normArtist}`;

  MEMORY_CACHE.delete(metaKey);
  removeStorageCache(metaKey);

  if (videoId) {
    const vidKey = `vid_${videoId}`;
    MEMORY_CACHE.delete(vidKey);
    removeStorageCache(vidKey);
  }
}

/**
 * Fetches lyrics for the currently playing track:
 * 1. Checks memory & localStorage client cache by YouTube videoId or normalized Title + Artist.
 * 2. Checks sample curated seed lyrics by video ID.
 * 3. Calls the backend /api/lyrics endpoint (which checks ESHU Database -> LRCLIB provider pipeline).
 * 4. Parses synced LRC into structured lines.
 * 5. Returns formatted plain or synced lyrics, or a clean unavailable state.
 */
export async function fetchLyricsForTrack(
  trackTitle: string,
  artistName: string = '',
  durationSeconds?: number,
  videoId?: string,
  signal?: AbortSignal
): Promise<LyricsData> {
  const cleanTitle = cleanTrackTitle(trackTitle);
  const cleanArtist = cleanTrackTitle(artistName);
  const metaKey = `meta_${cleanTitle.toLowerCase()}_${cleanArtist.toLowerCase()}`;
  const vidKey = videoId ? `vid_${videoId}` : null;

  // 1. Check in-memory cache
  if (vidKey && MEMORY_CACHE.has(vidKey)) {
    return MEMORY_CACHE.get(vidKey)!;
  }
  if (MEMORY_CACHE.has(metaKey)) {
    return MEMORY_CACHE.get(metaKey)!;
  }

  // 2. Check localStorage cache
  const localDb = getStorageCache();
  if (vidKey && localDb[vidKey]) {
    MEMORY_CACHE.set(vidKey, localDb[vidKey]);
    return localDb[vidKey];
  }
  if (localDb[metaKey]) {
    MEMORY_CACHE.set(metaKey, localDb[metaKey]);
    return localDb[metaKey];
  }

  // 3. Check curated sample database by video ID
  if (videoId && SAMPLE_SYNCED_LYRICS[videoId]) {
    const sampleLrc = SAMPLE_SYNCED_LYRICS[videoId];
    const parsedLines = parseLrcString(sampleLrc);
    const data: LyricsData = {
      songId: videoId,
      synced: true,
      lines: parsedLines,
      syncedLyrics: sampleLrc,
      plainLyrics: sampleLrc.replace(/\[\d{2}:\d{2}(\.\d{2,3})?\]/g, '').trim(),
      source: 'LRCLIB',
      trackName: trackTitle,
      artistName: artistName,
    };
    if (vidKey) {
      MEMORY_CACHE.set(vidKey, data);
      setStorageCache(vidKey, data);
    }
    MEMORY_CACHE.set(metaKey, data);
    setStorageCache(metaKey, data);
    return data;
  }

  // 4. Fetch from backend /api/lyrics endpoint
  try {
    const params = new URLSearchParams({
      track_name: cleanTitle,
      artist_name: cleanArtist,
    });
    if (videoId) params.append('song_id', videoId);
    if (durationSeconds && durationSeconds > 0) {
      params.append('duration', Math.round(durationSeconds).toString());
    }

    const res = await fetch(`/api/lyrics?${params.toString()}`, { signal });
    if (res.ok) {
      const data = await res.json();

      if (data.syncedLyrics && data.syncedLyrics.trim().length > 0) {
        const parsedLines = parseLrcString(data.syncedLyrics);
        if (parsedLines.length > 0) {
          const lyricsResult: LyricsData = {
            id: data.id,
            songId: data.songId || videoId,
            synced: true,
            lines: parsedLines,
            syncedLyrics: data.syncedLyrics,
            plainLyrics: data.plainLyrics || parsedLines.map((l) => l.text).join('\n'),
            source: data.source || 'ESHU Database',
            language: data.language,
            trackName: data.trackName || trackTitle,
            artistName: data.artistName || artistName,
            album: data.album,
            isCustom: data.isCustom,
          };
          if (vidKey) {
            MEMORY_CACHE.set(vidKey, lyricsResult);
            setStorageCache(vidKey, lyricsResult);
          }
          MEMORY_CACHE.set(metaKey, lyricsResult);
          setStorageCache(metaKey, lyricsResult);
          return lyricsResult;
        }
      }

      if (data.plainLyrics && data.plainLyrics.trim().length > 0 && !data.unavailable) {
        const distributed = createDistributedSyncedLines(data.plainLyrics, durationSeconds || 210);
        const lyricsResult: LyricsData = {
          id: data.id,
          songId: data.songId || videoId,
          synced: distributed.length > 0,
          lines: distributed,
          plainLyrics: data.plainLyrics,
          source: data.source || 'ESHU Database',
          language: data.language,
          trackName: data.trackName || trackTitle,
          artistName: data.artistName || artistName,
          album: data.album,
          isCustom: data.isCustom,
        };
        if (vidKey) {
          MEMORY_CACHE.set(vidKey, lyricsResult);
          setStorageCache(vidKey, lyricsResult);
        }
        MEMORY_CACHE.set(metaKey, lyricsResult);
        setStorageCache(metaKey, lyricsResult);
        return lyricsResult;
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw err;
    }
    console.warn('Lyrics server fetch exception:', err);
  }

  // 5. Final Unavailable state (Never hallucinate fake lyrics)
  const fallbackResult: LyricsData = {
    songId: videoId,
    synced: false,
    lines: [],
    plainLyrics: '',
    source: 'None',
    unavailable: true,
    trackName: trackTitle,
    artistName: artistName,
  };
  return fallbackResult;
}

// -------------------------------------------------------------
// Admin Lyrics Database Management APIs
// -------------------------------------------------------------

export async function fetchAllDatabaseLyrics(query?: string): Promise<LyricsRecord[]> {
  try {
    const url = query ? `/api/lyrics/db?q=${encodeURIComponent(query)}` : '/api/lyrics/db';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch lyrics list');
    const data = await res.json();
    return data.records || [];
  } catch (err) {
    console.error('fetchAllDatabaseLyrics error:', err);
    return [];
  }
}

export async function fetchLyricsRecordById(id: string): Promise<LyricsRecord | null> {
  try {
    const res = await fetch(`/api/lyrics/db/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('fetchLyricsRecordById error:', err);
    return null;
  }
}

export async function saveLyricsToDatabase(record: {
  title: string;
  artist: string;
  album?: string;
  language?: string;
  plainLyrics?: string;
  syncedLyrics?: string;
  songId?: string;
  source?: string;
}): Promise<LyricsRecord> {
  const res = await fetch('/api/lyrics/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to save lyrics' }));
    throw new Error(err.error || 'Failed to save lyrics');
  }

  const saved: LyricsRecord = await res.json();
  clearLyricsCacheForTrack(record.title, record.artist, record.songId);
  return saved;
}

export async function updateLyricsInDatabase(
  id: string,
  record: Partial<{
    title: string;
    artist: string;
    album?: string;
    language?: string;
    plainLyrics?: string;
    syncedLyrics?: string;
    songId?: string;
    source?: string;
  }>
): Promise<LyricsRecord> {
  const res = await fetch(`/api/lyrics/db/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update lyrics' }));
    throw new Error(err.error || 'Failed to update lyrics');
  }

  const updated: LyricsRecord = await res.json();
  if (record.title) {
    clearLyricsCacheForTrack(record.title, record.artist, record.songId);
  }
  return updated;
}

export async function deleteLyricsFromDatabase(id: string, title?: string, artist?: string, songId?: string): Promise<boolean> {
  const res = await fetch(`/api/lyrics/db/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete lyrics');
  }

  if (title) {
    clearLyricsCacheForTrack(title, artist, songId);
  }
  return true;
}
