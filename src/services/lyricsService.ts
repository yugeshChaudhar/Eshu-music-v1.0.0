import { LyricsData, LyricsLine } from '../types';
import { SAMPLE_SYNCED_LYRICS } from '../data/simpMusicData';

/**
 * Parses timestamped LRC format like:
 * [00:15.50]I've been tryna call
 * [01:02.00]I said, ooh, I'm blinded by the lights
 */
export function parseLrcString(lrcContent: string): LyricsLine[] {
  if (!lrcContent) return [];
  const lines: LyricsLine[] = [];
  const regex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/;

  const rawLines = lrcContent.split('\n');
  for (const raw of rawLines) {
    const match = regex.exec(raw.trim());
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const msPart = match[3] ? match[3].padEnd(3, '0').slice(0, 3) : '0';
      const milliseconds = parseInt(msPart, 10);

      const totalMs = minutes * 60 * 1000 + seconds * 1000 + milliseconds;
      const text = match[4].trim();

      if (text) {
        lines.push({
          timeMs: totalMs,
          text,
        });
      }
    }
  }

  // Sort chronologically
  return lines.sort((a, b) => a.timeMs - b.timeMs);
}

/**
 * Fetches lyrics for a track with multi-source fallback:
 * 1. Server API proxy to LRCLIB (synced milliseconds lyrics)
 * 2. Static dataset fallback for curated top hits
 * 3. Plain text fallback
 */
export async function fetchLyricsForTrack(
  trackTitle: string,
  artistName: string,
  durationSeconds?: number,
  videoId?: string
): Promise<LyricsData> {
  // Check local curated sample database first
  if (videoId && SAMPLE_SYNCED_LYRICS[videoId]) {
    const sampleLrc = SAMPLE_SYNCED_LYRICS[videoId];
    return {
      synced: true,
      lines: parseLrcString(sampleLrc),
      source: 'SimpMusic',
      trackName: trackTitle,
      artistName: artistName,
    };
  }

  // Clean title for better search matching (e.g. "Song Name (Official Video)" -> "Song Name")
  const cleanTitle = trackTitle
    .replace(/(\(|\[)(official|music|video|audio|lyrics|hd|4k|remastered).*?(\)|\])/gi, '')
    .replace(/ft\..*$/i, '')
    .trim();

  try {
    const params = new URLSearchParams({
      track_name: cleanTitle,
      artist_name: artistName || '',
    });
    if (durationSeconds) {
      params.append('duration', Math.round(durationSeconds).toString());
    }

    const res = await fetch(`/api/lyrics?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.syncedLyrics) {
        return {
          synced: true,
          lines: parseLrcString(data.syncedLyrics),
          plainLyrics: data.plainLyrics,
          source: data.source || 'LRCLIB',
          trackName: data.trackName || trackTitle,
          artistName: data.artistName || artistName,
        };
      } else if (data.plainLyrics) {
        return {
          synced: false,
          lines: [],
          plainLyrics: data.plainLyrics,
          source: data.source || 'LRCLIB',
          trackName: data.trackName || trackTitle,
          artistName: data.artistName || artistName,
        };
      }
    }
  } catch (err) {
    console.warn('Lyrics fetch error:', err);
  }

  return {
    synced: false,
    lines: [],
    plainLyrics: 'No synchronized lyrics available for this stream.',
    source: 'None',
  };
}
