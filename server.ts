import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface SearchTrackResult {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  thumbnail: string;
  views?: string;
  videoUrl?: string;
}

function parseDuration(durationStr?: string): number {
  if (!durationStr) return 210;
  const parts = durationStr.split(':').map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return 210;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 210;
}

function extractYouTubeInfo(input: string): { videoId?: string; playlistId?: string } {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return { videoId: trimmed };
  }
  const playlistMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
  const playlistId = playlistMatch ? playlistMatch[1] : undefined;

  const videoMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i
  );
  const videoId = videoMatch ? videoMatch[1] : undefined;

  return { videoId, playlistId };
}

async function fetchOEmbedMetadata(videoId: string): Promise<SearchTrackResult | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      let cleanTitle = data.title || 'YouTube Track';
      let cleanArtist = data.author_name || 'YouTube Music';

      // If title is "Artist - Title", split smartly
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
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      };
    }
  } catch (err) {
    console.warn('OEmbed fetch error:', err);
  }
  return null;
}

async function scrapeYouTubeSearch(query: string): Promise<SearchTrackResult[]> {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const dataMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s) ||
                      html.match(/window\["ytInitialData"\] = ({.*?});<\/script>/s);

    if (!dataMatch || !dataMatch[1]) return [];

    const parsed = JSON.parse(dataMatch[1]);
    const sections =
      parsed?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

    const results: SearchTrackResult[] = [];

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
            'YouTube Music';
          const durationStr = v.lengthText?.simpleText || v.lengthText?.runs?.[0]?.text;
          const duration = parseDuration(durationStr);
          const views = v.viewCountText?.simpleText || v.shortViewCountText?.simpleText || '';

          // Clean title if formatted as "Artist - Title"
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
    console.warn('YouTube search scraping error:', err);
    return [];
  }
}

