import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { Track } from '../types';
import { ECHO_QUICK_PICKS, COUNTRY_CHARTS } from '../data/echoMusicData';
import { apiUrl, isNativeAndroid } from './apiConfig';

export interface SearchResponse {
  results: Track[];
  isDirectLink?: boolean;
  directTrack?: Track | null;
  source?: string;
}

// In-memory cache for fast repeated queries
const searchCache = new Map<string, Track[]>();
const resolvedVideoIdCache = new Map<string, string>();

function parseDurationString(str?: string): number {
  if (!str) return 210;
  const parts = str.split(':').map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return 210;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return 210;
}

/**
 * Check and extract YouTube videoId or playlistId from any text / link
 */
export function extractYouTubeInfo(input: string): { videoId?: string; playlistId?: string } {
  const trimmed = input.trim();
  if (!trimmed) return {};

  // Check 11-character direct video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return { videoId: trimmed };
  }

  // Playlist list= parameter
  const playlistMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
  const playlistId = playlistMatch ? playlistMatch[1] : undefined;

  // Video URL variations
  const videoMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i
  );
  const videoId = videoMatch ? videoMatch[1] : undefined;

  return { videoId, playlistId };
}

/**
 * Fetch oEmbed metadata directly from CORS-friendly noembed or YouTube oembed
 */
export async function fetchDirectYouTubeTrack(videoId: string): Promise<Track> {
  const defaultThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  try {
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    if (res.ok) {
      const data = await res.json();
      let cleanTitle = data.title || `YouTube Track (${videoId})`;
      let cleanArtist = data.author_name || 'YouTube Video';

      if (cleanTitle.includes(' - ')) {
        const parts = cleanTitle.split(' - ');
        cleanArtist = parts[0].trim();
        cleanTitle = parts.slice(1).join(' - ').trim();
      }

      return {
        id: videoId,
        title: cleanTitle,
        artist: cleanArtist,
        duration: 210,
        thumbnail: data.thumbnail_url || defaultThumbnail,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      };
    }
  } catch (err) {
    console.warn('noembed fetch failed:', err);
  }

  return {
    id: videoId,
    title: `YouTube Video (${videoId})`,
    artist: 'YouTube Audio',
    duration: 210,
    thumbnail: defaultThumbnail,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

/**
 * Direct YouTube Innertube search.
 * On native Android Capacitor, uses CapacitorHttp to bypass CORS natively.
 * Returns playable tracks with genuine 11-char YouTube video IDs.
 */
export async function searchDirectYouTube(query: string): Promise<Track[]> {
  try {
    const payload = {
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20240313.01.00',
          hl: 'en',
          gl: 'US',
        },
      },
      query,
    };

    let data: any = null;
    const url = 'https://www.youtube.com/youtubei/v1/search';

    if (isNativeAndroid() && Capacitor.isNativePlatform()) {
      try {
        console.log('[EshuMusic Search] Querying direct YouTube via CapacitorHttp native transport');
        const nativeRes = await CapacitorHttp.request({
          url,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
          data: payload,
        });
        console.log('[EshuMusic Search] CapacitorHttp YouTube status:', nativeRes.status);
        if (nativeRes.status === 200) {
          data = typeof nativeRes.data === 'string' ? JSON.parse(nativeRes.data) : nativeRes.data;
        }
      } catch (err) {
        console.warn('[EshuMusic Search] Native CapacitorHttp search failed, falling back to fetch:', err);
      }
    }

    if (!data) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6500);
      const res = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
        body: JSON.stringify(payload),
      });
      clearTimeout(timeout);
      console.log('[EshuMusic Search] Direct YouTube fetch status:', res.status);
      if (res.ok) {
        data = await res.json();
      }
    }

    if (!data) return [];

    const sections =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

    const results: Track[] = [];

    for (const section of sections) {
      const items = section?.itemSectionRenderer?.contents || [];
      for (const item of items) {
        if (item.videoRenderer) {
          const v = item.videoRenderer;
          const videoId = v.videoId;
          if (!videoId) continue;

          let title =
            v.title?.runs?.[0]?.text ||
            v.title?.simpleText ||
            'Unknown Track';
          let artist =
            v.ownerText?.runs?.[0]?.text ||
            v.shortBylineText?.runs?.[0]?.text ||
            'YouTube Artist';

          const durationStr = v.lengthText?.simpleText || v.lengthText?.runs?.[0]?.text;
          const duration = parseDurationString(durationStr);
          const views = v.viewCountText?.simpleText || v.shortViewCountText?.simpleText;

          if (title.includes(' - ') && artist.toLowerCase().includes('topic')) {
            const split = title.split(' - ');
            artist = split[0].trim();
            title = split.slice(1).join(' - ').trim();
          }

          results.push({
            id: videoId,
            title,
            artist,
            duration,
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            views,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          });

          if (results.length >= 25) break;
        }
      }
      if (results.length >= 25) break;
    }

    return results;
  } catch (err) {
    console.warn('[EshuMusic Search] Direct YouTube search error:', err);
    return [];
  }
}

