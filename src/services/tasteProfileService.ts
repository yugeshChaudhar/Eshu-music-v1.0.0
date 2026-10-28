import { Track, Playlist } from '../types';
import { safeJsonStringify, sanitizeTrack, isDomOrEvent, getListeningHistory } from './echoStorage';

export interface PlaybackEvent {
  type: 'start' | 'progress' | 'complete' | 'skip' | 'replay' | 'favorite' | 'recommendation_click';
  trackId: string;
  artist: string;
  title: string;
  genre?: string;
  duration: number;
  listenedSeconds: number;
  completionRatio: number;
  timestamp: number;
}

export interface ArtistAffinity {
  artist: string;
  score: number;
  playCount: number;
  completionCount: number;
  skipCount: number;
  lastListenedAt: number;
  canonicalThumb?: string;
  genre?: string;
}

export interface TasteProfile {
  lastUpdated: number;
  dominantArtist: string | null;
  dominantGenre: string | null;
  artistAffinities: Record<string, ArtistAffinity>;
  genreAffinities: Record<string, number>;
  recentEvents: PlaybackEvent[];
  recentSeedArtists: string[];
  skippedTrackIds: Record<string, number>; // trackId -> timestamp
}

const TASTE_PROFILE_KEY = 'eshumusic_taste_profile_v2';
const MAX_EVENTS = 60;
const MAX_RECENT_ARTISTS = 10;
const EARLY_SKIP_THRESHOLD_SECONDS = 25;
const EARLY_SKIP_THRESHOLD_RATIO = 0.25;
const COMPLETION_RATIO_THRESHOLD = 0.60;

// Listeners for live updates across components
type TasteListener = (profile: TasteProfile) => void;
const listeners = new Set<TasteListener>();

export function subscribeToTasteProfile(listener: TasteListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(profile: TasteProfile) {
  for (const listener of listeners) {
    try {
      listener(profile);
    } catch (e) {
      console.warn('[TasteProfile] Listener error:', e);
    }
  }
}

function getCleanArtistKey(artist: string): string {
  if (!artist) return '';
  return artist
    .toLowerCase()
    .split(/[&,x+]/)[0]
    .replace(/\s*-\s*topic$/i, '')
    .trim();
}

export function getStoredTasteProfile(): TasteProfile {
  try {
    const raw = localStorage.getItem(TASTE_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          lastUpdated: parsed.lastUpdated || Date.now(),
          dominantArtist: parsed.dominantArtist || null,
          dominantGenre: parsed.dominantGenre || null,
          artistAffinities: parsed.artistAffinities || {},
          genreAffinities: parsed.genreAffinities || {},
          recentEvents: Array.isArray(parsed.recentEvents) ? parsed.recentEvents : [],
          recentSeedArtists: Array.isArray(parsed.recentSeedArtists) ? parsed.recentSeedArtists : [],
          skippedTrackIds: parsed.skippedTrackIds || {},
        };
      }
    }
  } catch (err) {
    console.warn('[TasteProfile] Error loading profile:', err);
  }

  // Generate initial profile from existing listening history if present
  return initializeProfileFromHistory();
}

function initializeProfileFromHistory(): TasteProfile {
  const profile: TasteProfile = {
    lastUpdated: Date.now(),
    dominantArtist: null,
    dominantGenre: null,
    artistAffinities: {},
    genreAffinities: {},
    recentEvents: [],
    recentSeedArtists: [],
    skippedTrackIds: {},
  };

  try {
    const existingHistory = getListeningHistory();
    if (Array.isArray(existingHistory) && existingHistory.length > 0) {
      for (const item of existingHistory.slice(0, 20)) {
        if (!item?.track?.artist) continue;
        const key = getCleanArtistKey(item.track.artist);
        if (!key) continue;

        if (!profile.artistAffinities[key]) {
          profile.artistAffinities[key] = {
            artist: item.track.artist,
            score: 3.0,
            playCount: 1,
            completionCount: 1,
            skipCount: 0,
            lastListenedAt: item.timestamp || Date.now(),
            canonicalThumb: item.track.thumbnail,
            genre: item.track.category,
          };
        } else {
          profile.artistAffinities[key].score += 1.5;
          profile.artistAffinities[key].playCount += 1;
        }

        if (!profile.recentSeedArtists.includes(item.track.artist)) {
          profile.recentSeedArtists.push(item.track.artist);
        }
      }

      if (profile.recentSeedArtists.length > 0) {
        profile.dominantArtist = profile.recentSeedArtists[0];
      }
    }
  } catch (err) {
    console.warn('[TasteProfile] Initialization fallback error:', err);
  }

  return profile;
}

