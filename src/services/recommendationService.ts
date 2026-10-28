import { Track, Playlist } from '../types';
import { ECHO_QUICK_PICKS, COUNTRY_CHARTS, ECHO_TOP_ARTISTS } from '../data/echoMusicData';
import { 
  getStoredTasteProfile, 
  getTopAffinityArtists, 
  TasteProfile, 
  recordRecommendationClick 
} from './tasteProfileService';
import { apiUrl } from './apiConfig';

export interface DynamicQuickPicksResult {
  tracks: Track[];
  headline: string;
  subheadline: string;
  sourceType: 'now_playing' | 'artist_radio' | 'history' | 'favorites' | 'trending';
  seedArtist?: string;
  seedTrackTitle?: string;
  isLiveAdapting?: boolean;
}

// In-memory cache for fast, seamless transitions without duplicate network requests
const recommendationCache = new Map<string, { result: DynamicQuickPicksResult; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Invalidate cached recommendations to force live adaptive discovery re-run.
 * If seedArtist is provided, clears entries containing that artist; otherwise clears all.
 */
export function invalidateRecommendationCache(seedArtist?: string): void {
  if (seedArtist) {
    const cleanKey = seedArtist.toLowerCase().split(/[&,x+]/)[0].trim();
    for (const key of recommendationCache.keys()) {
      if (key.includes(cleanKey)) {
        recommendationCache.delete(key);
      }
    }
  } else {
    recommendationCache.clear();
  }
}

/**
 * Ensures artwork is a genuine high-resolution thumbnail.
 * Replaces generic Unsplash placeholders with authentic YouTube video thumbnails when an 11-char ID exists.
 */
export function getGenuineThumbnail(trackId: string, currentThumb?: string): string {
  if (
    currentThumb &&
    !currentThumb.includes('unsplash.com') &&
    (currentThumb.includes('ytimg.com') ||
      currentThumb.includes('googleusercontent.com') ||
      currentThumb.includes('mzstatic.com') ||
      currentThumb.startsWith('blob:') ||
      currentThumb.startsWith('data:'))
  ) {
    return currentThumb;
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(trackId)) {
    return `https://img.youtube.com/vi/${trackId}/hqdefault.jpg`;
  }
  return currentThumb || (trackId ? `https://img.youtube.com/vi/${trackId}/hqdefault.jpg` : '');
}

/**
 * Strips noise from song titles (e.g. "Official Music Video", "Lyric Video")
 */
export function cleanTitle(rawTitle: string): string {
  if (!rawTitle) return 'Track';
  return rawTitle
    .replace(/\s*[\(\[](?:Official\s*(?:Music\s*)?Video|Official\s*Audio|Official\s*Release|Lyric\s*Video|Full\s*Song|HQ|4K|HD|Audio|Video|Visualizer)[\)\]]/gi, '')
    .replace(/\s*-\s*Official\s*(?:Music\s*)?Video$/i, '')
    .trim();
}

export function cleanArtistName(rawArtist: string): string {
  if (!rawArtist) return 'Artist';
  return rawArtist
    .replace(/\s*-\s*topic$/i, '')
    .replace(/\s*VEVO$/i, '')
    .trim();
}

// Known genre & related artist map for enhanced discovery
const RELATED_ARTIST_MAP: Record<string, string[]> = {
  'the weeknd': ['Bruno Mars', 'Dua Lipa', 'Post Malone', 'Daft Punk', 'Ariana Grande'],
  'sajjan raj vaidya': ['Bipul Chettri', 'Tribal Rain', 'Sushant KC', 'Albatross', 'Arthur Gunn', 'Yabesh Thapa'],
  'bipul chettri': ['Sajjan Raj Vaidya', 'Tribal Rain', 'Sushant KC', 'Cobweb', '1974 AD'],
  'queen': ['Linkin Park', 'David Bowie', 'Led Zeppelin', 'Pink Floyd', 'Coldplay', 'The Beatles'],
  'linkin park': ['Queen', 'Evanescence', 'Three Days Grace', 'Papa Roach', 'Green Day', 'Foo Fighters'],
  'alan walker': ['Avicii', 'Marshmello', 'Martin Garrix', 'The Chainsmokers', 'Kygo', 'DJ Snake'],
  'ed sheeran': ['Shawn Mendes', 'Charlie Puth', 'Maroon 5', 'Lewis Capaldi', 'James Arthur'],
  'maroon 5': ['OneRepublic', 'Imagine Dragons', 'Bruno Mars', 'Coldplay', 'Ed Sheeran'],
  'imagine dragons': ['OneRepublic', 'Coldplay', 'Fall Out Boy', 'The Script', 'Maroon 5'],
  'onerepublic': ['Imagine Dragons', 'Coldplay', 'The Script', 'Maroon 5', 'Bastille'],
  'luis fonsi': ['Daddy Yankee', 'J Balvin', 'Bad Bunny', 'Maluma', 'Ozuna', 'Shakira'],
  'arijit singh': ['Pritam', 'Atif Aslam', 'Shreya Ghoshal', 'Jubin Nautiyal', 'Sachin-Jigar'],
  'yoasobi': ['Eve', 'Official HIGE DANDism', 'Kenshi Yonezu', 'Ado', 'King Gnu'],
  'kendrick lamar': ['Drake', 'J. Cole', 'Travis Scott', 'Kanye West', 'Eminem'],
  'coldplay': ['OneRepublic', 'The Script', 'Imagine Dragons', 'U2', 'Keane'],
  'daft punk': ['The Weeknd', 'Justice', 'Kavinsky', 'deadmau5', 'Avicii'],
};

/**
 * Gather all catalog tracks from bundled collections, ensuring authentic thumbnails and genuine IDs
 */
export function getAllCatalogTracks(customPlaylists: Playlist[] = [], favorites: Track[] = []): Track[] {
  const map = new Map<string, Track>();

  const sanitizeCatalogTrack = (t: Track, overrideArtist?: string): Track => ({
    ...t,
    artist: cleanArtistName(overrideArtist || t.artist),
    title: cleanTitle(t.title),
    thumbnail: getGenuineThumbnail(t.id, t.thumbnail),
  });

  // Default quick picks
  for (const t of ECHO_QUICK_PICKS) {
    if (t?.id) map.set(t.id, sanitizeCatalogTrack(t));
  }

  // Top artists' tracks
  for (const art of ECHO_TOP_ARTISTS) {
    for (const t of art.topTracks || []) {
      if (t?.id) map.set(t.id, sanitizeCatalogTrack(t, art.name));
    }
  }

  // Country charts
  for (const chart of Object.values(COUNTRY_CHARTS)) {
    for (const t of chart.tracks) {
      if (t?.id) map.set(t.id, sanitizeCatalogTrack(t));
    }
  }

  // Favorites
  for (const t of favorites) {
    if (t?.id) map.set(t.id, sanitizeCatalogTrack(t));
  }

  // Custom playlists
  for (const pl of customPlaylists) {
    for (const t of pl.tracks || []) {
      if (t?.id) map.set(t.id, sanitizeCatalogTrack(t));
    }
  }

  return Array.from(map.values());
}

/**
 * Live YouTube Search for Verified Playable Audio Tracks
 */
async function searchLiveYouTubeTracks(query: string, maxResults: number = 8): Promise<Track[]> {
  try {
    const url = apiUrl(`/api/search?q=${encodeURIComponent(query)}`);
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data.results)) return [];

    const tracks: Track[] = [];
    for (const item of data.results) {
      if (!item.id || !/^[a-zA-Z0-9_-]{11}$/.test(item.id)) continue;
      tracks.push({
        id: item.id,
        title: cleanTitle(item.title),
        artist: cleanArtistName(item.artist || 'YouTube Artist'),
        album: item.album,
        duration: typeof item.duration === 'number' && item.duration > 0 ? item.duration : 210,
        thumbnail: getGenuineThumbnail(item.id, item.thumbnail),
        videoUrl: `https://www.youtube.com/watch?v=${item.id}`,
        views: item.views,
      });
      if (tracks.length >= maxResults) break;
    }
    return tracks;
  } catch (err) {
    console.warn('[AdaptiveRecommendation] Live search failed for query:', query, err);
    return [];
  }
}

