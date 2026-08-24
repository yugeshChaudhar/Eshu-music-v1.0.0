import { 
  Track, 
  Playlist, 
  EchoSettings, 
  UserStats, 
  TenBandEqualizer, 
  EqualizerPreset
} from '../types';
import { EQUALIZER_PRESETS_10_BAND } from '../data/echoMusicData';

const FAVORITES_KEY = 'echo_music_favorites_v2';
const PLAYLISTS_KEY = 'echo_music_custom_playlists_v2';
const STATS_KEY = 'echo_music_stats_v2';
const SETTINGS_KEY = 'echo_music_settings_v2';
const HISTORY_KEY = 'echo_music_history_v2';
const ARTISTS_KEY = 'echo_music_followed_artists_v2';

export const DEFAULT_ECHO_SETTINGS: EchoSettings = {
  audioQuality: 'high-256',
  theme: 'echo-coral',
  seedColor: '#FF5252',
  sponsorBlockEnabled: true,
  sponsorBlockCategories: ['sponsor', 'selfpromo', 'interaction', 'intro', 'music_offtopic'],
  lyricsSource: 'lrclib',
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
  tenBandEq: EQUALIZER_PRESETS_10_BAND.flat,
  autoEqProfileId: null,
  showDislikes: true,
  streamDataSaver: false,
  selectedCountryChart: 'GLOBAL',
  discordRpcEnabled: false,
  lastfmScrobbleEnabled: false,
};

// 1. Liked Songs / Favorites
export function getFavoriteTracks(): Track[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY) || localStorage.getItem('simpmusic_favorites_v1');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get favorites', e);
    return [];
  }
}

export function isTrackFavorite(trackId: string): boolean {
  const list = getFavoriteTracks();
  return list.some((t) => t.id === trackId);
}

export function toggleTrackFavorite(track: Track): boolean {
  const current = getFavoriteTracks();
  const exists = current.some((t) => t.id === track.id);
  let updated: Track[];

  if (exists) {
    updated = current.filter((t) => t.id !== track.id);
  } else {
    updated = [{ ...track, addedAt: Date.now() }, ...current];
  }

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return !exists;
}

// 2. Custom Playlists
export function getCustomPlaylists(): Playlist[] {
  try {
    const raw = localStorage.getItem(PLAYLISTS_KEY) || localStorage.getItem('simpmusic_custom_playlists_v1');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get playlists', e);
    return [];
  }
}

export function saveCustomPlaylist(playlist: Playlist): void {
  const current = getCustomPlaylists();
  const existingIndex = current.findIndex((p) => p.id === playlist.id);
  let updated: Playlist[];

  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = playlist;
  } else {
    updated = [playlist, ...current];
  }

  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
}

export function deleteCustomPlaylist(playlistId: string): void {
  const current = getCustomPlaylists();
  const updated = current.filter((p) => p.id !== playlistId);
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
}

export function addTrackToPlaylist(playlistId: string, track: Track): boolean {
  const current = getCustomPlaylists();
  const playlist = current.find((p) => p.id === playlistId);
  if (!playlist) return false;

  const hasSong = playlist.tracks.some((t) => t.id === track.id);
  if (hasSong) return false;

  playlist.tracks.push(track);
  playlist.trackCount = playlist.tracks.length;
  saveCustomPlaylist(playlist);
  return true;
}

