import { Track, Playlist, SimpSettings, UserStats } from '../types';

const STORAGE_KEYS = {
  FAVORITES: 'simpmusic_favorites_v1',
  PLAYLISTS: 'simpmusic_playlists_v1',
  HISTORY: 'simpmusic_history_v1',
  STATS: 'simpmusic_stats_v1',
  FOLLOWED_ARTISTS: 'simpmusic_artists_v1',
  SETTINGS: 'simpmusic_settings_v1',
};

export const DEFAULT_SETTINGS: SimpSettings = {
  audioQuality: 'high',
  theme: 'echo-coral',
  seedColor: '#FF5252',
  sponsorBlockEnabled: true,
  sponsorBlockCategories: ['sponsor', 'intro', 'outro', 'music_offtopic'],
  lyricsSource: 'all',
  aiLyricsTranslation: false,
  spotifyCanvasEnabled: true,
  backgroundPlayEnabled: true,
  crossfadeSeconds: 4,
  gaplessPlayback: true,
  audioNormalization: true,
  equalizerPreset: 'flat',
  equalizerBands: {
    bass: 0,
    lowMid: 0,
    mid: 0,
    highMid: 0,
    treble: 0,
  },
  tenBandEq: {
    b31: 0,
    b62: 0,
    b125: 0,
    b250: 0,
    b500: 0,
    b1k: 0,
    b2k: 0,
    b4k: 0,
    b8k: 0,
    b16k: 0,
  },
  autoEqProfileId: null,
  showDislikes: true,
  streamDataSaver: false,
  selectedCountryChart: 'GLOBAL',
  discordRpcEnabled: false,
  lastfmScrobbleEnabled: false,
};

// 1. Favorites
export function getFavoriteTracks(): Track[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isTrackFavorite(trackId: string): boolean {
  const favs = getFavoriteTracks();
  return favs.some((t) => t.id === trackId);
}

export function toggleTrackFavorite(track: Track): boolean {
  const favs = getFavoriteTracks();
  const index = favs.findIndex((t) => t.id === track.id);
  let isNowFav = false;
  if (index >= 0) {
    favs.splice(index, 1);
    isNowFav = false;
  } else {
    favs.unshift({ ...track, addedAt: Date.now() });
    isNowFav = true;
  }
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
  return isNowFav;
}

// 2. Playlists
export function getCustomPlaylists(): Playlist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomPlaylist(playlist: Playlist): void {
  const playlists = getCustomPlaylists();
  const existingIdx = playlists.findIndex((p) => p.id === playlist.id);
  if (existingIdx >= 0) {
    playlists[existingIdx] = playlist;
  } else {
    playlists.unshift(playlist);
  }
  localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
}

export function deleteCustomPlaylist(playlistId: string): void {
  const playlists = getCustomPlaylists().filter((p) => p.id !== playlistId);
  localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
}

export function addTrackToPlaylist(playlistId: string, track: Track): void {
  const playlists = getCustomPlaylists();
  const target = playlists.find((p) => p.id === playlistId);
  if (target) {
    if (!target.tracks.some((t) => t.id === track.id)) {
      target.tracks.push(track);
      target.trackCount = target.tracks.length;
      if (!target.thumbnail && track.thumbnail) {
        target.thumbnail = track.thumbnail;
      }
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    }
  }
}

// 3. User Listening Stats & History
export function recordTrackPlay(track: Track, listenedSeconds: number = 30): void {
  try {
    // 1. History
    const rawHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    let history: { track: Track; timestamp: number }[] = rawHistory ? JSON.parse(rawHistory) : [];
    history = history.filter((h) => h.track.id !== track.id);
    history.unshift({ track, timestamp: Date.now() });
    if (history.length > 50) history = history.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

    // 2. Stats
    const rawStats = localStorage.getItem(STORAGE_KEYS.STATS);
    const stats: UserStats = rawStats
      ? JSON.parse(rawStats)
      : {
          totalListeningSeconds: 0,
          totalPlays: 0,
          topTracks: [],
          topArtists: [],
          recentPlays: [],
        };

    stats.totalListeningSeconds += Math.max(listenedSeconds, 1);
    stats.totalPlays += 1;

    // Update track play count
    const tIdx = stats.topTracks.findIndex((item) => item.track.id === track.id);
    if (tIdx >= 0) {
      stats.topTracks[tIdx].playCount += 1;
    } else {
      stats.topTracks.push({ track, playCount: 1 });
    }
    stats.topTracks.sort((a, b) => b.playCount - a.playCount);

    // Update artist play count
    const aIdx = stats.topArtists.findIndex((item) => item.artist === track.artist);
    if (aIdx >= 0) {
      stats.topArtists[aIdx].playCount += 1;
    } else {
      stats.topArtists.push({ artist: track.artist, playCount: 1, thumbnail: track.thumbnail });
    }
    stats.topArtists.sort((a, b) => b.playCount - a.playCount);

    stats.recentPlays = history.slice(0, 20);
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.warn('Failed to record track play:', e);
  }
}

export function getUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    totalListeningSeconds: 0,
    totalPlays: 0,
    topTracks: [],
    topArtists: [],
    recentPlays: [],
  };
}

export function getListeningHistory(): { track: Track; timestamp: number }[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// 4. Followed Artists
export function getFollowedArtists(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLLOWED_ARTISTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFollowArtist(artistName: string): boolean {
  const list = getFollowedArtists();
  const idx = list.indexOf(artistName);
  let isFollowing = false;
  if (idx >= 0) {
    list.splice(idx, 1);
    isFollowing = false;
  } else {
    list.push(artistName);
    isFollowing = true;
  }
  localStorage.setItem(STORAGE_KEYS.FOLLOWED_ARTISTS, JSON.stringify(list));
  return isFollowing;
}

// 5. Settings
export function getSavedSettings(): SimpSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: SimpSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}
