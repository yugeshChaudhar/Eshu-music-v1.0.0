export interface LyricsQuery {
  title: string;
  artist?: string;
  duration?: number; // duration in seconds
  videoId?: string;  // YouTube videoId or unique identifier
  album?: string;
}

export interface LyricsProviderResult {
  id?: string;
  songId?: string;
  synced: boolean;
  syncedLyrics?: string;
  plainLyrics?: string;
  trackName?: string;
  artistName?: string;
  album?: string;
  language?: string;
  source: string;
  isCustom?: boolean;
}

export interface LyricsProvider {
  name: string;
  getLyrics(query: LyricsQuery): Promise<LyricsProviderResult | null>;
}