// 3. User Listening Stats & History
export function getUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY) || localStorage.getItem('simpmusic_stats_v1');
    if (!raw) {
      return {
        totalListeningSeconds: 14200,
        totalPlays: 48,
        topTracks: [],
        topArtists: [
          { artist: 'The Weeknd', playCount: 22, thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80' },
          { artist: 'Queen', playCount: 18, thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80' },
          { artist: 'Taylor Swift', playCount: 14, thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80' }
        ],
        recentPlays: [],
      };
    }
    return JSON.parse(raw);
  } catch (e) {
    return {
      totalListeningSeconds: 0,
      totalPlays: 0,
      topTracks: [],
      topArtists: [],
      recentPlays: [],
    };
  }
}

export function recordTrackPlay(track: Track, listenedSeconds: number = 30): void {
  try {
    const stats = getUserStats();
    stats.totalListeningSeconds += listenedSeconds;
    stats.totalPlays += 1;

    // Track counts
    const existingTrack = stats.topTracks.find((t) => t.track.id === track.id);
    if (existingTrack) {
      existingTrack.playCount += 1;
    } else {
      stats.topTracks.push({ track, playCount: 1 });
    }
    stats.topTracks.sort((a, b) => b.playCount - a.playCount);
    stats.topTracks = stats.topTracks.slice(0, 10);

    // Artist counts
    const existingArtist = stats.topArtists.find((a) => a.artist.toLowerCase() === track.artist.toLowerCase());
    if (existingArtist) {
      existingArtist.playCount += 1;
    } else {
      stats.topArtists.push({
        artist: track.artist,
        playCount: 1,
        thumbnail: track.thumbnail,
      });
    }
    stats.topArtists.sort((a, b) => b.playCount - a.playCount);
    stats.topArtists = stats.topArtists.slice(0, 8);

    localStorage.setItem(STATS_KEY, JSON.stringify(stats));

    // Update History
    const history = getListeningHistory();
    const newEntry = { track, timestamp: Date.now() };
    const filtered = history.filter((h) => h.track.id !== track.id);
    const updatedHistory = [newEntry, ...filtered].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error('Failed to record track play', e);
  }
}

export function getListeningHistory(): { track: Track; timestamp: number }[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY) || localStorage.getItem('simpmusic_history_v1');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// 4. Followed Artists
export function getFollowedArtists(): string[] {
  try {
    const raw = localStorage.getItem(ARTISTS_KEY) || localStorage.getItem('simpmusic_artists_v1');
    if (!raw) return ['The Weeknd', 'Queen'];
    return JSON.parse(raw);
  } catch (e) {
    return ['The Weeknd'];
  }
}

export function toggleFollowArtist(artistName: string): boolean {
  const current = getFollowedArtists();
  const exists = current.includes(artistName);
  let updated: string[];
  if (exists) {
    updated = current.filter((a) => a !== artistName);
  } else {
    updated = [...current, artistName];
  }
  localStorage.setItem(ARTISTS_KEY, JSON.stringify(updated));
  return !exists;
}

// 5. Echo Settings
export function getSavedSettings(): EchoSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY) || localStorage.getItem('simpmusic_settings_v1');
    if (!raw) return DEFAULT_ECHO_SETTINGS;
    return { ...DEFAULT_ECHO_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_ECHO_SETTINGS;
  }
}

export function saveSettings(settings: EchoSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// 6. Backup & Restore (Echo Music Migration compatibility)
export function exportEchoBackup(): string {
  const backup = {
    version: '5.2.8',
    exportedAt: new Date().toISOString(),
    appName: 'Echo Music',
    favorites: getFavoriteTracks(),
    playlists: getCustomPlaylists(),
    followedArtists: getFollowedArtists(),
    settings: getSavedSettings(),
    stats: getUserStats(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importEchoBackup(jsonString: string): { success: boolean; message: string; count: number } {
  try {
    const parsed = JSON.parse(jsonString);
    let count = 0;

    if (Array.isArray(parsed.favorites)) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(parsed.favorites));
      count += parsed.favorites.length;
    }

    if (Array.isArray(parsed.playlists)) {
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(parsed.playlists));
      count += parsed.playlists.length;
    }

    if (Array.isArray(parsed.followedArtists)) {
      localStorage.setItem(ARTISTS_KEY, JSON.stringify(parsed.followedArtists));
    }

    if (parsed.settings && typeof parsed.settings === 'object') {
      saveSettings({ ...DEFAULT_ECHO_SETTINGS, ...parsed.settings });
    }

    return {
      success: true,
      message: `Successfully imported ${count} items into Echo Music`,
      count,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Invalid backup file format',
      count: 0,
    };
  }
}
