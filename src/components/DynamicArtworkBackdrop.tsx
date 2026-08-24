import React, { memo } from 'react';
import { CoverColorPalette, DEFAULT_PALETTE } from '../services/colorSyncService';
import { ThemeMode } from '../types';

interface DynamicArtworkBackdropProps {
  palette?: CoverColorPalette | null;
  theme: ThemeMode;
  isPlaying: boolean;
  isMuted?: boolean;
}

export const DynamicArtworkBackdrop: React.FC<DynamicArtworkBackdropProps> = memo(({
  palette: inputPalette,
  theme,
  isPlaying,
  isMuted = false,
}) => {
  const isLight = theme === 'cream-light';
  const palette = inputPalette || DEFAULT_PALETTE;

  const pr = palette.primaryRgb ? palette.primaryRgb[0] : 99;
  const pg = palette.primaryRgb ? palette.primaryRgb[1] : 102;
  const pb = palette.primaryRgb ? palette.primaryRgb[2] : 241;

  const sr = palette.secondaryRgb ? palette.secondaryRgb[0] : 168;
  const sg = palette.secondaryRgb ? palette.secondaryRgb[1] : 85;
  const sb = palette.secondaryRgb ? palette.secondaryRgb[2] : 247;

  return (
    <div 
      id="dynamic-artwork-backdrop-layer"
      className="absolute inset-0 pointer-events-none overflow-hidden transition-all duration-1000 select-none -z-10"
      aria-hidden="true"
    >
      {/* Full Canvas Dynamic Tint Gradient from Cover Artwork */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: isLight
            ? `radial-gradient(ellipse at 50% 15%, rgba(${pr}, ${pg}, ${pb}, 0.18) 0%, rgba(${sr}, ${sg}, ${sb}, 0.08) 45%, #F5F4F0 85%)`
            : `radial-gradient(ellipse at 50% 20%, rgba(${pr}, ${pg}, ${pb}, 0.34) 0%, rgba(${sr}, ${sg}, ${sb}, 0.18) 45%, rgba(${Math.min(20, Math.round(pr * 0.08 + 6))}, ${Math.min(20, Math.round(pg * 0.08 + 6))}, ${Math.min(24, Math.round(pb * 0.08 + 9))}, 0.96) 85%)`,
        }}
      />

      {/* Primary Radial Luminous Aura (Centered around current song/vinyl) */}
      <div
        className={`absolute -top-[10%] left-1/2 -translate-x-1/2 w-[min(130vw,1050px)] h-[min(95vh,780px)] rounded-full blur-[100px] sm:blur-[150px] transition-all duration-1000 ${
          isPlaying && !isMuted ? 'opacity-90 scale-105 animate-pulse' : 'opacity-45 scale-95'
        }`}
        style={{
          background: isLight 
            ? `radial-gradient(circle, rgba(${pr}, ${pg}, ${pb}, 0.28) 0%, rgba(${sr}, ${sg}, ${sb}, 0.12) 55%, transparent 80%)`
            : `radial-gradient(circle, rgba(${pr}, ${pg}, ${pb}, 0.48) 0%, rgba(${sr}, ${sg}, ${sb}, 0.24) 50%, transparent 80%)`,
        }}
      />

      {/* Secondary Complementary Hue (Bottom Left Depth) */}
      <div
        className={`absolute -bottom-[12%] -left-[10%] w-[min(90vw,650px)] h-[min(75vh,520px)] rounded-full blur-[90px] sm:blur-[140px] transition-all duration-1000 ${
          isPlaying && !isMuted ? 'opacity-80 translate-y-0' : 'opacity-30 translate-y-4'
        }`}
        style={{
          background: `radial-gradient(circle, rgba(${sr}, ${sg}, ${sb}, ${isLight ? 0.18 : 0.36}) 0%, transparent 75%)`,
        }}
      />

      {/* Right Corner Accent Glow */}
      <div
        className={`absolute top-1/4 -right-[10%] w-[min(75vw,540px)] h-[min(65vh,480px)] rounded-full blur-[95px] sm:blur-[140px] transition-all duration-1000 ${
          isPlaying && !isMuted ? 'opacity-75 scale-100' : 'opacity-25 scale-90'
        }`}
        style={{
          background: `radial-gradient(circle, rgba(${pr}, ${pg}, ${pb}, ${isLight ? 0.16 : 0.32}) 0%, transparent 70%)`,
        }}
      />

      {/* Subtle Noise / Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
});
