import { safeJsonStringify } from './echoStorage';

export interface SavedSessionState {
  stationId?: string;
  isOfflineMode: boolean;
  offlineTrackId?: string;
  playlistIndex?: number;
  currentTime: number;
  duration?: number;
  trackTitle?: string;
  trackArtist?: string;
  trackThumbnail?: string;
  volume: number;
  isMuted: boolean;
  theme: string;
  viewMode: string;
  playbackRate: number;
  isShuffle: boolean;
  isRepeat: boolean;
  backgroundPlayEnabled: boolean;
  timestamp: number;
}

const SESSION_STORAGE_KEY = 'casual_radio_session_state_v1';

export function saveSessionState(state: Partial<SavedSessionState>): void {
  try {
    const existing = getSavedSessionState() || {};
    const updated: SavedSessionState = {
      ...existing,
      ...state,
      timestamp: Date.now(),
    } as SavedSessionState;
    localStorage.setItem(SESSION_STORAGE_KEY, safeJsonStringify(updated, '{}'));
  } catch (err) {
    console.warn('Failed to save playback session state:', err);
  }
}

export function getSavedSessionState(): SavedSessionState | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedSessionState;
  } catch (err) {
    console.warn('Failed to parse saved session state:', err);
    return null;
  }
}

export function clearSavedSessionState(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear session state:', err);
  }
}
