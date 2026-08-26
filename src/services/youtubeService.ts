import { CustomPlaylist } from '../types';
import { safeJsonStringify } from './echoStorage';

const STORAGE_KEY_PLAYLISTS = 'casual_radio_custom_playlists';
const STORAGE_KEY_FAVORITES = 'casual_radio_favorites';
const STORAGE_KEY_LAST_STATION = 'casual_radio_last_station';

export interface ParsedYouTubeResult {
  type: 'playlist' | 'video' | 'mix' | 'invalid';
  id: string;
  listId?: string;
  videoId?: string;
}

export function parseYouTubeUrl(input: string): ParsedYouTubeResult {
  const trimmed = input.trim();
  if (!trimmed) return { type: 'invalid', id: '' };

  // Check if direct playlist ID (PL, RD, UU, FL, OLAK, CL, TL, etc.)
  if (/^(PL|RD|UU|FL|OLAK|CL|TL|LL|WL|LM)[a-zA-Z0-9_-]{8,}$/i.test(trimmed)) {
    return { type: 'playlist', id: trimmed, listId: trimmed };
  }

  // Check if direct 11-char video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return { type: 'video', id: trimmed, videoId: trimmed };
  }

  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace('www.', '');

    const listParam = url.searchParams.get('list');
    let vParam = url.searchParams.get('v');

    // Handle youtu.be short links
    if (host === 'youtu.be') {
      const pathId = url.pathname.slice(1).split('/')[0]?.split('?')[0];
      if (pathId && pathId.length === 11) {
        vParam = pathId;
      }
    }

    // Handle YouTube Shorts (e.g. /shorts/VIDEO_ID)
    if (url.pathname.includes('/shorts/')) {
      const pathId = url.pathname.split('/shorts/')[1]?.split('/')[0]?.split('?')[0];
      if (pathId && pathId.length === 11) {
        vParam = pathId;
      }
    }

    // Handle embed URLs (/embed/VIDEO_ID)
    if (url.pathname.includes('/embed/')) {
      const pathId = url.pathname.split('/embed/')[1]?.split('?')[0];
      if (pathId && pathId.length === 11) {
        vParam = pathId;
      }
    }

    // If both list and video are present (e.g., YouTube Mix RD..., Radio, or specific track in playlist)
    if (listParam && vParam) {
      return {
        type: listParam.startsWith('RD') ? 'mix' : 'playlist',
        id: listParam,
        listId: listParam,
        videoId: vParam,
      };
    }

    // If only playlist is present
    if (listParam) {
      return {
        type: 'playlist',
        id: listParam,
        listId: listParam,
      };
    }

    // If only video is present
    if (vParam) {
      return {
        type: 'video',
        id: vParam,
        videoId: vParam,
      };
    }
  } catch {
    // If URL parsing failed, fall back
  }

  return { type: 'invalid', id: '' };
}

// In-memory cache for track metadata to speed up playlist queue display
const trackMetadataCache = new Map<string, { title: string; author: string; thumbnail: string }>();

export function cacheTrackMetadata(videoId: string, title: string, author: string, thumbnail?: string) {
  if (!videoId) return;
  trackMetadataCache.set(videoId, {
    title,
    author,
    thumbnail: thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  });
}

export function getCachedTrackMetadata(videoId: string) {
  return trackMetadataCache.get(videoId);
}

export async function fetchYouTubeOEmbed(videoId: string): Promise<{ title: string; author_name: string; thumbnail_url?: string }> {
  if (!videoId) {
    return {
      title: 'YouTube Track',
      author_name: 'Artist',
      thumbnail_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    };
  }

  if (trackMetadataCache.has(videoId)) {
    const cached = trackMetadataCache.get(videoId)!;
    return {
      title: cached.title,
      author_name: cached.author,
      thumbnail_url: cached.thumbnail,
    };
  }

  try {
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    if (res.ok) {
      const data = await res.json();
      const result = {
        title: data.title || `Track ${videoId}`,
        author_name: data.author_name || 'YouTube Artist',
        thumbnail_url: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      };
      trackMetadataCache.set(videoId, {
        title: result.title,
        author: result.author_name,
        thumbnail: result.thumbnail_url,
      });
      return result;
    }
  } catch {
    // Ignore fetch errors in sandboxes
  }

  const fallback = {
    title: 'YouTube Track',
    author_name: 'Casual Stream',
    thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };
  trackMetadataCache.set(videoId, {
    title: fallback.title,
    author: fallback.author_name,
    thumbnail: fallback.thumbnail_url,
  });
  return fallback;
}

