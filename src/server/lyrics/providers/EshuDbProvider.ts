import { LyricsProvider, LyricsProviderResult, LyricsQuery } from '../types';
import { serverLyricsDb } from '../../lyricsDatabase';
import { parseArtistAndTitle, extractTitleVariants } from '../normalize';

export class EshuDbProvider implements LyricsProvider {
  name = 'ESHU Database';

  async getLyrics(query: LyricsQuery): Promise<LyricsProviderResult | null> {
    const { title: rawTitle, artist: rawArtist, videoId } = query;
    const { title, artist } = parseArtistAndTitle(rawTitle, rawArtist || '');

    // 1. Check direct videoId match if available
    if (videoId) {
      const match = serverLyricsDb.findMatch(title, artist, videoId);
      if (match && (match.syncedLyrics || match.plainLyrics)) {
        return {
          id: match.id,
          songId: match.songId || videoId,
          synced: Boolean(match.syncedLyrics && match.syncedLyrics.trim().length > 0),
          syncedLyrics: match.syncedLyrics,
          plainLyrics: match.plainLyrics,
          trackName: match.title,
          artistName: match.artist,
          album: match.album,
          language: match.language,
          source: match.source || 'ESHU Database',
          isCustom: true,
        };
      }
    }

    // 2. Check title variants (e.g. Devanagari vs Romanized)
    const titleVariants = extractTitleVariants(title);
    for (const variant of titleVariants) {
      const match = serverLyricsDb.findMatch(variant, artist, videoId);
      if (match && (match.syncedLyrics || match.plainLyrics)) {
        return {
          id: match.id,
          songId: match.songId || videoId,
          synced: Boolean(match.syncedLyrics && match.syncedLyrics.trim().length > 0),
          syncedLyrics: match.syncedLyrics,
          plainLyrics: match.plainLyrics,
          trackName: match.title,
          artistName: match.artist,
          album: match.album,
          language: match.language,
          source: match.source || 'ESHU Database',
          isCustom: true,
        };
      }
    }

    return null;
  }
}
