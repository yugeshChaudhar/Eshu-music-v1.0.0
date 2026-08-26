import { LyricsProvider, LyricsProviderResult, LyricsQuery } from '../types';
import { parseArtistAndTitle, extractTitleVariants, normalizeForSearch } from '../normalize';

const LRCLIB_HEADERS = {
  'User-Agent': 'EshuMusic/2.0 (https://github.com/eshu-music-player; contact@eshu-music.app)',
  'Accept': 'application/json',
};

const REQUEST_TIMEOUT_MS = 6000;

export class LrclibProvider implements LyricsProvider {
  name = 'LRCLIB';

  async getLyrics(query: LyricsQuery): Promise<LyricsProviderResult | null> {
    const { title: rawTitle, artist: rawArtist, duration } = query;
    const { title, artist } = parseArtistAndTitle(rawTitle, rawArtist || '');
    const titleVariants = extractTitleVariants(title);

    // 1. Try exact match for all title variants (with & without duration)
    for (const tVar of titleVariants) {
      const exactMatch = await this.tryExactGet(tVar, artist, duration);
      if (exactMatch) return exactMatch;

      // If artist was provided, also try with just the track title if artist had multiple words/garbage
      if (artist) {
        const exactNoArtist = await this.tryExactGet(tVar, '', duration);
        if (exactNoArtist) return exactNoArtist;
      }
    }

    // 2. Try search queries on LRCLIB
    const searchQueries: string[] = [];
    if (artist && title) {
      searchQueries.push(`${title} ${artist}`);
    }
    for (const tVar of titleVariants) {
      searchQueries.push(tVar);
    }

    for (const q of searchQueries) {
      if (!q.trim()) continue;
      const searchMatch = await this.trySearch(q.trim(), title, artist, duration);
      if (searchMatch) return searchMatch;
    }

    return null;
  }

  private async fetchWithTimeout(url: string): Promise<Response | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: LRCLIB_HEADERS,
        signal: controller.signal,
      });
      clearTimeout(timer);
      return res;
    } catch {
      clearTimeout(timer);
      return null;
    }
  }

  private async tryExactGet(
    trackName: string,
    artistName: string,
    duration?: number
  ): Promise<LyricsProviderResult | null> {
    try {
      // First attempt: with duration if valid
      if (duration && duration > 0) {
        const params = new URLSearchParams({
          track_name: trackName,
        });
        if (artistName) params.append('artist_name', artistName);
        params.append('duration', Math.round(duration).toString());

        const res = await this.fetchWithTimeout(`https://lrclib.net/api/get?${params.toString()}`);
        if (res && res.ok) {
          const data = await res.json();
          if (data && (data.syncedLyrics || data.plainLyrics)) {
            return this.formatResult(data, trackName, artistName);
          }
        }
      }

      // Second attempt: without duration
      const paramsNoDur = new URLSearchParams({
        track_name: trackName,
      });
      if (artistName) paramsNoDur.append('artist_name', artistName);

      const res2 = await this.fetchWithTimeout(`https://lrclib.net/api/get?${paramsNoDur.toString()}`);
      if (res2 && res2.ok) {
        const data = await res2.json();
        if (data && (data.syncedLyrics || data.plainLyrics)) {
          return this.formatResult(data, trackName, artistName);
        }
      }
    } catch (err) {
      // Ignore network errors and continue to next strategy
    }
    return null;
  }

  private async trySearch(
    queryStr: string,
    originalTitle: string,
    originalArtist?: string,
    expectedDuration?: number
  ): Promise<LyricsProviderResult | null> {
    try {
      const url = `https://lrclib.net/api/search?q=${encodeURIComponent(queryStr)}`;
      const res = await this.fetchWithTimeout(url);
      if (!res || !res.ok) return null;

      const results = await res.json();
      if (!Array.isArray(results) || results.length === 0) return null;

      const normOrigTitle = normalizeForSearch(originalTitle);
      const normOrigArtist = originalArtist ? normalizeForSearch(originalArtist) : '';

      // Score and rank results for matching safety
      const scored = results
        .filter((r: any) => r && (r.syncedLyrics || r.plainLyrics))
        .map((item: any) => {
          let score = 0;
          const rTrack = normalizeForSearch(item.trackName || '');
          const rArtist = normalizeForSearch(item.artistName || '');

          // Prefer synced lyrics over plain lyrics
          if (item.syncedLyrics) score += 15;

          // Track name match
          if (rTrack === normOrigTitle) {
            score += 40;
          } else if (rTrack.includes(normOrigTitle) || normOrigTitle.includes(rTrack)) {
            score += 25;
          }

          // Artist match
          if (normOrigArtist && rArtist) {
            if (rArtist === normOrigArtist) {
              score += 30;
            } else if (rArtist.includes(normOrigArtist) || normOrigArtist.includes(rArtist)) {
              score += 15;
            }
          }

          // Duration check (if expectedDuration is available)
          if (expectedDuration && item.duration) {
            const diff = Math.abs(expectedDuration - item.duration);
            if (diff <= 5) score += 20;
            else if (diff <= 15) score += 10;
            else if (diff > 35) score -= 30; // penalize mismatched songs
          }

          return { item, score };
        })
        .filter(({ score }) => score >= 20) // Safety threshold to prevent wrong lyrics
        .sort((a, b) => b.score - a.score);

      if (scored.length > 0) {
        const best = scored[0].item;
        return this.formatResult(best, originalTitle, originalArtist);
      }
    } catch {
      // Ignore
    }
    return null;
  }

  private formatResult(data: any, fallbackTitle: string, fallbackArtist?: string): LyricsProviderResult {
    return {
      synced: Boolean(data.syncedLyrics && data.syncedLyrics.trim().length > 0),
      syncedLyrics: data.syncedLyrics || undefined,
      plainLyrics: data.plainLyrics || undefined,
      trackName: data.trackName || fallbackTitle,
      artistName: data.artistName || fallbackArtist,
      album: data.albumName,
      source: 'LRCLIB',
    };
  }
}