export async function fetchBatchTrackMetadata(videoIds: string[]): Promise<Record<string, { title: string; author: string; thumbnail: string }>> {
  const result: Record<string, { title: string; author: string; thumbnail: string }> = {};
  const toFetch: string[] = [];

  for (const id of videoIds) {
    if (trackMetadataCache.has(id)) {
      result[id] = trackMetadataCache.get(id)!;
    } else {
      toFetch.push(id);
    }
  }

  // Fetch in chunks to avoid blocking
  const chunkSize = 5;
  for (let i = 0; i < toFetch.length; i += chunkSize) {
    const chunk = toFetch.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (id) => {
        const details = await fetchYouTubeOEmbed(id);
        result[id] = {
          title: details.title,
          author: details.author_name,
          thumbnail: details.thumbnail_url || `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        };
      })
    );
  }

  return result;
}

export async function fetchYouTubeUrlMetadata(inputUrl: string): Promise<{ title?: string; author?: string; thumbnail?: string; type: string }> {
  const parsed = parseYouTubeUrl(inputUrl);
  if (parsed.type === 'invalid') {
    return { type: 'invalid' };
  }

  // If we have videoId, direct YouTube HQ thumbnail is guaranteed
  if (parsed.videoId) {
    const videoThumbnail = `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`;
    try {
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${parsed.videoId}`);
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title,
          author: data.author_name,
          thumbnail: data.thumbnail_url || videoThumbnail,
          type: parsed.type,
        };
      }
    } catch {}
    return {
      thumbnail: videoThumbnail,
      type: parsed.type,
    };
  }

  // If we have playlistId
  if (parsed.listId) {
    try {
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/playlist?list=${parsed.listId}`);
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title,
          author: data.author_name,
          thumbnail: data.thumbnail_url,
          type: 'playlist',
        };
      }
    } catch {}
  }

  return { type: parsed.type };
}

export function updateCustomPlaylistCover(id: string, coverUrl: string): void {
  if (!id || !coverUrl) return;
  const playlists = getSavedPlaylists();
  let changed = false;
  const updated = playlists.map(p => {
    if (p.id === id && p.coverUrl !== coverUrl) {
      changed = true;
      return { ...p, coverUrl };
    }
    return p;
  });
  if (changed) {
    try {
      localStorage.setItem(STORAGE_KEY_PLAYLISTS, safeJsonStringify(updated, '[]'));
    } catch {}
  }
}

export function getSavedPlaylists(): CustomPlaylist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYLISTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomPlaylist(playlist: Omit<CustomPlaylist, 'id' | 'createdAt'>): CustomPlaylist {
  const playlists = getSavedPlaylists();
  const newPlaylist: CustomPlaylist = {
    ...playlist,
    id: `custom-${Date.now()}`,
    createdAt: Date.now(),
    coverUrl: playlist.coverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80'
  };

  const updated = [newPlaylist, ...playlists];
  try {
    localStorage.setItem(STORAGE_KEY_PLAYLISTS, safeJsonStringify(updated, '[]'));
  } catch {}
  return newPlaylist;
}

export function deleteCustomPlaylist(id: string): void {
  const playlists = getSavedPlaylists();
  const updated = playlists.filter(p => p.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_PLAYLISTS, safeJsonStringify(updated, '[]'));
  } catch {}
}

export function getFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVORITES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function toggleFavorite(stationOrTrackId: string): boolean {
  const favs = getFavorites();
  const isFav = favs.includes(stationOrTrackId);
  const updated = isFav ? favs.filter(id => id !== stationOrTrackId) : [...favs, stationOrTrackId];
  try {
    localStorage.setItem(STORAGE_KEY_FAVORITES, safeJsonStringify(updated, '[]'));
  } catch {}
  return !isFav;
}

export function getLastStationId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_LAST_STATION);
  } catch {
    return null;
  }
}

export function setLastStationId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_LAST_STATION, id);
  } catch {}
}