async function searchFallbackMusic(query: string): Promise<SearchTrackResult[]> {
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=15`;
    const res = await fetch(itunesUrl);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results)) {
        return data.results.map((item: any) => ({
          id: `itunes_${item.trackId}`,
          title: item.trackName || 'Song',
          artist: item.artistName || 'Artist',
          album: item.collectionName,
          duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210,
          thumbnail: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
          videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.artistName + ' ' + item.trackName)}`,
        }));
      }
    }
  } catch {}
  return [];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check routes
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'Eshu Music Web Server',
      timestamp: Date.now(),
      uptime: Math.floor(process.uptime()),
    });
  });

  app.get(['/health', '/ping'], (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: Date.now(),
    });
  });

  // 1. YouTube & Music Live Search API
  app.get('/api/search', async (req, res) => {
    const q = (req.query.q as string || '').trim();
    if (!q) {
      return res.json({ results: [], query: '' });
    }

    // Check if input is a YouTube URL or Video ID
    const extracted = extractYouTubeInfo(q);
    if (extracted.videoId) {
      const oembed = await fetchOEmbedMetadata(extracted.videoId);
      if (oembed) {
        return res.json({
          results: [oembed],
          isDirectLink: true,
          videoId: extracted.videoId,
          playlistId: extracted.playlistId,
        });
      } else {
        return res.json({
          results: [
            {
              id: extracted.videoId,
              title: `YouTube Track (${extracted.videoId})`,
              artist: 'YouTube Video',
              duration: 210,
              thumbnail: `https://img.youtube.com/vi/${extracted.videoId}/hqdefault.jpg`,
              videoUrl: `https://www.youtube.com/watch?v=${extracted.videoId}`,
            },
          ],
          isDirectLink: true,
          videoId: extracted.videoId,
          playlistId: extracted.playlistId,
        });
      }
    }

    // Perform live YouTube search
    let results = await scrapeYouTubeSearch(q);

    // If scraper was empty, try music fallback
    if (results.length === 0) {
      const fallback = await searchFallbackMusic(q);
      results = fallback;
    }

    res.json({
      results,
      query: q,
      count: results.length,
    });
  });

  // 2. YouTube URL or ID Resolver Endpoint
  app.get('/api/resolve', async (req, res) => {
    const urlOrId = (req.query.url as string || req.query.id as string || '').trim();
    if (!urlOrId) {
      return res.status(400).json({ error: 'url or id parameter is required' });
    }

    const { videoId, playlistId } = extractYouTubeInfo(urlOrId);

    if (playlistId && !videoId) {
      return res.json({
        isPlaylist: true,
        playlistId,
        title: 'YouTube Playlist',
      });
    }

    if (videoId) {
      const meta = await fetchOEmbedMetadata(videoId);
      return res.json({
        isPlaylist: Boolean(playlistId),
        playlistId,
        track: meta || {
          id: videoId,
          title: `YouTube Video (${videoId})`,
          artist: 'YouTube Stream',
          duration: 210,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        },
      });
    }

    return res.status(404).json({ error: 'Could not resolve YouTube link or video ID' });
  });

  // 3. Autocomplete / Search Suggestions API
  app.get('/api/search/suggestions', async (req, res) => {
    const q = (req.query.q as string || '').trim();
    if (!q) {
      return res.json({ suggestions: [] });
    }
    try {
      const suggestUrl = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q)}`;
      const response = await fetch(suggestUrl);
      const data = await response.json();
      const suggestions = Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
      res.json({ suggestions });
    } catch {
      res.json({ suggestions: [] });
    }
  });

  // 4. Synchronized Lyrics API (LRCLIB)
  app.get('/api/lyrics', async (req, res) => {
    const trackName = (req.query.track_name as string || '').trim();
    const artistName = (req.query.artist_name as string || '').trim();
    const duration = req.query.duration ? parseInt(req.query.duration as string, 10) : undefined;

    if (!trackName) {
      return res.status(400).json({ error: 'track_name is required' });
    }

    try {
      const params = new URLSearchParams({
        track_name: trackName,
        artist_name: artistName,
      });
      if (duration && !isNaN(duration) && duration > 0) {
        params.append('duration', duration.toString());
      }

      let lrclibRes = await fetch(`https://lrclib.net/api/get?${params.toString()}`);
      if (lrclibRes.ok) {
        const data = await lrclibRes.json();
        return res.json({
          synced: Boolean(data.syncedLyrics),
          syncedLyrics: data.syncedLyrics || '',
          plainLyrics: data.plainLyrics || '',
          trackName: data.trackName,
          artistName: data.artistName,
          source: 'LRCLIB',
        });
      }

      const searchParams = new URLSearchParams({
        q: `${trackName} ${artistName}`.trim(),
      });
      const searchRes = await fetch(`https://lrclib.net/api/search?${searchParams.toString()}`);
      if (searchRes.ok) {
        const results = await searchRes.json();
        if (Array.isArray(results) && results.length > 0) {
          const best = results[0];
          return res.json({
            synced: Boolean(best.syncedLyrics),
            syncedLyrics: best.syncedLyrics || '',
            plainLyrics: best.plainLyrics || '',
            trackName: best.trackName,
            artistName: best.artistName,
            source: 'LRCLIB',
          });
        }
      }

      res.json({
        synced: false,
        syncedLyrics: '',
        plainLyrics: 'No synchronized lyrics found for this track.',
        source: 'None',
      });
    } catch {
      res.json({
        synced: false,
        syncedLyrics: '',
        plainLyrics: 'Could not connect to lyrics provider.',
        source: 'None',
      });
    }
  });

  // 5. SponsorBlock API Proxy
  app.get('/api/sponsorblock', async (req, res) => {
    const videoId = req.query.videoId as string;
    if (!videoId) return res.json({ segments: [] });

    try {
      const url = `https://sponsor.ajay.app/api/skipSegments?videoID=${encodeURIComponent(videoId)}&categories=["sponsor","intro","outro","music_offtopic"]`;
      const response = await fetch(url);
      if (response.ok) {
        const segments = await response.json();
        return res.json({ segments });
      }
      res.json({ segments: [] });
    } catch {
      res.json({ segments: [] });
    }
  });

  // 6. Return YouTube Dislike API Proxy
  app.get('/api/dislikes', async (req, res) => {
    const videoId = req.query.videoId as string;
    if (!videoId) return res.json({ likes: 0, dislikes: 0, rating: 5 });

    try {
      const url = `https://returnyoutubedislikeapi.com/votes?videoId=${encodeURIComponent(videoId)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return res.json({
          likes: data.likes || 0,
          dislikes: data.dislikes || 0,
          rating: data.rating || 5,
          viewCount: data.viewCount || 0,
        });
      }
      res.json({ likes: 0, dislikes: 0, rating: 5 });
    } catch {
      res.json({ likes: 0, dislikes: 0, rating: 5 });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Eshu Music server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
