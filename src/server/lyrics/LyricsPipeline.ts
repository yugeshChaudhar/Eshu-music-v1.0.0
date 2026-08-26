import { LyricsProvider, LyricsProviderResult, LyricsQuery } from './types';
import { EshuDbProvider } from './providers/EshuDbProvider';
import { LrclibProvider } from './providers/LrclibProvider';
import { parseArtistAndTitle, normalizeForSearch } from './normalize';

export class LyricsPipeline {
  private providers: LyricsProvider[];
  private serverCache = new Map<string, { result: LyricsProviderResult | null; timestamp: number }>();
  private CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

  constructor() {
    this.providers = [
      new EshuDbProvider(),
      new LrclibProvider(),
    ];
  }

  private getCacheKey(query: LyricsQuery): string {
    if (query.videoId) {
      return `yt_${query.videoId}`;
    }
    const normTitle = normalizeForSearch(query.title);
    const normArtist = normalizeForSearch(query.artist || '');
    return `meta_${normTitle}_${normArtist}`;
  }

  async resolveLyrics(query: LyricsQuery): Promise<LyricsProviderResult & { unavailable?: boolean }> {
    const { title: rawTitle, artist: rawArtist } = query;
    const { title, artist } = parseArtistAndTitle(rawTitle, rawArtist || '');
    const cleanQuery: LyricsQuery = {
      ...query,
      title,
      artist,
    };

    const cacheKey = this.getCacheKey(cleanQuery);
    const cached = this.serverCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      if (cached.result) {
        return cached.result;
      }
      return {
        synced: false,
        unavailable: true,
        source: 'None',
        trackName: title,
        artistName: artist,
      };
    }

    for (const provider of this.providers) {
      try {
        const result = await provider.getLyrics(cleanQuery);
        if (result && (result.syncedLyrics || result.plainLyrics)) {
          this.serverCache.set(cacheKey, { result, timestamp: Date.now() });
          return result;
        }
      } catch (err) {
        console.warn(`[LyricsPipeline] Provider ${provider.name} error:`, err);
      }
    }

    // No lyrics available - Never fabricate lyrics
    const unavailableResult: LyricsProviderResult & { unavailable: boolean } = {
      synced: false,
      unavailable: true,
      source: 'None',
      trackName: title,
      artistName: artist,
    };

    // Cache the negative lookup for 5 minutes to prevent hammering upstream APIs
    this.serverCache.set(cacheKey, { result: null, timestamp: Date.now() - (this.CACHE_TTL_MS - 300000) });

    return unavailableResult;
  }

  clearCache(title: string, artist?: string, videoId?: string) {
    if (videoId) {
      this.serverCache.delete(`yt_${videoId}`);
    }
    const normTitle = normalizeForSearch(title);
    const normArtist = normalizeForSearch(artist || '');
    this.serverCache.delete(`meta_${normTitle}_${normArtist}`);
  }
}

export const serverLyricsPipeline = new LyricsPipeline();
