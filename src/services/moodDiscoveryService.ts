import { Track, MoodCategory } from '../types';
import { universalSearch } from './universalSearchService';
import { ECHO_QUICK_PICKS, COUNTRY_CHARTS } from '../data/echoMusicData';
import { safeJsonStringify, sanitizeTrack } from './echoStorage';

export interface MoodDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: 'Coffee' | 'Zap' | 'Brain' | 'Moon' | 'Disc3' | 'Heart' | 'Flame' | 'Headphones';
  color: string;
  gradient: string;
  coverUrl: string;
  tags: string[];
  searchQueries: string[];
  seedTracks: Track[];
}

export const MOOD_DEFINITIONS: MoodDefinition[] = [
  {
    id: 'mood-chill',
    title: 'Chill & Relax',
    subtitle: 'Acoustic, Lofi, Ambient, Downtempo',
    description: 'Unwind with mellow acoustic textures, dreamy lofi beats, peaceful late night vibes, and soothing ambient melodies.',
    iconName: 'Coffee',
    color: '#00BCD4',
    gradient: 'from-cyan-500/20 via-teal-500/10 to-transparent',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
    tags: ['Chill', 'Lofi', 'Acoustic', 'Ambient', 'Downtempo', 'Late Night', 'Mellow', 'Indie'],
    searchQueries: [
      'chill lofi music',
      'acoustic chill relax songs',
      'ambient relaxing music',
      'late night mellow indie chill',
      'peaceful coffee shop acoustic'
    ],
    seedTracks: [
      {
        id: '5qap5aO4i9A',
        title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
        artist: 'Lofi Girl',
        duration: 240,
        thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800',
        videoUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A'
      },
      ...ECHO_QUICK_PICKS.slice(0, 3)
    ]
  },
  {
    id: 'mood-workout',
    title: 'Workout & Energy',
    subtitle: 'Gym, EDM, Hype, Rock, Trap',
    description: 'High-BPM bangers, electrifying synthwave, hardstyle bass, and aggressive workout anthems to fuel your max motivation.',
    iconName: 'Zap',
    color: '#FF5252',
    gradient: 'from-red-500/20 via-orange-500/10 to-transparent',
    coverUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    tags: ['Gym', 'EDM', 'Hype', 'Rock', 'Trap', 'Hardstyle', 'Motivation', 'Drill'],
    searchQueries: [
      'gym workout motivation music',
      'high energy edm trap banger',
      'beast mode workout rock hype',
      'hardstyle drill bass workout',
      'running training pump up music'
    ],
    seedTracks: [
      {
        id: '2zToEPp4ghY',
        title: 'Workout Motivation Epic Bass EDM',
        artist: 'Gym Hype Records',
        duration: 220,
        thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
        videoUrl: 'https://www.youtube.com/watch?v=2zToEPp4ghY'
      },
      ...(COUNTRY_CHARTS?.GLOBAL?.tracks ? COUNTRY_CHARTS.GLOBAL.tracks.slice(0, 3) : [])
    ]
  },
  {
    id: 'mood-focus',
    title: 'Deep Focus & Study',
    subtitle: 'Coding, Study, Binaural, Minimal Techno',
    description: 'Enter a state of deep cognitive flow with instrumental rhythms, minimal ambient soundscapes, alpha waves, and concentration audio.',
    iconName: 'Brain',
    color: '#7C4DFF',
    gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
    coverUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
    tags: ['Coding', 'Study', 'Binaural', 'Minimal Techno', 'Deep Focus', 'Instrumental', 'Piano'],
    searchQueries: [
      'deep focus coding music minimal',
      'study concentration binaural alpha waves',
      'minimal techno deep focus instrumental',
      'lofi study deep focus piano',
      'productivity ambient electronic study'
    ],
    seedTracks: [
      {
        id: 'DWcJFNfaw9c',
        title: 'Synthwave Radio - Chill synth / Retro Focus',
        artist: 'Lofi Girl',
        duration: 250,
        thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
        videoUrl: 'https://www.youtube.com/watch?v=DWcJFNfaw9c'
      },
      ...ECHO_QUICK_PICKS.slice(2, 5)
    ]
  },
  {
    id: 'mood-sleep',
    title: 'Sleep & Nightfall',
    subtitle: 'Night, Piano, Dream, Sleep Sounds',
    description: 'Drift away gently into restorative sleep with soft rainscapes, delta frequency harmonies, peaceful night piano, and calm ambient drones.',
    iconName: 'Moon',
    color: '#3F51B5',
    gradient: 'from-blue-600/20 via-indigo-900/10 to-transparent',
    coverUrl: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=800&auto=format&fit=crop&q=80',
    tags: ['Night', 'Piano', 'Dream', 'Sleep Sounds', 'Rain', 'Meditation', 'Delta Waves'],
    searchQueries: [
      'deep sleep relaxing night music piano',
      'calm rain sleep sounds ambient',
      'peaceful nightfall delta frequency sleep',
      'dreamy soft ambient sleep meditation',
      'gentle piano relaxing night ambience'
    ],
    seedTracks: [
      {
        id: '1ZYbU82GVz4',
        title: 'Deep Sleep Music - Delta Waves & Soft Piano',
        artist: 'Restful Sleep Project',
        duration: 300,
        thumbnail: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=800',
        videoUrl: 'https://www.youtube.com/watch?v=1ZYbU82GVz4'
      },
      ...ECHO_QUICK_PICKS.slice(3, 6)
    ]
  },
  {
    id: 'mood-party',
    title: 'Party & Dancefloor',
    subtitle: 'Club, Dance, House, Festival',
    description: 'Ignite the dancefloor with high-voltage club anthems, bass-heavy house drops, festival electronic dance music, and party remixes.',
    iconName: 'Disc3',
    color: '#E91E63',
    gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    tags: ['Club', 'Dance', 'House', 'Festival', 'EDM', 'Techno', 'Party Remix', 'Disco'],
    searchQueries: [
      'party dance club anthems edm',
      'house music festival dancefloor remix',
      'club bangers electro dance pop',
      'dj club party mix bass house',
      'disco house party festival hits'
    ],
    seedTracks: [
      {
        id: 'kJQP7kiw5Fk',
        title: 'Despacito (Club Dance Remix)',
        artist: 'Luis Fonsi, Daddy Yankee',
        duration: 230,
        thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk'
      },
      ...(COUNTRY_CHARTS?.US?.tracks ? COUNTRY_CHARTS.US.tracks.slice(0, 3) : [])
    ]
  },
  {
    id: 'mood-romance',
    title: 'Romance & Feelings',
    subtitle: 'Love, R&B, Ballad, Soul',
    description: 'Heartfelt emotional ballads, smooth slow-burning R&B, soulful acoustic love duets, and intimate date night melodies.',
    iconName: 'Heart',
    color: '#FF4081',
    gradient: 'from-rose-500/20 via-pink-600/10 to-transparent',
    coverUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80',
    tags: ['Love', 'Romance', 'R&B', 'Ballad', 'Soul', 'Date Night', 'Heartfelt', 'Emotional'],
    searchQueries: [
      'romantic love songs slow r&b ballad',
      'acoustic love songs couple romantic',
      'soulful slow r&b love vibes',
      'heartfelt romantic ballads date night',
      'emotional acoustic romance soul'
    ],
    seedTracks: [
      {
        id: 'JGwWNGJdvx8',
        title: 'Shape of You (Acoustic Love Version)',
        artist: 'Ed Sheeran',
        duration: 234,
        thumbnail: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800',
        videoUrl: 'https://www.youtube.com/watch?v=JGwWNGJdvx8'
      },
      ...(COUNTRY_CHARTS?.UK?.tracks ? COUNTRY_CHARTS.UK.tracks.slice(0, 3) : (COUNTRY_CHARTS?.GB?.tracks ? COUNTRY_CHARTS.GB.tracks.slice(0, 3) : []))
    ]
  }
];

