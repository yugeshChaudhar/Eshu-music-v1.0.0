import { Track, Playlist } from '../types';
import { ECHO_QUICK_PICKS, COUNTRY_CHARTS, ECHO_TOP_ARTISTS } from '../data/echoMusicData';

export interface DynamicQuickPicksResult {
  tracks: Track[];
  headline: string;
  subheadline: string;
  sourceType: 'now_playing' | 'artist_radio' | 'history' | 'favorites' | 'trending';
}

// Helper to gather all known catalog tracks
export function getAllCatalogTracks(customPlaylists: Playlist[] = [], favorites: Track[] = []): Track[] {
  const map = new Map<string, Track>();

  // Add default quick picks
  for (const t of ECHO_QUICK_PICKS) {
    map.set(t.id, t);
  }

  // Add top artists' top tracks
  for (const art of ECHO_TOP_ARTISTS) {
    for (const t of art.topTracks || []) {
      map.set(t.id, {
        ...t,
        artist: t.artist || art.name,
      });
    }
  }

  // Add country chart tracks
  for (const chart of Object.values(COUNTRY_CHARTS)) {
    for (const t of chart.tracks) {
      map.set(t.id, t);
    }
  }

  // Add favorites
  for (const t of favorites) {
    map.set(t.id, t);
  }

  // Add custom playlist tracks
  for (const pl of customPlaylists) {
    for (const t of pl.tracks || []) {
      map.set(t.id, t);
    }
  }

  return Array.from(map.values());
}

/**
 * Computes dynamic Quick Picks dynamically adapting to what the user is listening to,
 * their recent history, favorites, and playlists.
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
  const allTracks = getAllCatalogTracks(customPlaylists, favorites);
  const pickedMap = new Map<string, Track>();

  // CASE 1: User is currently listening to a track
  if (currentTrack) {
    const cleanArtist = currentTrack.artist.toLowerCase().split(/[&,x+]/)[0].trim();
    const currentGenre = currentTrack.category?.toLowerCase() || '';

    // 1a. Check ECHO_TOP_ARTISTS for direct artist matches
    const matchedArtist = ECHO_TOP_ARTISTS.find(
      (a) => a.name.toLowerCase().includes(cleanArtist) || cleanArtist.includes(a.name.toLowerCase())
    );
    if (matchedArtist && matchedArtist.topTracks) {
      for (const t of matchedArtist.topTracks) {
        if (t.id !== currentTrack.id) {
          pickedMap.set(t.id, t);
        }
      }
    }

    // 1b. Tracks from same artist in catalog
    const sameArtist = allTracks.filter(
      (t) => t.id !== currentTrack.id && t.artist.toLowerCase().includes(cleanArtist)
    );
    sameArtist.forEach((t) => pickedMap.set(t.id, t));

    // 1c. Tracks with same/similar genre or vibe
    if (currentGenre) {
      const sameGenre = allTracks.filter(
        (t) => t.id !== currentTrack.id && t.category && (
          t.category.toLowerCase().includes(currentGenre) ||
          currentGenre.includes(t.category.toLowerCase())
        )
      );
      sameGenre.forEach((t) => pickedMap.set(t.id, t));
    }

    // 1d. Tracks from same custom playlist if currentTrack is in one
    for (const pl of customPlaylists) {
      if (pl.tracks.some((t) => t.id === currentTrack.id)) {
        pl.tracks.forEach((t) => {
          if (t.id !== currentTrack.id) pickedMap.set(t.id, t);
        });
      }
    }

    // 1e. Fill with favorites or popular catalog tracks to ensure at least 8 tracks
    for (const fav of favorites) {
      if (fav.id !== currentTrack.id && pickedMap.size < 8) {
        pickedMap.set(fav.id, fav);
      }
    }

    for (const cat of allTracks) {
      if (cat.id !== currentTrack.id && pickedMap.size < 8) {
        pickedMap.set(cat.id, cat);
      }
    }

    const tracks = Array.from(pickedMap.values()).slice(0, 8);

    return {
      tracks: tracks.length > 0 ? tracks : ECHO_QUICK_PICKS,
      headline: `Similar to ${currentTrack.artist}`,
      subheadline: `Personalized dynamic radio inspired by "${currentTrack.title}"`,
      sourceType: 'now_playing',
    };
  }

  // CASE 2: User has listening history
  if (history.length > 0) {
    const recentTrack = history[0].track;
    const cleanArtist = recentTrack.artist.toLowerCase().split(/[&,x+]/)[0].trim();

    const related = allTracks.filter((t) => t.artist.toLowerCase().includes(cleanArtist));
    related.forEach((t) => pickedMap.set(t.id, t));

    // Add recent tracks from history
    for (const h of history) {
      if (pickedMap.size < 8) pickedMap.set(h.track.id, h.track);
    }

    // Fill remaining
    for (const cat of allTracks) {
      if (pickedMap.size < 8) pickedMap.set(cat.id, cat);
    }

    const tracks = Array.from(pickedMap.values()).slice(0, 8);

    return {
      tracks: tracks.length > 0 ? tracks : ECHO_QUICK_PICKS,
      headline: `Based on your recent listening`,
      subheadline: `Songs tailored to your listening habits`,
      sourceType: 'history',
    };
  }

  // CASE 3: User has favorite tracks
  if (favorites.length > 0) {
    favorites.forEach((t) => pickedMap.set(t.id, t));

    for (const cat of allTracks) {
      if (pickedMap.size < 8) pickedMap.set(cat.id, cat);
    }

    const tracks = Array.from(pickedMap.values()).slice(0, 8);

    return {
      tracks: tracks.length > 0 ? tracks : ECHO_QUICK_PICKS,
      headline: `From your Liked Songs & Favorites`,
      subheadline: `Quick picks curated from tracks you love`,
      sourceType: 'favorites',
    };
  }

  // CASE 4: Default / Cold Start
  return {
    tracks: ECHO_QUICK_PICKS,
    headline: 'Quick Picks',
    subheadline: 'Trending tracks and audio gems handpicked for you',
    sourceType: 'trending',
  };
}
