import React, { useEffect, useRef, memo } from 'react';
import { Station, TrackMetadata } from '../types';
import { Sparkles, Music } from 'lucide-react';
import { AudioVisualizerCanvas } from './AudioVisualizerCanvas';
import { CoverColorPalette } from '../services/colorSyncService';

interface AmbientBackdropViewProps {
  station: Station | null;
  currentTrack: TrackMetadata | null;
  isPlaying: boolean;
  volume?: number;
  isMuted?: boolean;
  palette?: CoverColorPalette;
}

export const AmbientBackdropView: React.FC<AmbientBackdropViewProps> = memo(({
  station,
  currentTrack,
  isPlaying,
  volume = 0.8,
  isMuted = false,
  palette,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coverImage = currentTrack?.thumbnail || station?.coverUrl || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80';
  const trackTitle = currentTrack?.title || station?.name || 'ESHU MUSIC Stream';
  const trackArtist = currentTrack?.author || station?.tag || 'Relaxing Vibes';
  const accentColor = palette?.primary || station?.color || '#E0A96D';

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const paletteRef = useRef(palette);
  paletteRef.current = palette;

  // Floating reactive particles canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      baseAlpha: number;
    }> = [];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.2,
        alpha: Math.random() * 0.4 + 0.1,
        baseAlpha: Math.random() * 0.4 + 0.1,
      });
    }

    const ripples: Array<{ x: number; y: number; radius: number; maxRadius: number; alpha: number }> = [];

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ripples.push({
        x,
        y,
        radius: 4,
        maxRadius: 200,
        alpha: 0.8,
      });
    };

    canvas.addEventListener('click', handleCanvasClick);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const playing = isPlayingRef.current && !isMutedRef.current;
      const beatThump = playing ? Math.sin(Date.now() / 450) * 0.5 + 0.5 : 0;
      const pal = paletteRef.current;
      const pr = pal?.primaryRgb?.[0] ?? 129;
      const pg = pal?.primaryRgb?.[1] ?? 140;
      const pb = pal?.primaryRgb?.[2] ?? 248;

      const sr = pal?.secondaryRgb?.[0] ?? 165;
      const sg = pal?.secondaryRgb?.[1] ?? 180;
      const sb = pal?.secondaryRgb?.[2] ?? 252;

      // Draw Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 2;
        r.alpha -= 0.015;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, ${r.alpha * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // Draw Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy - beatThump * 0.3;
        p.alpha = Math.min(1, p.baseAlpha + beatThump * 0.3);

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + beatThump * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${sr}, ${sg}, ${sb}, ${p.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div id="ambient-backdrop-container" className="relative flex flex-col items-center justify-center w-full h-full p-2 sm:p-4 select-none overflow-hidden max-h-full my-auto">
      {/* Background Interactive Ambient Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto cursor-pointer"
        title="Click anywhere for ripple effects"
      />

      {/* Atmospheric Glow Center */}
      <div 
        className="absolute w-[min(70vh,520px)] h-[min(70vh,520px)] rounded-full blur-[90px] sm:blur-[140px] pointer-events-none -z-10 transition-all duration-1000"
        style={{
          background: palette ? palette.ambientGlow : (accentColor ? `${accentColor}25` : 'rgba(99, 102, 241, 0.15)'),
        }}
      />

      {/* Foreground Album Artwork Display Card (Responsive across PC, Tablet & Mobile) */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 md:gap-8 max-w-2xl lg:max-w-3xl w-full p-3 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl bg-[#0d0e14]/80 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden shrink-0">
        {/* Cover Art Box */}
        <div className="relative group shrink-0">
          <div className="w-28 h-28 xs:w-36 xs:h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-slate-950">
            <img
              src={coverImage}
              alt={trackTitle}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {isPlaying && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>Live</span>
            </div>
          )}
        </div>

        {/* Info & Details */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 min-w-0 w-full space-y-1 sm:space-y-1.5">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span className="truncate max-w-[150px] sm:max-w-[200px]">{station?.name || 'Curated Stream'}</span>
          </div>

          <h2 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-100 line-clamp-1 leading-snug">
            {trackTitle}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 font-medium flex items-center gap-1.5 line-clamp-1">
            <Music className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{trackArtist}</span>
          </p>

          {/* Interactive Audio Visualizer */}
          <div className="w-full pt-1">
            <AudioVisualizerCanvas
              isPlaying={isPlaying}
              volume={volume}
              isMuted={isMuted}
              stationTag={station?.tag || ''}
              mode="bars"
              showModeSelector={false}
              height={32}
              barCount={28}
              interactive={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

AmbientBackdropView.displayName = 'AmbientBackdropView';
