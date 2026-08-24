export interface CoverColorPalette {
  primary: string;         // e.g. '#6366f1' or 'rgb(99, 102, 241)'
  secondary: string;       // e.g. '#ec4899' or 'rgb(236, 72, 153)'
  accent: string;          // vibrant highlight
  ambientDark: string;     // deep tinted background
  ambientGlow: string;     // radiant soft aura (rgba)
  ambientLightGlow: string;// subtle lighter glow
  gradientOverlay: string; // CSS background gradient
  primaryRgb: [number, number, number];
  secondaryRgb: [number, number, number];
}

export const DEFAULT_PALETTE: CoverColorPalette = {
  primary: '#6366F1',
  secondary: '#A855F7',
  accent: '#EC4899',
  ambientDark: 'rgba(10, 10, 14, 0.95)',
  ambientGlow: 'rgba(99, 102, 241, 0.28)',
  ambientLightGlow: 'rgba(168, 85, 247, 0.18)',
  gradientOverlay: 'radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.15) 45%, rgba(10, 10, 14, 0.95) 85%)',
  primaryRgb: [99, 102, 241],
  secondaryRgb: [168, 85, 247],
};

const paletteCache = new Map<string, CoverColorPalette>();

// Hash fallback for cases where CORS prevents canvas pixel read
function generateHarmoniousPaletteFromSeed(seed: string, fallbackColor?: string): CoverColorPalette {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  // Predefined vibrant aesthetic palettes
  const palettes = [
    { p: [99, 102, 241], s: [236, 72, 153], a: [244, 114, 182] },  // Indigo & Pink
    { p: [139, 92, 246], s: [59, 130, 246], a: [147, 197, 253] },  // Violet & Blue
    { p: [236, 72, 153], s: [249, 115, 22], a: [253, 186, 116] },  // Rose & Orange
    { p: [16, 185, 129], s: [6, 182, 212], a: [103, 232, 249] },   // Emerald & Cyan
    { p: [245, 158, 11], s: [239, 68, 68], a: [252, 165, 165] },   // Amber & Red
    { p: [217, 70, 239], s: [99, 102, 241], a: [196, 181, 253] },  // Fuchsia & Indigo
    { p: [20, 184, 166], s: [59, 130, 246], a: [125, 211, 252] },  // Teal & Sky
    { p: [225, 29, 72], s: [147, 51, 234], a: [216, 180, 254] },   // Crimson & Purple
    { p: [234, 88, 12], s: [202, 138, 4], a: [253, 224, 71] },     // Flame & Gold
  ];

  const idx = Math.abs(hash) % palettes.length;
  const chosen = palettes[idx];

  // If fallback hex color is provided, blend it in
  let pr = chosen.p[0];
  let pg = chosen.p[1];
  let pb = chosen.p[2];

  if (fallbackColor && fallbackColor.startsWith('#') && fallbackColor.length === 7) {
    pr = parseInt(fallbackColor.slice(1, 3), 16);
    pg = parseInt(fallbackColor.slice(3, 5), 16);
    pb = parseInt(fallbackColor.slice(5, 7), 16);
  }

  const sr = chosen.s[0];
  const sg = chosen.s[1];
  const sb = chosen.s[2];

  const ar = chosen.a[0];
  const ag = chosen.a[1];
  const ab = chosen.a[2];

  const primary = `rgb(${pr}, ${pg}, ${pb})`;
  const secondary = `rgb(${sr}, ${sg}, ${sb})`;
  const accent = `rgb(${ar}, ${ag}, ${ab})`;
  const ambientDark = `rgba(${Math.round(pr * 0.08 + 5)}, ${Math.round(pg * 0.08 + 5)}, ${Math.round(pb * 0.08 + 7)}, 0.96)`;
  const ambientGlow = `rgba(${pr}, ${pg}, ${pb}, 0.32)`;
  const ambientLightGlow = `rgba(${sr}, ${sg}, ${sb}, 0.22)`;
  const gradientOverlay = `radial-gradient(circle at 50% 25%, rgba(${pr}, ${pg}, ${pb}, 0.32) 0%, rgba(${sr}, ${sg}, ${sb}, 0.18) 50%, rgba(8, 8, 11, 0.94) 88%)`;

  return {
    primary,
    secondary,
    accent,
    ambientDark,
    ambientGlow,
    ambientLightGlow,
    gradientOverlay,
    primaryRgb: [pr, pg, pb],
    secondaryRgb: [sr, sg, sb],
  };
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}

