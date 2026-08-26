import { LyricsData, LyricsRecord } from '../types';
import { parseLrcString, createDistributedSyncedLines } from './lrcParser';
import { SAMPLE_SYNCED_LYRICS } from '../data/simpMusicData';

// Multi-tier client cache
const MEMORY_CACHE = new Map<string, LyricsData>();
const LOCAL_STORAGE_KEY = 'eshu_lyrics_cache_v2';

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
    // Keep max 100 entries in localStorage to avoid storage limits
    const keys = Object.keys(existing);
    if (keys.length > 100) {
      delete existing[keys[0]];
    }
    existing[key] = data;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearLyricsCacheForTrack(title: string, artist?: string) {
  const normTitle = title.toLowerCase().trim();
  const normArtist = (artist || '').toLowerCase().trim();
  const key = `${normTitle}_${normArtist}`;
  MEMORY_CACHE.delete(key);
  try {
    const existing = getStorageCache();
    delete existing[key];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // Ignore
  }
}

/**
 * Normalizes string for fuzzy title/artist matching
 */
export function cleanTrackTitle(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/(\(|\[)(official\s*(music\s*)?(video|audio|lyrics|hd|4k|remastered|lyric\s*video|visualizer)|remastered\s*\d*).*?(\)|\])/gi, '')
    .replace(/\s*-\s*(official\s*(music\s*)?(video|audio|lyrics)|visualizer)/gi, '')
    .replace(/\s+(ft\.|feat\.|featuring)\s+.*/gi, '')
    .trim();
}

/**
 * Fetches lyrics for a track with multi-source fallback:
 * 1. Client in-memory & localStorage cache
 * 2. ESHU Database (includes custom user/admin entries & built-in Nepali/Global hits)
 * 3. LRCLIB (exact match & search)
 * 4. Gemini AI server-side synchronized LRC generator
 * 5. Clean unavailable state with "Add Lyrics" prompt
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
  const cacheKey = `${cleanTitle.toLowerCase()}_${cleanArtist.toLowerCase()}`;

  // 1. Check in-memory cache
  if (MEMORY_CACHE.has(cacheKey)) {
    return MEMORY_CACHE.get(cacheKey)!;
  }

  // Check localStorage cache
  const localDb = getStorageCache();
  if (localDb[cacheKey]) {
    MEMORY_CACHE.set(cacheKey, localDb[cacheKey]);
    return localDb[cacheKey];
  }

  // 2. Check local curated sample database by video ID
  if (videoId && SAMPLE_SYNCED_LYRICS[videoId]) {
    const sampleLrc = SAMPLE_SYNCED_LYRICS[videoId];
    const parsedLines = parseLrcString(sampleLrc);
    const data: LyricsData = {
      synced: true,
      lines: parsedLines,
      plainLyrics: sampleLrc.replace(/\[\d{2}:\d{2}(\.\d{2,3})?\]/g, '').trim(),
      source: 'LRCLIB',
      trackName: trackTitle,
      artistName: artistName,
    };
    MEMORY_CACHE.set(cacheKey, data);
    setStorageCache(cacheKey, data);
    return data;
  }

  // 3. Fetch from server endpoint (which checks ESHU DB -> LRCLIB -> Gemini AI)
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
            songId: data.songId,
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
          MEMORY_CACHE.set(cacheKey, lyricsResult);
          setStorageCache(cacheKey, lyricsResult);
          return lyricsResult;
        }
      }

      if (data.plainLyrics && data.plainLyrics.trim().length > 0 && !data.unavailable) {
        const distributed = createDistributedSyncedLines(data.plainLyrics, durationSeconds || 210);
        const lyricsResult: LyricsData = {
          id: data.id,
          songId: data.songId,
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
        MEMORY_CACHE.set(cacheKey, lyricsResult);
        setStorageCache(cacheKey, lyricsResult);
        return lyricsResult;
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw err;
    }
    console.warn('Lyrics server fetch exception:', err);
  }

  // 4. Final Unavailable state
  const fallbackResult: LyricsData = {
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
  clearLyricsCacheForTrack(record.title, record.artist);
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
    clearLyricsCacheForTrack(record.title, record.artist);
  }
  return updated;
}

export async function deleteLyricsFromDatabase(id: string, title?: string, artist?: string): Promise<boolean> {
  const res = await fetch(`/api/lyrics/db/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete lyrics');
  }

  if (title) {
    clearLyricsCacheForTrack(title, artist);
  }
  return true;
}
