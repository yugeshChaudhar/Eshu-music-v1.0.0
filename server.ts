import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { serverLyricsDb, normalizeForSearch } from './src/server/lyricsDatabase';
import { serverLyricsPipeline } from './src/server/lyrics/LyricsPipeline';

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

async function scrapeYouTubePlaylist(playlistId: string): Promise<{ title: string; author: string; thumbnail: string; tracks: SearchTrackResult[] }> {
  try {
    const playlistUrl = `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}&hl=en`;
    const response = await fetch(playlistUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) return { title: 'YouTube Playlist', author: 'YouTube', thumbnail: '', tracks: [] };

    const html = await response.text();
    const dataMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s) ||
                      html.match(/window\["ytInitialData"\] = ({.*?});<\/script>/s);

    if (!dataMatch || !dataMatch[1]) return { title: 'YouTube Playlist', author: 'YouTube', thumbnail: '', tracks: [] };

    const parsed = JSON.parse(dataMatch[1]);
    const header = parsed?.header?.playlistHeaderRenderer || parsed?.sidebar?.playlistSidebarRenderer?.items?.[0]?.playlistSidebarPrimaryInfoRenderer;
    const title = header?.title?.simpleText || header?.title?.runs?.[0]?.text || 'Imported YouTube Playlist';
    const author = header?.ownerText?.runs?.[0]?.text || header?.navigationEndpoint?.showCustomThumbnailEndpoint?.title || 'YouTube';
    const thumbnail = header?.playlistHeaderBanner?.heroPlaylistThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)?.[0]?.url ||
      `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800`;

    const tabs = parsed?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
    const contents = tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.playlistVideoListRenderer?.contents || [];

    const tracks: SearchTrackResult[] = [];
    for (const item of contents) {
      const v = item.playlistVideoRenderer;
      if (!v || !v.videoId) continue;

      let songTitle = v.title?.runs?.[0]?.text || v.title?.simpleText || 'Track';
      let artistName = v.shortBylineText?.runs?.[0]?.text || author;

      if (songTitle.includes(' - ') && !artistName.includes(' - ')) {
        const parts = songTitle.split(' - ');
        artistName = parts[0].trim();
        songTitle = parts.slice(1).join(' - ').trim();
      }

      const duration = parseInt(v.lengthSeconds || '210', 10);
      const thumb = v.thumbnail?.thumbnails?.slice(-1)?.[0]?.url || `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`;

      tracks.push({
        id: v.videoId,
        title: songTitle,
        artist: artistName.replace(/\s*-\s*Topic$/i, '').trim(),
        album: title,
        duration: isNaN(duration) ? 210 : duration,
        thumbnail: thumb,
        videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
      });
    }

    return {
      title,
      author,
      thumbnail: tracks[0]?.thumbnail || thumbnail,
      tracks,
    };
  } catch (err) {
    console.warn('Scrape playlist error:', err);
    return { title: 'YouTube Playlist', author: 'YouTube', thumbnail: '', tracks: [] };
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

  // 2b. YouTube Playlist Import Endpoint (Direct URL / ID)
  app.get('/api/youtube/playlist', async (req, res) => {
    const raw = (req.query.url as string || req.query.list as string || req.query.id as string || '').trim();
    if (!raw) {
      return res.status(400).json({ error: 'url or list parameter is required' });
    }
    const { playlistId } = extractYouTubeInfo(raw);
    const idToUse = playlistId || raw;

    const plData = await scrapeYouTubePlaylist(idToUse);
    if (!plData || plData.tracks.length === 0) {
      return res.status(404).json({ error: 'No songs found in this YouTube playlist or playlist is private' });
    }

    res.json({
      id: `yt_${idToUse}`,
      title: plData.title,
      author: plData.author,
      thumbnail: plData.thumbnail,
      tracks: plData.tracks,
      trackCount: plData.tracks.length,
    });
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

  // 4. Synchronized Lyrics API (ESHU Database -> LRCLIB provider pipeline -> unavailable)
  app.get('/api/lyrics', async (req, res) => {
    const rawTrack = (req.query.track_name as string || req.query.title as string || '').trim();
    const rawArtist = (req.query.artist_name as string || req.query.artist as string || '').trim();
    const songId = (req.query.song_id as string || req.query.songId as string || req.query.id as string || '').trim();
    const duration = req.query.duration ? parseInt(req.query.duration as string, 10) : undefined;

    if (!rawTrack) {
      return res.status(400).json({ error: 'track_name is required' });
    }

    try {
      const result = await serverLyricsPipeline.resolveLyrics({
        title: rawTrack,
        artist: rawArtist,
        duration: isNaN(duration as number) ? undefined : duration,
        videoId: songId,
      });

      res.json(result);
    } catch (err) {
      console.warn('Lyrics route exception:', err);
      res.json({
        synced: false,
        syncedLyrics: '',
        plainLyrics: '',
        source: 'None',
        unavailable: true,
      });
    }
  });

  // 4b. ESHU Database REST API - List / Query Lyrics Records
  app.get('/api/lyrics/db', (req, res) => {
    try {
      const q = (req.query.q as string || '').trim().toLowerCase();
      const title = (req.query.title as string || '').trim();
      const artist = (req.query.artist as string || '').trim();
      const songId = (req.query.songId as string || '').trim();

      if (title || artist || songId) {
        const match = serverLyricsDb.findMatch(title, artist, songId);
        return res.json({ records: match ? [match] : [] });
      }

      let all = serverLyricsDb.getAll();
      if (q) {
        all = all.filter((r) =>
          r.title.toLowerCase().includes(q) ||
          r.artist.toLowerCase().includes(q) ||
          (r.album && r.album.toLowerCase().includes(q)) ||
          (r.language && r.language.toLowerCase().includes(q))
        );
      }

      res.json({ records: all, count: all.length });
    } catch (err) {
      console.warn('GET /api/lyrics/db error:', err);
      res.status(500).json({ error: 'Failed to retrieve lyrics from database' });
    }
  });

  // 4c. ESHU Database REST API - Get by ID
  app.get('/api/lyrics/db/:id', (req, res) => {
    try {
      const record = serverLyricsDb.getById(req.params.id);
      if (!record) {
        return res.status(404).json({ error: 'Lyrics record not found' });
      }
      res.json(record);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch lyrics record' });
    }
  });

  // 4d. ESHU Database REST API - Create / Add Record
  app.post('/api/lyrics/db', (req, res) => {
    try {
      const { title, artist, album, language, plainLyrics, syncedLyrics, songId, source } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Song title is required.' });
      }
      if (!artist || !artist.trim()) {
        return res.status(400).json({ error: 'Artist name is required.' });
      }
      if (!plainLyrics && !syncedLyrics) {
        return res.status(400).json({ error: 'Either plainLyrics or syncedLyrics must be provided.' });
      }

      const created = serverLyricsDb.create({
        title: title.trim(),
        artist: artist.trim(),
        album: album ? album.trim() : undefined,
        language: language || 'Nepali',
        plainLyrics: plainLyrics || (syncedLyrics ? syncedLyrics.replace(/\[\d{2}:\d{2}(\.\d{2,3})?\]/g, '').trim() : ''),
        syncedLyrics: syncedLyrics ? syncedLyrics.trim() : undefined,
        songId: songId ? songId.trim() : undefined,
        source: source || 'ESHU Database (Admin)',
      });

      serverLyricsPipeline.clearCache(title.trim(), artist.trim(), songId ? songId.trim() : undefined);
      res.status(201).json(created);
    } catch (err: any) {
      console.warn('POST /api/lyrics/db error:', err);
      res.status(500).json({ error: err.message || 'Failed to save lyrics record.' });
    }
  });

  // 4e. ESHU Database REST API - Update Record
  app.put('/api/lyrics/db/:id', (req, res) => {
    try {
      const { title, artist, album, language, plainLyrics, syncedLyrics, songId, source } = req.body;
      const updated = serverLyricsDb.update(req.params.id, {
        ...(title && { title: title.trim() }),
        ...(artist && { artist: artist.trim() }),
        ...(album !== undefined && { album: album.trim() }),
        ...(language && { language }),
        ...(plainLyrics !== undefined && { plainLyrics }),
        ...(syncedLyrics !== undefined && { syncedLyrics }),
        ...(songId !== undefined && { songId }),
        ...(source && { source }),
      });

      if (!updated) {
        return res.status(404).json({ error: 'Lyrics record not found to update.' });
      }

      serverLyricsPipeline.clearCache(updated.title, updated.artist, updated.songId);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update lyrics record.' });
    }
  });

  // 4f. ESHU Database REST API - Delete Record
  app.delete('/api/lyrics/db/:id', (req, res) => {
    try {
      const existing = serverLyricsDb.getById(req.params.id);
      const success = serverLyricsDb.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Lyrics record not found to delete.' });
      }
      if (existing) {
        serverLyricsPipeline.clearCache(existing.title, existing.artist, existing.songId);
      }
      res.json({ success: true, message: 'Lyrics deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete lyrics record.' });
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
