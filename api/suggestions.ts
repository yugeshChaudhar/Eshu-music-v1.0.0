// Vercel Serverless Function: /api/suggestions
export default async function handler(req: any, res: any) {
  const query = (req.query?.q as string || '').trim();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

  if (!query) {
    return res.status(200).json({ suggestions: [] });
  }

  try {
    const googleUrl = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`;
    const gRes = await fetch(googleUrl);
    if (gRes.ok) {
      const data = await gRes.json();
      if (Array.isArray(data) && Array.isArray(data[1])) {
        return res.status(200).json({ suggestions: data[1].slice(0, 8) });
      }
    }
  } catch {}

  return res.status(200).json({ suggestions: [] });
}
