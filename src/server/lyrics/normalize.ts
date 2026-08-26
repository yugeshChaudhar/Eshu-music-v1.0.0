/**
 * Normalization utilities for music metadata, YouTube title cleaning,
 * and safe Unicode / Devanagari (Nepali & Hindi) text handling.
 */

// Common YouTube and music video noise patterns to strip
const VIDEO_NOISE_PATTERNS = [
  /\b(official\s*(music\s*)?(video|audio|lyrics?(\s*video)?|mv|hd|4k|visualizer))\b/gi,
  /\b(lyric\s*video|lyrics?\s*video)\b/gi,
  /\b(remastered(\s*\d{4})?|remaster)\b/gi,
  /\b(full\s*(song|audio|video|track))\b/gi,
  /\b(new\s*nepali\s*(song|video|movie\s*song)?\s*\d*)\b/gi,
  /\b(nepali\s*(pop|hit|movie|film|modern|folk|lok|adhunik)?\s*(song)?\s*\d*)\b/gi,
  /\b(hd\s*video|4k\s*video|4k\s*ultra\s*hd|1080p)\b/gi,
  /\b(prod\.?\s*by\s*[^)\]|]+)\b/gi,
  /\b(directed\s*by\s*[^)\]|]+)\b/gi,
  /\b(ft\.?|feat\.?|featuring)\s+[a-zA-Z0-9\s,\u0900-\u097F]+/gi,
  /\b(exclusive\s*release|live\s*performance|acoustic\s*version)\b/gi,
];

/**
 * Removes standard YouTube clutter while preserving genuine song and artist names
 */
export function cleanYouTubeTitle(raw: string): string {
  if (!raw) return '';

  let cleaned = raw.trim();

  // Strip bracketed video labels like [Official Music Video], (Audio), (Lyrics Video)
  cleaned = cleaned.replace(/(\(|\[|\{)\s*(official\s*(music\s*)?(video|audio|lyrics|hd|4k|mv|visualizer)|remastered\s*\d*|full\s*audio|lyric\s*video|hd|4k|new\s*nepali\s*song\s*\d*).*?(\)|\]|\})/gi, '');

  // Strip noise patterns
  for (const pattern of VIDEO_NOISE_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Remove empty brackets left behind: (), [], {}
  cleaned = cleaned.replace(/\(\s*\)|\[\s*\]|\{\s*\}/g, '');

  // Clean trailing pipes or hyphens
  cleaned = cleaned.replace(/\s*[|\-–—:]\s*$/g, '').trim();

  // Collapse multiple spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

  return cleaned || raw.trim();
}

/**
 * Cleans artist name (e.g. removes " - Topic", "VEVO", "Official")
 */
export function cleanArtistName(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim();

  // Remove YouTube Music "- Topic" suffix
  cleaned = cleaned.replace(/\s*-\s*Topic$/i, '');
  // Remove "VEVO" suffix
  cleaned = cleaned.replace(/VEVO$/i, '');
  // Remove "Official Channel" / "Official" suffix
  cleaned = cleaned.replace(/\s*-\s*Official(\s*Channel)?$/i, '');
  cleaned = cleaned.replace(/\s+(Official|Channel)$/i, '');
  // Remove feature credits in artist line
  cleaned = cleaned.replace(/\s+(ft\.?|feat\.?|featuring)\s+.*/gi, '');

  return cleaned.trim() || raw.trim();
}

/**
 * Parses a YouTube title that might contain "Artist - Song Title"
 */
export function parseArtistAndTitle(rawTitle: string, rawArtist: string): { title: string; artist: string } {
  let title = cleanYouTubeTitle(rawTitle);
  let artist = cleanArtistName(rawArtist);

  // If artist is generic like "YouTube Music" or "Unknown" and title has "Artist - Title"
  const isGenericArtist = !artist || /^(youtube\s*(music|video)?|unknown(\s*artist)?|various\s*artists)$/i.test(artist);

  const dashMatch = title.match(/^(.*?)\s*[-–—:]\s*(.*)$/);
  if (dashMatch) {
    const potentialArtist = dashMatch[1].trim();
    const potentialTitle = dashMatch[2].trim();

    if (isGenericArtist && potentialArtist && potentialTitle) {
      artist = cleanArtistName(potentialArtist);
      title = cleanYouTubeTitle(potentialTitle);
    } else if (potentialTitle && potentialArtist.toLowerCase() === artist.toLowerCase()) {
      title = cleanYouTubeTitle(potentialTitle);
    }
  }

  return { title, artist };
}

/**
 * Checks if a string contains Devanagari script (Nepali / Hindi)
 */
export function hasDevanagari(str: string): boolean {
  return /[\u0900-\u097F]/.test(str);
}

/**
 * Generates search query variations for songs with dual scripts (e.g. "English (Devanagari)")
 */
export function extractTitleVariants(title: string): string[] {
  const variants = new Set<string>();
  const clean = cleanYouTubeTitle(title);
  if (!clean) return [];

  variants.add(clean);

  // Check for bilingual titles: "Hataarindai (हतारिँदै)" or "माया (Maya)"
  const bracketMatch = clean.match(/^(.*?)\s*[\(\[\{](.*?)[\)\]\}]\s*$/);
  if (bracketMatch) {
    const main = bracketMatch[1].trim();
    const bracketed = bracketMatch[2].trim();
    if (main) variants.add(main);
    if (bracketed) variants.add(bracketed);
  }

  // Check for split by pipe or slash or hyphen: "Maya | माया"
  const splitMatch = clean.split(/\s*[|\/–—]\s*/);
  if (splitMatch.length > 1) {
    for (const part of splitMatch) {
      const p = part.trim();
      if (p.length > 1) variants.add(p);
    }
  }

  return Array.from(variants);
}

/**
 * Normalizes string for strict database and fuzzy cache comparison.
 * Preserves Devanagari Unicode characters while stripping diacritics and punctuation.
 */
export function normalizeForSearch(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove standard Latin diacritics
    .replace(/(\(|\[)(official\s*(music\s*)?(video|audio|lyrics|hd|4k|remastered|lyric\s*video|visualizer)|remastered\s*\d*).*?(\)|\])/gi, '')
    .replace(/\s*-\s*(official\s*(music\s*)?(video|audio|lyrics)|visualizer)/gi, '')
    .replace(/\s+(ft\.|feat\.|featuring)\s+.*/gi, '')
    // Keep alphanumeric and Devanagari characters (\u0900-\u097F)
    .replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '')
    .trim();
}
