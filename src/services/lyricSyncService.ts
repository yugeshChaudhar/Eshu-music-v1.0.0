import { LyricsLine } from '../types';

/**
 * Lyric Synchronization Engine with Manual User Calibration
 * Allows users to manually calibrate lyric synchronization (+0.5s Delay / -0.5s Advance / Reset)
 * and saves user timing preferences per track in persistent local storage.
 */

const LYRIC_OFFSETS_STORAGE_KEY = 'echo_music_lyric_offsets_v2';

// Pre-calibrated initial defaults for popular music videos
const DEFAULT_PRESET_OFFSETS: Record<string, number> = {
  'fJ9rUzIMcZQ': 1500, // Queen - Bohemian Rhapsody
  '4NRXx6U8ABQ': 2500, // The Weeknd - Blinding Lights
  'XXYlFuWEuKI': 1500, // The Weeknd - Save Your Tears
  'kXYiU_JCYtU': 1500, // Linkin Park - Numb
  '09R8_2nJtjg': 1500, // Maroon 5 - Sugar
  'kJQP7kiw5Fk': 1500, // Luis Fonsi - Despacito
  'JGwWNGJdvx8': 1500, // Ed Sheeran - Shape of You
  'hT_nvWreIhg': 1500, // OneRepublic - Counting Stars
  '60ItHLz5WEA': 1500, // Alan Walker - Faded
};

function getStoredOffsetsMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LYRIC_OFFSETS_STORAGE_KEY) || localStorage.getItem('simpmusic_lyric_offsets_v1');
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStoredOffsetsMap(map: Record<string, number>): void {
  try {
    localStorage.setItem(LYRIC_OFFSETS_STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

/**
 * Returns the current lyric timing offset in milliseconds for the given track.
 * If the user has manually adjusted the timing, returns the saved manual offset.
 * Otherwise returns the preset default or 0ms.
 */
export function getLyricOffset(trackId?: string): number {
  if (!trackId) return 0;
  const map = getStoredOffsetsMap();
  if (typeof map[trackId] === 'number') {
    return map[trackId];
  }
  return DEFAULT_PRESET_OFFSETS[trackId] ?? 0;
}

/**
 * Explicitly sets the manual offset for a track.
 */
export function setLyricOffset(trackId: string, offsetMs: number): void {
  if (!trackId) return;
  const map = getStoredOffsetsMap();
  map[trackId] = offsetMs;
  saveStoredOffsetsMap(map);
}

/**
 * Adjusts the lyric offset for a track by a delta (e.g. +500ms or -500ms).
 * Returns the newly saved offset.
 */
export function adjustLyricOffset(trackId: string, deltaMs: number): number {
  if (!trackId) return 0;
  const current = getLyricOffset(trackId);
  const updated = current + deltaMs;
  setLyricOffset(trackId, updated);
  return updated;
}

/**
 * Resets the lyric offset for a track back to 0.
 */
export function resetLyricOffset(trackId: string): void {
  if (!trackId) return;
  const map = getStoredOffsetsMap();
  delete map[trackId];
  saveStoredOffsetsMap(map);
}

/**
 * Calculates active lyric index given the effective playback time and manual offset.
 */
export function getEffectiveActiveLyricIndex(
  currentTimeSec: number,
  manualOffsetMs: number,
  lines?: LyricsLine[]
): number {
  if (!lines || lines.length === 0 || typeof currentTimeSec !== 'number' || isNaN(currentTimeSec) || currentTimeSec < 0) {
    return -1;
  }

  const effectiveMs = Math.max(0, (currentTimeSec * 1000) - manualOffsetMs);

  // Before the first vocal line has started
  if (effectiveMs < lines[0].timeMs) {
    return -1;
  }

  let activeIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].timeMs <= effectiveMs) {
      activeIdx = i;
    } else {
      break;
    }
  }

  if (activeIdx === -1) return -1;

  // Instrumental breaks between lines
  const currentLine = lines[activeIdx];
  const nextLine = lines[activeIdx + 1];

  if (nextLine) {
    const gapMs = nextLine.timeMs - currentLine.timeMs;
    if (gapMs > 6000) {
      const words = currentLine.text.trim().split(/\s+/).length;
      const estimatedVocalDurationMs = Math.min(gapMs - 1500, Math.max(3000, words * 400));
      if (effectiveMs > currentLine.timeMs + estimatedVocalDurationMs) {
        return -1;
      }
    }
  }

  return activeIdx;
}

/**
 * Legacy compatibility helper.
 */
export function getAutoActiveLyricIndex(
  currentTimeSec: number,
  trackId?: string,
  lines?: LyricsLine[]
): number {
  const offset = getLyricOffset(trackId);
  return getEffectiveActiveLyricIndex(currentTimeSec, offset, lines);
}

/**
 * Calculates seek time in seconds taking the current manual offset into account.
 */
export function getSeekTimeForLine(lineTimeMs: number, offsetMs: number = 0): number {
  return Math.max(0, (lineTimeMs + offsetMs) / 1000);
}
