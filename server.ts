import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check routes
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'SimpMusic Web Server',
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

  // 1. YouTube & YouTube Music Search API (using Google Suggest & YouTube Data / Scraper proxy)
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

  // 2. Synchronized Lyrics API (LRCLIB & SimpMusic Lyrics)
  app.get('/api/lyrics', async (req, res) => {
    const trackName = (req.query.track_name as string || '').trim();
    const artistName = (req.query.artist_name as string || '').trim();
    const duration = req.query.duration ? parseInt(req.query.duration as string, 10) : undefined;

    if (!trackName) {
      return res.status(400).json({ error: 'track_name is required' });
    }

    try {
      // Try exact match with duration
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

      // Try fuzzy search on LRCLIB
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

  // 3. SponsorBlock API Proxy
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

  // 4. Return YouTube Dislike API Proxy
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
    console.log(`SimpMusic server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