export function saveTasteProfile(profile: TasteProfile): void {
  try {
    profile.lastUpdated = Date.now();
    localStorage.setItem(TASTE_PROFILE_KEY, safeJsonStringify(profile, '{}'));
    notifyListeners(profile);
  } catch (err) {
    console.warn('[TasteProfile] Error saving profile:', err);
  }
}

/**
 * Calculates decayed affinity score taking time into account.
 * Recent listening within 2 hours is boosted 1.4x.
 * Older listening (> 48 hours) has a smooth half-life decay.
 */
export function getDecayedScore(affinity: ArtistAffinity): number {
  const now = Date.now();
  const elapsedMs = Math.max(0, now - affinity.lastListenedAt);
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  if (elapsedHours < 2) {
    return affinity.score * 1.4;
  }
  if (elapsedHours < 24) {
    return affinity.score * 1.1;
  }
  if (elapsedHours < 48) {
    return affinity.score * 0.9;
  }
  // Smooth exponential decay: half-life ~ 4 days
  const decay = Math.pow(0.5, elapsedHours / 96);
  return affinity.score * decay;
}

// Active session tracking state
let activeTrackSession: {
  track: Track;
  startTime: number;
  lastProgressSec: number;
  duration: number;
} | null = null;

/**
 * 1. Record Track Started event
 */
export function recordPlaybackStart(trackInput: Track): void {
  if (!trackInput || isDomOrEvent(trackInput)) return;
  const track = sanitizeTrack(trackInput);

  activeTrackSession = {
    track,
    startTime: Date.now(),
    lastProgressSec: 0,
    duration: track.duration || 210,
  };

  const profile = getStoredTasteProfile();
  const artistKey = getCleanArtistKey(track.artist);

  if (artistKey) {
    // Add to recent seed artists (moved to front)
    profile.recentSeedArtists = [
      track.artist,
      ...profile.recentSeedArtists.filter((a) => getCleanArtistKey(a) !== artistKey),
    ].slice(0, MAX_RECENT_ARTISTS);

    profile.dominantArtist = track.artist;

    if (!profile.artistAffinities[artistKey]) {
      profile.artistAffinities[artistKey] = {
        artist: track.artist,
        score: 1.5,
        playCount: 1,
        completionCount: 0,
        skipCount: 0,
        lastListenedAt: Date.now(),
        canonicalThumb: track.thumbnail,
        genre: track.category,
      };
    } else {
      profile.artistAffinities[artistKey].playCount += 1;
      profile.artistAffinities[artistKey].score += 0.5;
      profile.artistAffinities[artistKey].lastListenedAt = Date.now();
      if (track.thumbnail) {
        profile.artistAffinities[artistKey].canonicalThumb = track.thumbnail;
      }
    }

    if (track.category) {
      profile.genreAffinities[track.category] = (profile.genreAffinities[track.category] || 0) + 0.5;
      profile.dominantGenre = track.category;
    }
  }

  const event: PlaybackEvent = {
    type: 'start',
    trackId: track.id,
    artist: track.artist,
    title: track.title,
    genre: track.category,
    duration: track.duration || 210,
    listenedSeconds: 0,
    completionRatio: 0,
    timestamp: Date.now(),
  };

  profile.recentEvents = [event, ...profile.recentEvents].slice(0, MAX_EVENTS);
  saveTasteProfile(profile);
}