/**
 * Extracts vibrant dominant colors directly from any cover art image (using offscreen Canvas)
 */
export async function extractPaletteFromImage(
  imageUrl: string,
  fallbackColor?: string
): Promise<CoverColorPalette> {
  if (!imageUrl) return DEFAULT_PALETTE;

  if (paletteCache.has(imageUrl)) {
    return paletteCache.get(imageUrl)!;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const fallback = () => {
      const pal = generateHarmoniousPaletteFromSeed(imageUrl, fallbackColor);
      paletteCache.set(imageUrl, pal);
      resolve(pal);
    };

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          fallback();
          return;
        }

        const size = 36;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size).data;
        const colorBuckets: Array<{ r: number; g: number; b: number; score: number; sat: number; light: number }> = [];

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue;

          const [h, s, l] = rgbToHsl(r, g, b);

          // Discard extreme black, white, and completely washed out greys
          if (l < 0.12 || l > 0.92 || s < 0.14) continue;

          // Score vibrant saturated colors higher for beautiful luminous backdrops
          const vibrancyScore = s * 1.8 + (1 - Math.abs(l - 0.5) * 2);
          colorBuckets.push({ r, g, b, score: vibrancyScore, sat: s, light: l });
        }

        if (colorBuckets.length === 0) {
          fallback();
          return;
        }

        // Sort by vibrant aesthetic score
        colorBuckets.sort((a, b) => b.score - a.score);

        // Find primary dominant color
        const prim = colorBuckets[0];
        const pr = prim.r;
        const pg = prim.g;
        const pb = prim.b;

        // Find distinct secondary color (must be visually distinct in hue or tone)
        let sec = colorBuckets[Math.min(10, colorBuckets.length - 1)];
        for (let i = 1; i < colorBuckets.length; i++) {
          const candidate = colorBuckets[i];
          const dist = Math.sqrt(
            Math.pow(candidate.r - pr, 2) +
            Math.pow(candidate.g - pg, 2) +
            Math.pow(candidate.b - pb, 2)
          );
          if (dist > 75) {
            sec = candidate;
            break;
          }
        }

        const sr = sec.r;
        const sg = sec.g;
        const sb = sec.b;

        // Formulate refined glowing palette
        const primary = `rgb(${pr}, ${pg}, ${pb})`;
        const secondary = `rgb(${sr}, ${sg}, ${sb})`;
        const accent = `rgb(${Math.min(255, Math.round(pr * 1.2))}, ${Math.min(255, Math.round(pg * 1.2))}, ${Math.min(255, Math.round(pb * 1.2))})`;
        
        // Deep atmosphere tint
        const darkR = Math.min(20, Math.round(pr * 0.08 + 6));
        const darkG = Math.min(20, Math.round(pg * 0.08 + 6));
        const darkB = Math.min(24, Math.round(pb * 0.08 + 9));
        const ambientDark = `rgba(${darkR}, ${darkG}, ${darkB}, 0.96)`;

        const ambientGlow = `rgba(${pr}, ${pg}, ${pb}, 0.35)`;
        const ambientLightGlow = `rgba(${sr}, ${sg}, ${sb}, 0.22)`;
        const gradientOverlay = `radial-gradient(circle at 50% 25%, rgba(${pr}, ${pg}, ${pb}, 0.36) 0%, rgba(${sr}, ${sg}, ${sb}, 0.20) 48%, rgba(${darkR}, ${darkG}, ${darkB}, 0.95) 86%)`;

        const finalPalette: CoverColorPalette = {
          primary,
          secondary,
          accent,
          ambientDark,
          ambientGlow,
          ambientLightGlow,
          gradientOverlay,
          primaryRgb: [pr, pg, pb],
          secondaryRgb: [sr, sg, sb],
        };

        paletteCache.set(imageUrl, finalPalette);
        resolve(finalPalette);
      } catch (err) {
        fallback();
      }
    };

    img.onerror = fallback;
    img.src = imageUrl;

    // Safety timeout in case image takes too long
    setTimeout(fallback, 1200);
  });
}
