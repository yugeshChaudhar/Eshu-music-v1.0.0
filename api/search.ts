// Vercel Serverless Function: /api/search
export default async function handler(req: any, res: any) {
  const query = (req.query?.q as string || '').trim();
  if (!query) {
    return res.status(200).json({ results: [], query: '' });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  try {
    // 1. Apple Music / iTunes Search API
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=25`;
    const itunesRes = await fetch(itunesUrl);
    if (itunesRes.ok) {
      const data = await itunesRes.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        const results = data.results.map((item: any) => ({
          id: `itunes_${item.trackId}`,
          title: item.trackName || 'Song',
          artist: item.artistName || 'Artist',
          album: item.collectionName,
          duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210,
          thumbnail: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
          videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.artistName + ' ' + item.trackName)}`,
        }));

        return res.status(200).json({
          results,
          query,
          count: results.length,
        });
      }
    }
  } catch (err: any) {
    console.error('Vercel Search API error:', err);
  }

  return res.status(200).json({ results: [], query });
}