/**
 * 2. Record Track Progress
 */
export function recordPlaybackProgress(trackInput: Track, currentSeconds: number, totalDuration: number): void {
  if (!activeTrackSession || activeTrackSession.track.id !== trackInput?.id) {
    if (trackInput && !isDomOrEvent(trackInput)) {
      activeTrackSession = {
        track: sanitizeTrack(trackInput),
        startTime: Date.now(),
        lastProgressSec: currentSeconds,
        duration: totalDuration || 210,
      };
    }
    return;
  }
  activeTrackSession.lastProgressSec = Math.max(activeTrackSession.lastProgressSec, currentSeconds);
}

/**
 * 3. Record Track Completed (+3.0 Affinity Boost)
 */
export function recordPlaybackComplete(trackInput: Track, listenedSeconds?: number): void {
  if (!trackInput || isDomOrEvent(trackInput)) return;
  const track = sanitizeTrack(trackInput);
  const dur = track.duration || activeTrackSession?.duration || 210;
  const played = typeof listenedSeconds === 'number' ? listenedSeconds : (activeTrackSession?.lastProgressSec || dur);

  const profile = getStoredTasteProfile();
  const artistKey = getCleanArtistKey(track.artist);

  if (artistKey && profile.artistAffinities[artistKey]) {
    profile.artistAffinities[artistKey].score += 3.0;
    profile.artistAffinities[artistKey].completionCount += 1;
    profile.artistAffinities[artistKey].lastListenedAt = Date.now();
  }

  if (track.category) {
    profile.genreAffinities[track.category] = (profile.genreAffinities[track.category] || 0) + 2.0;
  }

  const event: PlaybackEvent = {
    type: 'complete',
    trackId: track.id,
    artist: track.artist,
    title: track.title,
    genre: track.category,
    duration: dur,
    listenedSeconds: played,
    completionRatio: Math.min(1, played / Math.max(1, dur)),
    timestamp: Date.now(),
  };

  profile.recentEvents = [event, ...profile.recentEvents].slice(0, MAX_EVENTS);
  saveTasteProfile(profile);
  activeTrackSession = null;
}

/**
 * 4. Record Track Skipped
 * Early skip (< 25s or < 25%) applies a penalty (-2.0) and records a cooldown for that track.
 * Late skip (> 70%) is treated as a partial completion (+1.0).
 */
export function recordPlaybackSkip(trackInput: Track, positionSeconds: number, duration: number): void {
  if (!trackInput || isDomOrEvent(trackInput)) return;
  const track = sanitizeTrack(trackInput);
  const total = duration || track.duration || 210;
  const ratio = positionSeconds / Math.max(1, total);

  const profile = getStoredTasteProfile();
  const artistKey = getCleanArtistKey(track.artist);

  const isEarlySkip = positionSeconds < EARLY_SKIP_THRESHOLD_SECONDS || ratio < EARLY_SKIP_THRESHOLD_RATIO;

  if (artistKey && profile.artistAffinities[artistKey]) {
    profile.artistAffinities[artistKey].skipCount += 1;
    if (isEarlySkip) {
      // Early skip penalty
      profile.artistAffinities[artistKey].score = Math.max(0.1, profile.artistAffinities[artistKey].score - 2.0);
      profile.skippedTrackIds[track.id] = Date.now();
    } else if (ratio >= COMPLETION_RATIO_THRESHOLD) {
      // Meaningful listen before skip
      profile.artistAffinities[artistKey].score += 1.0;
    }
  }

  const event: PlaybackEvent = {
    type: 'skip',
    trackId: track.id,
    artist: track.artist,
    title: track.title,
    genre: track.category,
    duration: total,
    listenedSeconds: positionSeconds,
    completionRatio: ratio,
    timestamp: Date.now(),
  };

  profile.recentEvents = [event, ...profile.recentEvents].slice(0, MAX_EVENTS);
  saveTasteProfile(profile);
  activeTrackSession = null;
}