// In-Memory cache for fast session switching
const MOOD_CACHE = new Map<string, { timestamp: number; tracks: Track[] }>();
const CACHE_TTL_MS = 1000 * 60 * 45; // 45 minutes cache
const STORAGE_PREFIX = 'eshu_mood_cache_v2_';

function getLocalMoodCache(moodId: string): Track[] | null {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${moodId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.tracks) && parsed.tracks.length > 0) {
      return parsed.tracks;
    }
  } catch {
    // Ignore storage issues
  }
  return null;
}

function setLocalMoodCache(moodId: string, tracks: Track[]) {
  try {
    const cleanTracks = (tracks || []).map(sanitizeTrack);
    sessionStorage.setItem(
      `${STORAGE_PREFIX}${moodId}`,
      safeJsonStringify({ timestamp: Date.now(), tracks: cleanTracks }, '{}')
    );
  } catch {
    // Ignore quota issues
  }
}

/**
 * Clean and deduplicate tracks by YouTube video ID
 */
function deduplicateTracks(tracks: Track[]): Track[] {
  const seen = new Set<string>();
  const results: Track[] = [];

  for (const t of tracks) {
    if (!t || !t.id) continue;
    const normalizedId = t.id.trim();
    if (!seen.has(normalizedId)) {
      seen.add(normalizedId);
      results.push(t);
    }
  }

  return results;
}

