import { Track } from '../types';
import { ECHO_QUICK_PICKS, COUNTRY_CHARTS, ECHO_TOP_ARTISTS } from '../data/echoMusicData';

export interface SearchResponse {
  results: Track[];
  isDirectLink?: boolean;
  directTrack?: Track | null;
  source?: string;
}

// In-memory cache for fast repeated queries
const searchCache = new Map<string, Track[]>();
const resolvedVideoIdCache = new Map<string, string>();

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
      const timeout = setTimeout(() => controller.abort(), 3500);

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
    console.warn('iTunes search failed:', err);
  }
  return [];
}

/**
 * Filter static fallback tracks (country charts & quick picks)
 */
function searchStaticCatalog(query: string): Track[] {
  const q = query.toLowerCase().trim();
  const allStatic: Track[] = [
    ...ECHO_QUICK_PICKS,
    ...COUNTRY_CHARTS.GLOBAL.tracks,
    ...COUNTRY_CHARTS.IN.tracks,
    ...COUNTRY_CHARTS.US.tracks,
    ...COUNTRY_CHARTS.UK.tracks,
    ...COUNTRY_CHARTS.KR.tracks,
    ...COUNTRY_CHARTS.JP.tracks,
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
 * Main Universal Search Function (Works everywhere: Vercel, Node, Static)
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

  // 2. Try Node/Vercel /api/search endpoint first
  try {
    const apiRes = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
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
    // Backend endpoint not responding or returning HTML on static Vercel
  }

  // 3. Try Invidious / Piped direct live YouTube search
  const invidiousResults = await searchInvidiousInstances(trimmed);
  if (invidiousResults.length > 0) {
    searchCache.set(cacheKey, invidiousResults);
    return {
      results: invidiousResults,
      source: 'invidious-live',
    };
  }

  // 4. Try iTunes / Apple Music search API
  const itunesResults = await searchITunesAPI(trimmed);
  if (itunesResults.length > 0) {
    searchCache.set(cacheKey, itunesResults);
    return {
      results: itunesResults,
      source: 'itunes-music',
    };
  }

  // 5. Fallback to bundled catalog
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

  // Query search for the title and artist
  try {
    const searchRes = await universalSearch(`${track.artist} ${track.title} audio`);
    if (searchRes.results && searchRes.results.length > 0) {
      const best = searchRes.results.find((t) => /^[a-zA-Z0-9_-]{11}$/.test(t.id));
      if (best) {
        resolvedVideoIdCache.set(cacheKey, best.id);
        return best.id;
      }
    }
  } catch {}

  // Secondary fallback: Try searching static catalog for matching artist/title
  const staticMatch = searchStaticCatalog(`${track.artist} ${track.title}`);
  if (staticMatch.length > 0 && /^[a-zA-Z0-9_-]{11}$/.test(staticMatch[0].id)) {
    return staticMatch[0].id;
  }

  return 'fJ9rUzIMcZQ';
}

/**
 * Fetch autocomplete suggestions (works with Google Suggest CORS / JSONP fallback)
 */
export async function fetchLiveSearchSuggestions(query: string): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // Try local /api/search/suggestions
  try {
    const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(trimmed)}`);
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        return data.suggestions.slice(0, 6);
      }
    }
  } catch {}

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