/**
 * 5. Record Replay (+3.5 Bonus)
 */
export function recordPlaybackReplay(trackInput: Track): void {
  if (!trackInput || isDomOrEvent(trackInput)) return;
  const track = sanitizeTrack(trackInput);

  const profile = getStoredTasteProfile();
  const artistKey = getCleanArtistKey(track.artist);

  if (artistKey && profile.artistAffinities[artistKey]) {
    profile.artistAffinities[artistKey].score += 3.5;
    profile.artistAffinities[artistKey].lastListenedAt = Date.now();
  }

  const event: PlaybackEvent = {
    type: 'replay',
    trackId: track.id,
    artist: track.artist,
    title: track.title,
    genre: track.category,
    duration: track.duration || 210,
    listenedSeconds: 0,
    completionRatio: 0,
    timestamp: Date.now(),
  };

  profile.recentEvents = [event, ...profile.recentEvents].slice(0, MAX_EVENTS);
  saveTasteProfile(profile);
}

/**
 * 6. Record Favorite (+4.0 Bonus)
 */
export function recordTasteFavorite(trackInput: Track): void {
  if (!trackInput || isDomOrEvent(trackInput)) return;
  const track = sanitizeTrack(trackInput);

  const profile = getStoredTasteProfile();
  const artistKey = getCleanArtistKey(track.artist);

  if (artistKey) {
    if (!profile.artistAffinities[artistKey]) {
      profile.artistAffinities[artistKey] = {
        artist: track.artist,
        score: 4.0,
        playCount: 1,
        completionCount: 1,
        skipCount: 0,
        lastListenedAt: Date.now(),
        canonicalThumb: track.thumbnail,
        genre: track.category,
      };
    } else {
      profile.artistAffinities[artistKey].score += 4.0;
    }
  }

  const event: PlaybackEvent = {
    type: 'favorite',
    trackId: track.id,
    artist: track.artist,
    title: track.title,
    genre: track.category,
    duration: track.duration || 210,
    listenedSeconds: 0,
    completionRatio: 1,
    timestamp: Date.now(),
  };

  profile.recentEvents = [event, ...profile.recentEvents].slice(0, MAX_EVENTS);
  saveTasteProfile(profile);
}

/**
 * 7. Record Click on Recommendation (+2.5 Bonus)
 */
export function recordRecommendationClick(trackInput: Track): void {
  if (!trackInput || isDomOrEvent(trackInput)) return;
  const track = sanitizeTrack(trackInput);

  const profile = getStoredTasteProfile();
  const artistKey = getCleanArtistKey(track.artist);

  if (artistKey && profile.artistAffinities[artistKey]) {
    profile.artistAffinities[artistKey].score += 2.5;
  }

  const event: PlaybackEvent = {
    type: 'recommendation_click',
    trackId: track.id,
    artist: track.artist,
    title: track.title,
    genre: track.category,
    duration: track.duration || 210,
    listenedSeconds: 0,
    completionRatio: 0,
    timestamp: Date.now(),
  };

  profile.recentEvents = [event, ...profile.recentEvents].slice(0, MAX_EVENTS);
  saveTasteProfile(profile);
}

/**
 * Returns user's top affinity artists sorted by decayed score
 */
export function getTopAffinityArtists(limit: number = 5): ArtistAffinity[] {
  const profile = getStoredTasteProfile();
  const list = Object.values(profile.artistAffinities);
  list.sort((a, b) => getDecayedScore(b) - getDecayedScore(a));
  return list.slice(0, limit);
}