/**
 * Fetch dynamic tracks for a given mood
 */
export async function fetchMoodTracks(
  moodId: string,
  options: { forceRefresh?: boolean; limit?: number } = {}
): Promise<Track[]> {
  const mood = MOOD_DEFINITIONS.find((m) => m.id === moodId);
  if (!mood) return [];

  const { forceRefresh = false, limit = 25 } = options;

  // 1. Check in-memory cache
  if (!forceRefresh && MOOD_CACHE.has(moodId)) {
    const cached = MOOD_CACHE.get(moodId)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS && cached.tracks.length > 0) {
      return cached.tracks.slice(0, limit);
    }
  }

  // 2. Check sessionStorage cache
  if (!forceRefresh) {
    const localCached = getLocalMoodCache(moodId);
    if (localCached && localCached.length > 0) {
      MOOD_CACHE.set(moodId, { timestamp: Date.now(), tracks: localCached });
      return localCached.slice(0, limit);
    }
  }

  // 3. Perform parallel searches across queries (limited to 2-3 queries to save API rate limits)
  const queriesToRun = forceRefresh
    ? mood.searchQueries.slice(0, 3).sort(() => Math.random() - 0.5)
    : mood.searchQueries.slice(0, 2);

  const discoveredTracks: Track[] = [...mood.seedTracks];

  try {
    const searchPromises = queriesToRun.map((q) =>
      universalSearch(q)
        .then((res) => res.results || [])
        .catch(() => [] as Track[])
    );

    const searchResults = await Promise.all(searchPromises);
    for (const resList of searchResults) {
      discoveredTracks.push(...resList);
    }
  } catch (err) {
    console.warn(`Error dynamically discovering tracks for mood ${moodId}:`, err);
  }

  const cleanList = deduplicateTracks(discoveredTracks);
  const finalTracks = cleanList.length > 0 ? cleanList : mood.seedTracks;

  // Cache final results
  MOOD_CACHE.set(moodId, { timestamp: Date.now(), tracks: finalTracks });
  setLocalMoodCache(moodId, finalTracks);

  return finalTracks.slice(0, limit);
}

/**
 * Converts a MoodDefinition into the legacy MoodCategory format for compatibility
 */
export function getMoodCategory(def: MoodDefinition, tracks?: Track[]): MoodCategory {
  return {
    id: def.id,
    title: def.title,
    subtitle: def.subtitle,
    coverUrl: def.coverUrl,
    color: def.color,
    playlistId: `PL_${def.id}`,
    iconName: def.iconName,
    tags: def.tags,
    tracks: tracks || def.seedTracks,
  };
}

/**
 * Preload all moods in the background on initial app load
 */
export function preloadAllMoods(): void {
  // Fire and forget with staggered delays to prevent request bursting
  MOOD_DEFINITIONS.forEach((mood, idx) => {
    setTimeout(() => {
      fetchMoodTracks(mood.id, { limit: 15 }).catch(() => {});
    }, idx * 600);
  });
}