/**
 * Computes recommendations asynchronously with live audio verification, genuine artwork, and dynamic adaptation.
 */
export async function fetchAdaptiveRecommendations({
  currentTrack,
  history = [],
  favorites = [],
  customPlaylists = [],
  forceRefresh = false,
}: {
  currentTrack: Track | null;
  history?: { track: Track; timestamp: number }[];
  favorites?: Track[];
  customPlaylists?: Playlist[];
  forceRefresh?: boolean;
}): Promise<DynamicQuickPicksResult> {
  const profile = getStoredTasteProfile();
  const allCatalog = getAllCatalogTracks(customPlaylists, favorites);

  // 1. Identify primary seed artist and context
  let seedArtist = '';
  let headline = 'Discover Quick Picks';
  let subheadline = 'Trending hits and handpicked gems curated for your journey';
  let sourceType: DynamicQuickPicksResult['sourceType'] = 'trending';

  if (currentTrack?.artist) {
    seedArtist = cleanArtistName(currentTrack.artist);
    headline = `Similar to ${seedArtist}`;
    subheadline = `Live adaptive radio inspired by "${cleanTitle(currentTrack.title)}"`;
    sourceType = 'now_playing';
  } else if (profile.recentSeedArtists.length > 0) {
    seedArtist = profile.recentSeedArtists[0];
    headline = `Inspired by ${cleanArtistName(seedArtist)}`;
    subheadline = 'Personalized radio tuned to your recent listening journey';
    sourceType = 'history';
  } else if (history.length > 0 && history[0].track?.artist) {
    seedArtist = cleanArtistName(history[0].track.artist);
    headline = `Based on your recent listening`;
    subheadline = `Songs inspired by "${cleanTitle(history[0].track.title)}"`;
    sourceType = 'history';
  } else if (favorites.length > 0) {
    const randomFav = favorites[Math.floor(Math.random() * favorites.length)];
    seedArtist = cleanArtistName(randomFav.artist);
    headline = `From your Liked Songs & Curations`;
    subheadline = `Adaptive picks inspired by "${cleanTitle(randomFav.title)}"`;
    sourceType = 'favorites';
  }

  // Check cache for this seed
  const cleanSeedKey = seedArtist.toLowerCase().split(/[&,x+]/)[0].trim();
  const cacheKey = `${sourceType}:${cleanSeedKey}:${currentTrack?.id || 'idle'}`;
  if (!forceRefresh) {
    const cached = recommendationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.result;
    }
  } else {
    recommendationCache.delete(cacheKey);
  }

  const selectedMap = new Map<string, Track>();
  const skippedIds = new Set(Object.keys(profile.skippedTrackIds || {}));
  const currentId = currentTrack?.id;

  // Track artist counts to enforce diversity (Max 3 tracks per artist in tray)
  const artistTrackCounts: Record<string, number> = {};

  const canAddTrack = (t: Track, allowSameArtistMax: number = 3): boolean => {
    if (!t?.id || !/^[a-zA-Z0-9_-]{11}$/.test(t.id)) return false;
    if (t.id === currentId) return false;
    if (skippedIds.has(t.id)) return false;
    if (selectedMap.has(t.id)) return false;

    const artKey = t.artist.toLowerCase().trim();
    const count = artistTrackCounts[artKey] || 0;
    if (count >= allowSameArtistMax) return false;

    return true;
  };

  const addCandidate = (t: Track, maxForArtist: number = 3) => {
    if (canAddTrack(t, maxForArtist)) {
      selectedMap.set(t.id, {
        ...t,
        thumbnail: getGenuineThumbnail(t.id, t.thumbnail),
      });
      const artKey = t.artist.toLowerCase().trim();
      artistTrackCounts[artKey] = (artistTrackCounts[artKey] || 0) + 1;
    }
  };

  // STEP 2: Gather candidate tracks
  if (cleanSeedKey) {
    // 2a. Check if catalog has tracks for the seed artist
    const catalogSeedMatches = allCatalog.filter((t) =>
      t.artist.toLowerCase().includes(cleanSeedKey)
    );
    for (const t of catalogSeedMatches) {
      addCandidate(t, 2); // Max 2 from catalog seed
      if (selectedMap.size >= 8) break;
    }

    // 2b. Live YouTube search for seed artist top tracks
    if (selectedMap.size < 8) {
      const liveSeedTracks = await searchLiveYouTubeTracks(`${seedArtist} best songs audio`, 6);
      for (const t of liveSeedTracks) {
        addCandidate(t, 3); // Max 3 total from primary seed artist
        if (selectedMap.size >= 8) break;
      }
    }

    // 2c. Discover Related Artists (Diversity Engine)
    const relatedList = RELATED_ARTIST_MAP[cleanSeedKey] || [];
    for (const relArtist of relatedList) {
      if (selectedMap.size >= 8) break;

      // Check catalog for related artist
      const catalogRel = allCatalog.filter((t) =>
        t.artist.toLowerCase().includes(relArtist.toLowerCase())
      );
      for (const t of catalogRel) {
        addCandidate(t, 2);
        if (selectedMap.size >= 8) break;
      }

      // Live search for related artist if needed
      if (selectedMap.size < 6) {
        const liveRelTracks = await searchLiveYouTubeTracks(`${relArtist} songs audio`, 3);
        for (const t of liveRelTracks) {
          addCandidate(t, 2);
          if (selectedMap.size >= 8) break;
        }
      }
    }

    // 2d. Fill from User's Top Affinity Artists
    const topAffinities = getTopAffinityArtists(4);
    for (const aff of topAffinities) {
      if (selectedMap.size >= 8) break;
      if (aff.artist.toLowerCase().includes(cleanSeedKey)) continue;

      const catalogAff = allCatalog.filter((t) =>
        t.artist.toLowerCase().includes(aff.artist.toLowerCase())
      );
      for (const t of catalogAff) {
        addCandidate(t, 2);
        if (selectedMap.size >= 8) break;
      }
    }
  }

  // STEP 3: Fallback / Fill with Catalog Hits if still under 8 tracks
  if (selectedMap.size < 8) {
    // Fill with favorites first
    for (const fav of favorites) {
      addCandidate(fav, 2);
      if (selectedMap.size >= 8) break;
    }
  }

  if (selectedMap.size < 8) {
    // Fill with top catalog hits
    for (const cat of allCatalog) {
      addCandidate(cat, 1);
      if (selectedMap.size >= 8) break;
    }
  }

  // Final fallback to clean quick picks
  let finalTracks = Array.from(selectedMap.values()).slice(0, 8);
  if (finalTracks.length === 0) {
    finalTracks = ECHO_QUICK_PICKS.map((t) => ({
      ...t,
      thumbnail: getGenuineThumbnail(t.id, t.thumbnail),
    }));
  }

  const result: DynamicQuickPicksResult = {
    tracks: finalTracks,
    headline,
    subheadline,
    sourceType,
    seedArtist,
    seedTrackTitle: currentTrack?.title,
    isLiveAdapting: !!currentTrack,
  };

  // Cache the result
  recommendationCache.set(cacheKey, { result, timestamp: Date.now() });

  return result;
}

