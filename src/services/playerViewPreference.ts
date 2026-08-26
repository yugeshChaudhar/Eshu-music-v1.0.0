import { PlayerViewMode } from '../types';

export const PLAYER_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

const STORAGE_KEY_VIEW_MODE = 'eshu_player_view_mode';
const STORAGE_KEY_LAST_TRACK_ID = 'eshu_player_last_track_id';
const STORAGE_KEY_LAST_SESSION = 'eshu_last_player_session';

const VALID_MODES: PlayerViewMode[] = ['artwork', 'canvas', 'visualizer', 'vinyl', 'lyrics'];

/**
 * Validates whether a value is a supported PlayerViewMode
 */
export function isValidPlayerViewMode(mode: any): mode is PlayerViewMode {
  return typeof mode === 'string' && VALID_MODES.includes(mode as PlayerViewMode);
}

/**
 * Gets the raw saved player view mode from localStorage
 */
export function getSavedPlayerView(): PlayerViewMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_VIEW_MODE);
    if (isValidPlayerViewMode(saved)) {
      return saved;
    }
  } catch (err) {
    console.warn('Failed to read player view mode:', err);
  }
  return 'artwork';
}

/**
 * Sets and persists the user's chosen player view mode
 */
export function setSavedPlayerView(mode: PlayerViewMode, trackId?: string): void {
  if (!isValidPlayerViewMode(mode)) return;
  try {
    localStorage.setItem(STORAGE_KEY_VIEW_MODE, mode);
    if (trackId && typeof trackId === 'string' && trackId.trim()) {
      localStorage.setItem(STORAGE_KEY_LAST_TRACK_ID, trackId.trim());
    }
    localStorage.setItem(STORAGE_KEY_LAST_SESSION, Date.now().toString());
  } catch (err) {
    console.warn('Failed to save player view mode:', err);
  }
}

/**
 * Resets the player view mode to 'artwork'
 */
export function resetPlayerViewToArtwork(trackId?: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_VIEW_MODE, 'artwork');
    if (trackId && typeof trackId === 'string' && trackId.trim()) {
      localStorage.setItem(STORAGE_KEY_LAST_TRACK_ID, trackId.trim());
    }
    localStorage.setItem(STORAGE_KEY_LAST_SESSION, Date.now().toString());
  } catch (err) {
    console.warn('Failed to reset player view mode:', err);
  }
}

/**
 * Retrieves the timestamp of the last player session / activity
 */
export function getLastPlayerSessionTimestamp(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LAST_SESSION);
    if (raw) {
      const ts = parseInt(raw, 10);
      if (!isNaN(ts) && ts > 0) return ts;
    }
  } catch {}
  return 0;
}

/**
 * Retrieves the track ID for which the last view mode was selected
 */
export function getLastPlayerTrackId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_LAST_TRACK_ID) || '';
  } catch {
    return '';
  }
}

/**
 * Updates the activity timestamp to keep the session alive during active playback or interaction
 */
export function updatePlayerActivityTimestamp(): void {
  try {
    localStorage.setItem(STORAGE_KEY_LAST_SESSION, Date.now().toString());
  } catch {}
}

/**
 * Evaluates the effective player view mode according to the state rules:
 * 1. Check session timeout (is this a fresh session after inactivity > 30m?) -> reset to 'artwork'
 * 2. Check track identity (is this a different song than before?) -> reset to 'artwork'
 * 3. Same song & active session -> restore last saved view mode
 */
export function getEffectivePlayerView(currentTrackId?: string): PlayerViewMode {
  try {
    const now = Date.now();
    const lastSession = getLastPlayerSessionTimestamp();
    const lastTrackId = getLastPlayerTrackId();
    const cleanCurrentTrackId = typeof currentTrackId === 'string' ? currentTrackId.trim() : '';

    // Condition 1: Long period of inactivity (Session Timeout)
    if (!lastSession || (now - lastSession > PLAYER_SESSION_TIMEOUT)) {
      resetPlayerViewToArtwork(cleanCurrentTrackId);
      return 'artwork';
    }

    // Condition 2: Genuinely different song
    if (cleanCurrentTrackId && lastTrackId && cleanCurrentTrackId !== lastTrackId) {
      resetPlayerViewToArtwork(cleanCurrentTrackId);
      return 'artwork';
    }

    // Update session timestamp for active presence
    updatePlayerActivityTimestamp();

    // Condition 3: Same song + active session -> Restore saved mode
    return getSavedPlayerView();
  } catch (err) {
    console.warn('Error evaluating effective player view:', err);
    return 'artwork';
  }
}

/**
 * Called when a new song starts playing.
 * If previous track differs from new track, resets view to 'artwork'.
 */
export function notifyTrackChanged(newTrackId: string): PlayerViewMode {
  const cleanTrackId = typeof newTrackId === 'string' ? newTrackId.trim() : '';
  const lastTrackId = getLastPlayerTrackId();

  if (cleanTrackId && cleanTrackId !== lastTrackId) {
    resetPlayerViewToArtwork(cleanTrackId);
    return 'artwork';
  }

  return getEffectivePlayerView(cleanTrackId);
}
