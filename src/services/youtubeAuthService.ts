import { Track, Playlist, YouTubeUserProfile } from '../types';

const YOUTUBE_USER_KEY = 'eshu_youtube_user_profile';
const YOUTUBE_ACCESS_TOKEN_KEY = 'eshu_youtube_access_token';

// YouTube Scopes
export const YOUTUBE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

/**
 * Get stored profile
 */
export function getStoredYouTubeUser(): YouTubeUserProfile | null {
  try {
    const raw = localStorage.getItem(YOUTUBE_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save profile to local storage
 */
export function saveStoredYouTubeUser(profile: YouTubeUserProfile | null): void {
  try {
    if (!profile) {
      localStorage.removeItem(YOUTUBE_USER_KEY);
      localStorage.removeItem(YOUTUBE_ACCESS_TOKEN_KEY);
    } else {
      localStorage.setItem(YOUTUBE_USER_KEY, JSON.stringify(profile));
      if (profile.accessToken) {
        localStorage.setItem(YOUTUBE_ACCESS_TOKEN_KEY, profile.accessToken);
      }
    }
  } catch {}
}

/**
 * Retrieve User Profile from Google userinfo API
 */
export async function fetchGoogleUserProfile(accessToken: string): Promise<YouTubeUserProfile> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Google profile: ${res.statusText}`);
  }

  const data = await res.json();
  return {
    id: data.sub || data.id,
    name: data.name || data.given_name || 'YouTube User',
    email: data.email || '',
    picture: data.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    accessToken,
    expiresAt: Date.now() + 3500 * 1000,
  };
}

/**
 * Fetch all user's YouTube Playlists using the YouTube Data API v3
 */
export async function fetchUserYouTubePlaylists(
  accessToken: string,
  onProgress?: (msg: string) => void
): Promise<Playlist[]> {
  onProgress?.('Fetching your YouTube playlists...');

  const playlists: Playlist[] = [];
  let nextPageToken: string | undefined = undefined;

  try {
    // 1. Fetch playlist listings (up to 50 per page)
    do {
      const url: string = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50${
        nextPageToken ? `&pageToken=${nextPageToken}` : ''
      }`;

      const res: Response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn('YouTube playlist fetch failed:', errorData);
        break;
      }

      const data: any = await res.json();
      const items: any[] = data.items || [];

      for (const item of items) {
        const pId: string = item.id;
        const snippet = item.snippet || {};
        const contentDetails = item.contentDetails || {};

        const title: string = snippet.title || 'Untitled Playlist';
        const description: string = snippet.description || 'Imported from YouTube';
        const itemCount: number = contentDetails.itemCount || 0;
        const thumbnail: string =
          snippet.thumbnails?.maxres?.url ||
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url ||
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800';

        playlists.push({
          id: `yt_${pId}`,
          title,
          description,
          thumbnail,
          trackCount: itemCount,
          tracks: [],
          author: snippet.channelTitle || 'YouTube',
          isCustom: true,
          isYouTubeImported: true,
          createdAt: Date.now(),
        });
      }

      nextPageToken = data.nextPageToken;
    } while (nextPageToken && playlists.length < 100);

    onProgress?.(`Found ${playlists.length} playlists. Fetching songs...`);

    // 2. Fetch tracks for each playlist (up to 50 items per playlist)
    for (let i = 0; i < playlists.length; i++) {
      const pl = playlists[i];
      const realPlaylistId = pl.id.replace('yt_', '');

      onProgress?.(`Importing songs for "${pl.title}" (${i + 1}/${playlists.length})...`);

      try {
        const plItemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${realPlaylistId}&maxResults=50`;
        const itemRes = await fetch(plItemsUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        });

        if (itemRes.ok) {
          const itemData = await itemRes.json();
          const pTracks: Track[] = [];

          for (const item of itemData.items || []) {
            const videoId =
              item.contentDetails?.videoId ||
              item.snippet?.resourceId?.videoId;

            if (videoId && videoId !== 'private') {
              let songTitle = item.snippet?.title || 'YouTube Track';
              let artistName = item.snippet?.videoOwnerChannelTitle || 'YouTube Artist';

              // If deleted or private video
              if (songTitle === 'Private video' || songTitle === 'Deleted video') {
                continue;
              }

              // Remove " - Topic" suffix
              artistName = artistName.replace(/\s*-\s*Topic$/i, '').trim();

              // Clean title if "Artist - Song"
              if (songTitle.includes(' - ') && !item.snippet?.videoOwnerChannelTitle?.includes(' - ')) {
                const parts = songTitle.split(' - ');
                artistName = parts[0].trim();
                songTitle = parts.slice(1).join(' - ').trim();
              }

              const thumb =
                item.snippet?.thumbnails?.high?.url ||
                item.snippet?.thumbnails?.medium?.url ||
                `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

              pTracks.push({
                id: videoId,
                title: songTitle,
                artist: artistName,
                album: pl.title,
                duration: 210, // Default estimated, will sync with YT player
                thumbnail: thumb,
                videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
                views: 'YouTube Playlist',
              });
            }
          }

          pl.tracks = pTracks;
          pl.trackCount = pTracks.length;
          if (pTracks.length > 0 && (!pl.thumbnail || pl.thumbnail.includes('unsplash'))) {
            pl.thumbnail = pTracks[0].thumbnail;
          }
        }
      } catch (err) {
        console.warn(`Error fetching items for playlist ${pl.title}:`, err);
      }
    }

    onProgress?.('Playlist sync complete!');
    return playlists;
  } catch (err) {
    console.error('YouTube Playlists Sync Error:', err);
    throw err;
  }
}

/**
 * Fetch user's "Liked Videos" from YouTube if available
 */
export async function fetchUserLikedMusicTracks(accessToken: string): Promise<Track[]> {
  try {
    const url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&myRating=like&maxResults=50';
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      const tracks: Track[] = [];

      for (const item of data.items || []) {
        const videoId = item.id;
        let title = item.snippet?.title || 'YouTube Track';
        let artist = item.snippet?.channelTitle || 'YouTube Artist';

        artist = artist.replace(/\s*-\s*Topic$/i, '').trim();

        if (title.includes(' - ')) {
          const parts = title.split(' - ');
          artist = parts[0].trim();
          title = parts.slice(1).join(' - ').trim();
        }

        const thumb =
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        tracks.push({
          id: videoId,
          title,
          artist,
          duration: 210,
          thumbnail: thumb,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          views: 'Liked on YouTube',
        });
      }

      return tracks;
    }
  } catch (err) {
    console.warn('Liked videos fetch error:', err);
  }
  return [];
}