/**
 * Try searching via Invidious / Piped public instances (CORS enabled)
 */
async function searchInvidiousInstances(query: string): Promise<Track[]> {
  const instances = [
    'https://invidious.nerdvpn.de/api/v1/search',
    'https://yt.drgnz.club/api/v1/search',
    'https://invidious.private.coffee/api/v1/search',
    'https://invidious.jing.rocks/api/v1/search',
  ];

  for (const baseUrl of instances) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const url = `${baseUrl}?q=${encodeURIComponent(query)}&type=video&page=1`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items) && items.length > 0) {
          const tracks: Track[] = [];
          for (const item of items) {
            if (item.videoId && item.title) {
              let cleanTitle = item.title;
              let cleanArtist = item.author || 'YouTube Artist';

              if (cleanTitle.includes(' - ') && cleanArtist.toLowerCase().includes('topic')) {
                const parts = cleanTitle.split(' - ');
                cleanArtist = parts[0].trim();
                cleanTitle = parts.slice(1).join(' - ').trim();
              }

              tracks.push({
                id: item.videoId,
                title: cleanTitle,
                artist: cleanArtist,
                duration: item.lengthSeconds || 210,
                thumbnail: item.videoThumbnails?.[0]?.url || `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
                views: item.viewCountText || (item.viewCount ? `${(item.viewCount / 1000).toFixed(0)}K views` : undefined),
                videoUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
              });
            }
          }
          if (tracks.length > 0) return tracks;
        }
      }
    } catch {
      // Continue to next instance
    }
  }
  return [];
}

/**
 * Search via Apple Music / iTunes Search API (100% uptime, CORS-safe everywhere)
 */
async function searchITunesAPI(query: string): Promise<Track[]> {
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=25`;
    const res = await fetch(itunesUrl);
    console.log('[EshuMusic Search] iTunes search response status:', res.status);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        return data.results.map((item: any) => ({
          id: `itunes_${item.trackId}`,
          title: item.trackName || 'Song',
          artist: item.artistName || 'Artist',
          album: item.collectionName,
          duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210,
          thumbnail: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb') || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
          category: item.primaryGenreName,
          views: 'Apple Music Track',
        }));
      }
    }
  } catch (err) {
    console.warn('[EshuMusic Search] iTunes search failed:', err);
  }
  return [];
}

/**
 * Filter static fallback tracks (country charts & quick picks)
 */
function searchStaticCatalog(query: string): Track[] {
  const q = query.toLowerCase().trim();
  const allChartTracks = Object.values(COUNTRY_CHARTS || {}).flatMap(
    (c) => (c && Array.isArray(c.tracks) ? c.tracks : [])
  );
  const allStatic: Track[] = [
    ...(Array.isArray(ECHO_QUICK_PICKS) ? ECHO_QUICK_PICKS : []),
    ...allChartTracks,
  ];

  const unique = Array.from(new Map(allStatic.map((t) => [t.id, t])).values());

  return unique.filter((t) => {
    return (
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      (t.album && t.album.toLowerCase().includes(q))
    );
  });
}

/**
 * Main Universal Search Function (Works seamlessly on Web and native Android)
 */
export async function universalSearch(query: string): Promise<SearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { results: [] };
  }

  // 1. Direct YouTube link or ID detection
  const ytInfo = extractYouTubeInfo(trimmed);
  if (ytInfo.videoId) {
    const directTrack = await fetchDirectYouTubeTrack(ytInfo.videoId);
    return {
      results: [directTrack],
      isDirectLink: true,
      directTrack,
      source: 'youtube-direct',
    };
  }

  // Check cache
  const cacheKey = trimmed.toLowerCase();
  if (searchCache.has(cacheKey)) {
    return {
      results: searchCache.get(cacheKey)!,
      source: 'cache',
    };
  }

  // 2. Try configured backend API /api/search (if apiUrl is valid and not empty)
  const backendSearchUrl = apiUrl(`/api/search?q=${encodeURIComponent(trimmed)}`);
  if (backendSearchUrl) {
    try {
      console.log('[EshuMusic Search] Requesting backend search URL:', backendSearchUrl);
      const apiRes = await fetch(backendSearchUrl);
      console.log('[EshuMusic Search] Backend search status:', apiRes.status);
      const contentType = apiRes.headers.get('content-type') || '';
      if (apiRes.ok && contentType.includes('application/json')) {
        const data = await apiRes.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          const formatted: Track[] = data.results.map((item: any) => ({
            id: item.id,
            title: item.title,
            artist: item.artist || 'YouTube Artist',
            album: item.album,
            duration: item.duration || 210,
            thumbnail: item.thumbnail || `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
            views: item.views,
            videoUrl: item.videoUrl || `https://www.youtube.com/watch?v=${item.id}`,
          }));

          searchCache.set(cacheKey, formatted);
          return {
            results: formatted,
            isDirectLink: data.isDirectLink,
            directTrack: data.isDirectLink ? formatted[0] : null,
            source: 'backend-api',
          };
        }
      }
    } catch (err) {
      console.warn('[EshuMusic Search] Backend search API unavailable:', err);
    }
  }

  // 3. Direct YouTube Search via Innertube (works natively on Android via CapacitorHttp)
  const ytResults = await searchDirectYouTube(trimmed);
  if (ytResults.length > 0) {
    console.log('[EshuMusic Search] Direct YouTube search succeeded with', ytResults.length, 'tracks');
    searchCache.set(cacheKey, ytResults);
    return {
      results: ytResults,
      source: 'youtube-live',
    };
  }

  // 4. Try Invidious / Piped direct live YouTube search
  const invidiousResults = await searchInvidiousInstances(trimmed);
  if (invidiousResults.length > 0) {
    searchCache.set(cacheKey, invidiousResults);
    return {
      results: invidiousResults,
      source: 'invidious-live',
    };
  }

  // 5. Try iTunes / Apple Music search API
  const itunesResults = await searchITunesAPI(trimmed);
  if (itunesResults.length > 0) {
    searchCache.set(cacheKey, itunesResults);
    return {
      results: itunesResults,
      source: 'itunes-music',
    };
  }

  // 6. Fallback to bundled catalog
  const staticResults = searchStaticCatalog(trimmed);
  searchCache.set(cacheKey, staticResults);
  return {
    results: staticResults,
    source: 'static-catalog',
  };
}

