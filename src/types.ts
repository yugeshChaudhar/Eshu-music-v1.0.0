export type TabType = 'home' | 'search' | 'podcasts' | 'library' | 'equalizer' | 'analytics' | 'settings';

export type ThemeMode = 
  | 'echo-coral'
  | 'amoled-noir' 
  | 'material-dynamic'
  | 'liquid-glass' 
  | 'solarized'
  | 'clean-light'
  | 'simp-dark'
  | 'amoled'
  | 'warm-dark'
  | 'twilight-indigo'
  | 'cyber-noir'
  | 'dynamic-glow';

export type PlayerViewMode = 'artwork' | 'canvas' | 'visualizer' | 'vinyl' | 'lyrics' | 'video';

export interface Track {
  id: string; // YouTube videoId or unique ID
  title: string;
  artist: string;
  artists?: { name: string; id?: string }[];
  album?: string;
  albumId?: string;
  duration: number; // in seconds
  thumbnail: string;
  videoUrl?: string;
  views?: string;
  explicit?: boolean;
  likeCount?: number;
  dislikeCount?: number;
  category?: string;
  isOffline?: boolean;
  addedAt?: number;
  canvasVideoUrl?: string;
  bitrate?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  trackCount: number;
  tracks: Track[];
  author?: string;
  isCustom?: boolean;
  isYouTubeImported?: boolean;
  createdAt?: number;
  color?: string;
}

export interface YouTubeUserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
  accessToken?: string;
  expiresAt?: number;
  playlistsCount?: number;
}

export interface Artist {
  id: string;
  name: string;
  thumbnail: string;
  subscribers?: string;
  monthlyListeners?: string;
  topTracks: Track[];
  albums: { id: string; title: string; year: string; thumbnail: string; trackCount: number }[];
  singles: Track[];
  similarArtists?: { id: string; name: string; thumbnail: string }[];
  bio?: string;
  verified?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  year: string;
  thumbnail: string;
  tracks: Track[];
  description?: string;
}

export interface MoodCategory {
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  color: string;
  playlistId: string;
  iconName: string;
  tags: string[];
  tracks?: Track[];
}

export interface PodcastEpisode {
  id: string;
  title: string;
  showTitle: string;
  channelName: string;
  thumbnail: string;
  duration: number; // in seconds
  publishedAt: string;
  description: string;
  videoId: string;
  listenedProgress?: number; // seconds
}

export interface PodcastShow {
  id: string;
  title: string;
  author: string;
  description: string;
  thumbnail: string;
  genre: string;
  episodesCount: number;
  episodes: PodcastEpisode[];
}

// AutoEq & Equalizer
export interface AutoEqProfile {
  id: string;
  name: string;
  brand: string;
  type: 'In-Ear' | 'Over-Ear' | 'Earbuds';
  targetCurve: string;
  gains: number[]; // 10 band gains
}

export type EqualizerPreset = 
  | 'flat' 
  | 'bass-boost' 
  | 'treble-boost'
  | 'vocal' 
  | 'acoustic' 
  | 'rock' 
  | 'electronic' 
  | 'chill'
  | 'hip-hop'
  | 'jazz'
  | 'dance'
  | 'pop';

export interface EqualizerBands {
  bass: number; // -12 to +12 dB
  lowMid: number;
  mid: number;
  highMid: number;
  treble: number;
}

export interface TenBandEqualizer {
  b31: number;
  b62: number;
  b125: number;
  b250: number;
  b500: number;
  b1k: number;
  b2k: number;
  b4k: number;
  b8k: number;
  b16k: number;
}

// Compatibility types for legacy utilities
export type ViewMode = 'vinyl' | 'ambient' | 'zen' | 'video';

export interface Station {
  id: string;
  name: string;
  category: string;
  playlistId?: string;
  videoId?: string;
  description: string;
  coverUrl: string;
  tag: string;
  color: string;
  isCustom?: boolean;
  isOffline?: boolean;
}

export interface CustomPlaylist {
  id: string;
  name: string;
  playlistId?: string;
  videoId?: string;
  url?: string;
  description?: string;
  coverUrl?: string;
  createdAt?: number;
}

export interface TrackMetadata {
  title: string;
  author?: string;
  artist?: string;
  videoId?: string;
  duration?: number;
  durationSeconds?: number;
  currentSeconds?: number;
  thumbnail?: string;
  liveStatus?: string;
  isOfflineSource?: boolean;
  playlistIndex?: number;
}

export interface LyricsLine {
  time?: number; // timestamp in seconds (e.g. 5.2)
  timeMs: number; // timestamp in milliseconds (e.g. 5200)
  text: string;
  translation?: string;
}

export interface LyricsRecord {
  id: string;
  songId?: string;
  title: string;
  artist: string;
  album?: string;
  language?: 'Nepali' | 'English' | 'Hindi' | 'Other' | string;
  plainLyrics?: string;
  syncedLyrics?: string;
  source: 'ESHU Database' | 'LRCLIB' | 'Gemini AI' | 'Admin Upload' | 'Manual' | string;
  createdAt: number | string;
  updatedAt: number | string;
}

export interface LyricsData {
  id?: string;
  songId?: string;
  synced: boolean;
  lines: LyricsLine[];
  plainLyrics?: string;
  syncedLyrics?: string;
  source?: string;
  language?: string;
  trackName?: string;
  artistName?: string;
  album?: string;
  isCustom?: boolean;
  unavailable?: boolean;
}

export interface SleepTimerState {
  active: boolean;
  totalMinutes: number;
  remainingSeconds: number;
  fadeOut: boolean;
}

export interface SponsorSegment {
  category: string;
  segment: [number, number]; // [startSeconds, endSeconds]
}

export interface PlayQueueItem {
  track: Track;
  originalIndex: number;
  uid: string;
}

export interface UserStats {
  totalListeningSeconds: number;
  totalPlays: number;
  topTracks: { track: Track; playCount: number }[];
  topArtists: { artist: string; playCount: number; thumbnail?: string }[];
  recentPlays: { track: Track; timestamp: number }[];
}

export interface EchoSettings {
  audioQuality: 'high-256' | 'medium-160' | 'low-96' | 'high' | 'normal' | 'low';
  theme: ThemeMode;
  seedColor: string;
  sponsorBlockEnabled: boolean;
  sponsorBlockCategories: string[];
  lyricsSource: 'lrclib' | 'simpmusic' | 'all';
  aiLyricsTranslation: boolean;
  spotifyCanvasEnabled: boolean;
  backgroundPlayEnabled: boolean;
  crossfadeSeconds: number;
  gaplessPlayback: boolean;
  audioNormalization: boolean;
  equalizerPreset: EqualizerPreset;
  equalizerBands: EqualizerBands;
  tenBandEq: TenBandEqualizer;
  autoEqProfileId: string | null;
  showDislikes: boolean;
  streamDataSaver: boolean;
  selectedCountryChart: string;
  discordRpcEnabled: boolean;
  lastfmScrobbleEnabled: boolean;
}

export type SimpSettings = EchoSettings;