/**
 * Synchronous initial recommendation getter for immediate instant render without layout shift.
 */
export function getDynamicQuickPicks({
  currentTrack,
  history = [],
  favorites = [],
  customPlaylists = [],
}: {
  currentTrack: Track | null;
  history?: { track: Track; timestamp: number }[];
  favorites?: Track[];
  customPlaylists?: Playlist[];
}): DynamicQuickPicksResult {
  const profile = getStoredTasteProfile();
  const allTracks = getAllCatalogTracks(customPlaylists, favorites);
  const pickedMap = new Map<string, Track>();

  // Determine seed
  let seedArtist = '';
  let headline = 'Discover Quick Picks';
  let subheadline = 'Trending hits and audio gems handpicked for you';
  let sourceType: DynamicQuickPicksResult['sourceType'] = 'trending';

  if (currentTrack?.artist) {
    seedArtist = cleanArtistName(currentTrack.artist);
    headline = `Similar to ${seedArtist}`;
    subheadline = `Live adaptive radio inspired by "${cleanTitle(currentTrack.title)}"`;
    sourceType = 'now_playing';
  } else if (profile.recentSeedArtists.length > 0) {
    seedArtist = profile.recentSeedArtists[0];
    headline = `Inspired by ${cleanArtistName(seedArtist)}`;
    subheadline = 'Personalized radio tuned to your recent listening journey';
    sourceType = 'history';
  } else if (history.length > 0 && history[0]?.track?.artist) {
    seedArtist = cleanArtistName(history[0].track.artist);
    headline = `Based on your recent listening`;
    subheadline = `Songs inspired by "${cleanTitle(history[0].track.title)}"`;
    sourceType = 'history';
  } else if (favorites.length > 0) {
    headline = `From your Liked Songs & Curations`;
    subheadline = `Quick picks curated from tracks you love`;
    sourceType = 'favorites';
  }

  // Check memory cache
  const cleanSeedKey = seedArtist.toLowerCase().split(/[&,x+]/)[0].trim();
  const cacheKey = `${sourceType}:${cleanSeedKey}:${currentTrack?.id || 'idle'}`;
  const cached = recommendationCache.get(cacheKey);
  if (cached) {
    return cached.result;
  }

  // Build instant catalog tracks
  const skippedIds = new Set(Object.keys(profile.skippedTrackIds || {}));
  const currentId = currentTrack?.id;
  const artistCounts: Record<string, number> = {};

  const tryAdd = (t: Track, maxSame: number = 3) => {
    if (!t?.id || !/^[a-zA-Z0-9_-]{11}$/.test(t.id)) return;
    if (t.id === currentId || skippedIds.has(t.id) || pickedMap.has(t.id)) return;
    const aKey = t.artist.toLowerCase().trim();
    if ((artistCounts[aKey] || 0) >= maxSame) return;

    pickedMap.set(t.id, {
      ...t,
      thumbnail: getGenuineThumbnail(t.id, t.thumbnail),
    });
    artistCounts[aKey] = (artistCounts[aKey] || 0) + 1;
  };

  if (cleanSeedKey) {
    // Exact or partial artist matches from catalog
    const sameArtist = allTracks.filter((t) => t.artist.toLowerCase().includes(cleanSeedKey));
    sameArtist.forEach((t) => tryAdd(t, 3));

    // Related artists from catalog
    const related = RELATED_ARTIST_MAP[cleanSeedKey] || [];
    for (const rel of related) {
      if (pickedMap.size >= 8) break;
      const relMatches = allCatalogMatches(allTracks, rel);
      relMatches.forEach((t) => tryAdd(t, 2));
    }
  }

  // Fill with favorites
  for (const fav of favorites) {
    if (pickedMap.size >= 8) break;
    tryAdd(fav, 2);
  }

  // Fill with catalog
  for (const cat of allTracks) {
    if (pickedMap.size >= 8) break;
    tryAdd(cat, 1);
  }

  const tracks = Array.from(pickedMap.values()).slice(0, 8);

  return {
    tracks: tracks.length > 0 ? tracks : ECHO_QUICK_PICKS.map((t) => ({ ...t, thumbnail: getGenuineThumbnail(t.id, t.thumbnail) })),
    headline,
    subheadline,
    sourceType,
    seedArtist,
    isLiveAdapting: !!currentTrack,
  };
}

function allCatalogMatches(tracks: Track[], query: string): Track[] {
  const q = query.toLowerCase().trim();
  return tracks.filter((t) => t.artist.toLowerCase().includes(q) || t.title.toLowerCase().includes(q));
}