/**
 * Resolve any track ID (e.g. itunes_123 or search title) to a real YouTube videoId
 */
export async function resolveRealVideoId(track: Track): Promise<string> {
  if (!track.id) return 'fJ9rUzIMcZQ';

  // If already standard 11-char YouTube ID, return directly
  if (/^[a-zA-Z0-9_-]{11}$/.test(track.id)) {
    return track.id;
  }

  // Check resolved cache
  const cacheKey = `${track.artist} - ${track.title}`.toLowerCase();
  if (resolvedVideoIdCache.has(cacheKey)) {
    return resolvedVideoIdCache.get(cacheKey)!;
  }

  console.log(`[EshuMusic Search] Resolving YouTube video ID for track: "${track.title}" by "${track.artist}"`);

  // Direct Innertube YouTube resolution
  try {
    const directResults = await searchDirectYouTube(`${track.artist} ${track.title} audio`);
    if (directResults.length > 0) {
      const best = directResults.find((t) => /^[a-zA-Z0-9_-]{11}$/.test(t.id));
      if (best) {
        console.log(`[EshuMusic Search] Successfully resolved "${track.title}" to YouTube ID: ${best.id}`);
        resolvedVideoIdCache.set(cacheKey, best.id);
        return best.id;
      }
    }
  } catch (err) {
    console.warn('[EshuMusic Search] Direct resolution search failed:', err);
  }

  // Secondary fallback: Universal search query
  try {
    const searchRes = await universalSearch(`${track.artist} ${track.title} audio`);
    if (searchRes.results && searchRes.results.length > 0) {
      const best = searchRes.results.find((t) => /^[a-zA-Z0-9_-]{11}$/.test(t.id));
      if (best) {
        console.log(`[EshuMusic Search] Universal search resolved "${track.title}" to YouTube ID: ${best.id}`);
        resolvedVideoIdCache.set(cacheKey, best.id);
        return best.id;
      }
    }
  } catch {}

  // Third fallback: Try searching static catalog for matching artist/title
  const staticMatch = searchStaticCatalog(`${track.artist} ${track.title}`);
  if (staticMatch.length > 0 && /^[a-zA-Z0-9_-]{11}$/.test(staticMatch[0].id)) {
    return staticMatch[0].id;
  }

  console.warn(`[EshuMusic Search] Unable to resolve YouTube video ID for "${track.title}", using safe fallback video`);
  return 'fJ9rUzIMcZQ';
}

/**
 * Fetch autocomplete suggestions (works with Google Suggest CORS / JSONP fallback)
 */
export async function fetchLiveSearchSuggestions(query: string): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // Try local /api/search/suggestions if backend is available
  const suggestionsUrl = apiUrl(`/api/search/suggestions?q=${encodeURIComponent(trimmed)}`);
  if (suggestionsUrl) {
    try {
      const res = await fetch(suggestionsUrl);
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          return data.suggestions.slice(0, 6);
        }
      }
    } catch {}
  }

  // Fallback to Google YouTube suggestions API (supports JSON client=firefox)
  try {
    const googleUrl = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(trimmed)}`;
    const gRes = await fetch(googleUrl);
    if (gRes.ok) {
      const data = await gRes.json();
      if (Array.isArray(data) && Array.isArray(data[1])) {
        return data[1].slice(0, 6);
      }
    }
  } catch {}

  return [];
}