// Meaningful Listen Threshold Configuration & Tracking
export const MEANINGFUL_LISTEN_THRESHOLD = 1; // 1 meaningful listen triggers adaptation
export const MEANINGFUL_LISTEN_MIN_SECONDS = 30; // 30 seconds threshold (industry standard)
export const MEANINGFUL_LISTEN_MIN_RATIO = 0.35; // or 35% of total song duration

let sessionMeaningfulListensCount = 0;

/**
 * Checks whether a playback session qualifies as a meaningful listen.
 * Follows industry streaming standards: >= 30 seconds or >= 35% of duration.
 */
export function isMeaningfulListen(listenedSeconds: number, totalDuration: number): boolean {
  if (typeof listenedSeconds !== 'number' || listenedSeconds <= 0) return false;
  if (listenedSeconds >= MEANINGFUL_LISTEN_MIN_SECONDS) return true;
  if (totalDuration > 0 && (listenedSeconds / totalDuration) >= MEANINGFUL_LISTEN_MIN_RATIO) return true;
  return false;
}

/**
 * Increments the meaningful listen count and returns true if threshold is met.
 */
export function checkAndIncrementMeaningfulListens(): boolean {
  sessionMeaningfulListensCount += 1;
  if (sessionMeaningfulListensCount >= MEANINGFUL_LISTEN_THRESHOLD) {
    sessionMeaningfulListensCount = 0;
    return true;
  }
  return false;
}

export function getMeaningfulListensCount(): number {
  return sessionMeaningfulListensCount;
}

export function resetMeaningfulListensCount(): void {
  sessionMeaningfulListensCount = 0;
}

/**
 * Records a meaningful listen for a track, boosts artist & genre affinity,
 * logs the playback event, saves the profile, and returns true if the threshold is met.
 */
export function recordMeaningfulListen(
  trackInput: Track,
  listenedSeconds: number,
  totalDuration: number
): boolean {
  if (!trackInput || isDomOrEvent(trackInput)) return false;
  const track = sanitizeTrack(trackInput);
  const dur = totalDuration || track.duration || 210;
  const ratio = Math.min(1, listenedSeconds / Math.max(1, dur));

  const profile = getStoredTasteProfile();
  const artistKey = getCleanArtistKey(track.artist);

  if (artistKey) {
    if (!profile.artistAffinities[artistKey]) {
      profile.artistAffinities[artistKey] = {
        artist: track.artist,
        score: 3.5,
        playCount: 1,
        completionCount: 1,
        skipCount: 0,
        lastListenedAt: Date.now(),
        canonicalThumb: track.thumbnail,
        genre: track.category,
      };
    } else {
      profile.artistAffinities[artistKey].score += 2.0;
      profile.artistAffinities[artistKey].playCount += 1;
      profile.artistAffinities[artistKey].lastListenedAt = Date.now();
    }

    // Prioritize in recent seed artists
    profile.recentSeedArtists = [
      track.artist,
      ...profile.recentSeedArtists.filter((a) => getCleanArtistKey(a) !== artistKey),
    ].slice(0, MAX_RECENT_ARTISTS);

    if (track.category) {
      profile.genreAffinities[track.category] = (profile.genreAffinities[track.category] || 0) + 1.5;
    }
  }

  const event: PlaybackEvent = {
    type: 'progress',
    trackId: track.id,
    artist: track.artist,
    title: track.title,
    genre: track.category,
    duration: dur,
    listenedSeconds,
    completionRatio: ratio,
    timestamp: Date.now(),
  };

  profile.recentEvents = [event, ...profile.recentEvents].slice(0, MAX_EVENTS);
  saveTasteProfile(profile);

  return checkAndIncrementMeaningfulListens();
}

/**
 * Manually broadcast a taste profile refresh event to trigger adaptive recommendation re-calculation.
 */
export function triggerAdaptiveRecommendationUpdate(reason: string = 'manual'): void {
  const profile = getStoredTasteProfile();
  notifyListeners(profile);
}

