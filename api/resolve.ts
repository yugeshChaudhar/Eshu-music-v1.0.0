// Vercel Serverless Function: /api/resolve
export default async function handler(req: any, res: any) {
  const urlOrId = (req.query?.url as string || req.query?.id as string || '').trim();
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!urlOrId) {
    return res.status(400).json({ error: 'url or id parameter is required' });
  }

  let videoId = '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    videoId = urlOrId;
  } else {
    const videoMatch = urlOrId.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i
    );
    if (videoMatch) {
      videoId = videoMatch[1];
    }
  }

  if (videoId) {
    try {
      const oembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
      const oRes = await fetch(oembedUrl);
      if (oRes.ok) {
        const data = await oRes.json();
        return res.status(200).json({
          track: {
            id: videoId,
            title: data.title || `YouTube Video (${videoId})`,
            artist: data.author_name || 'YouTube Video',
            duration: 210,
            thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          }
        });
      }
    } catch {}

    return res.status(200).json({
      track: {
        id: videoId,
        title: `YouTube Video (${videoId})`,
        artist: 'YouTube Video',
        duration: 210,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      }
    });
  }

  return res.status(404).json({ error: 'Could not resolve YouTube video ID' });
}
