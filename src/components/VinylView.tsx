import React, { useState, memo } from 'react';
import { Station, TrackMetadata } from '../types';
import { AudioVisualizerCanvas, VisualizerMode } from './AudioVisualizerCanvas';
import { ListMusic, Plus, Download, WifiOff, Sparkles } from 'lucide-react';
import { CoverColorPalette } from '../services/colorSyncService';

interface VinylViewProps {
  station: Station | null;
  currentTrack: TrackMetadata | null;
  isPlaying: boolean;
  isBuffering: boolean;
  volume?: number;
  isMuted?: boolean;
  playlistTrackCount?: number;
  isOfflineMode?: boolean;
  offlineTracksCount?: number;
  palette?: CoverColorPalette;
  onTogglePlay?: () => void;
  onOpenPlaylistManager?: () => void;
  onOpenOfflineLibrary?: () => void;
  onOpenQueue?: () => void;
}

export const VinylView: React.FC<VinylViewProps> = memo(({
  station,
  currentTrack,
  isPlaying,
  isBuffering,
  volume = 0.8,
  isMuted = false,
  playlistTrackCount = 0,
  isOfflineMode = false,
  offlineTracksCount = 0,
  palette,
  onTogglePlay,
  onOpenPlaylistManager,
  onOpenOfflineLibrary,
  onOpenQueue,
}) => {
  const [visMode, setVisMode] = useState<VisualizerMode>('bars');
  const isVinylActive = isPlaying && !isBuffering;
  const coverImage = currentTrack?.thumbnail || station?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80';
  const trackTitle = currentTrack?.title || station?.name || 'Ready to Stream';
  const trackArtist = currentTrack?.author || station?.tag || 'Paste or Select a Playlist to Play';
  const accentColor = palette?.primary || station?.color || '#6366F1';

  return (
    <div 
      id="vinyl-view-container" 
      className="relative flex flex-col items-center justify-center w-full py-4 sm:py-6 md:py-8 px-2 sm:px-4 select-none"
    >
      {/* Background Reactive Ambient Aura Synchronized with Cover Color */}
      <div
        className={`absolute w-[min(70vh,520px)] h-[min(70vh,520px)] rounded-full blur-[70px] sm:blur-[110px] pointer-events-none transition-all duration-1000 -z-10 ${
          isVinylActive && !isMuted ? 'opacity-85 scale-105 animate-pulse' : 'opacity-25 scale-95'
        }`}
        style={{
          background: palette 
            ? `radial-gradient(circle, ${palette.ambientGlow} 0%, ${palette.ambientLightGlow} 50%, transparent 80%)`
            : 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 75%)',
        }}
      />

      {/* Turntable / Vinyl Housing */}
      <div 
        className="relative flex items-center justify-center cursor-pointer group shrink-0 my-1 sm:my-2"
        onClick={onTogglePlay}
        title={isPlaying ? 'Click record to Pause' : 'Click record to Play'}
      >
        {/* Turntable Platter Base */}
        <div 
          className="relative w-[230px] h-[230px] xs:w-[260px] xs:h-[260px] sm:w-[310px] sm:h-[310px] md:w-[360px] md:h-[360px] lg:w-[390px] lg:h-[390px] xl:w-[410px] xl:h-[410px] rounded-3xl sm:rounded-[36px] bg-slate-900/90 p-3 sm:p-4 shadow-2xl border border-white/10 flex items-center justify-center overflow-hidden transition-transform duration-300 ease-out group-hover:scale-[1.02] group-active:scale-[0.98]"
        >
          {/* Subtle outer metallic rim */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-slate-950/90 pointer-events-none" />

          {/* Hover overlay hint */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center rounded-3xl pointer-events-none">
            <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xl">
              <span>{isPlaying ? '⏸ Pause' : '▶ Play'}</span>
            </div>
          </div>

          {/* Spinning Vinyl Record with Grooves */}
          <div
            className="relative w-full h-full rounded-full bg-[#0d0e12] shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-700 ease-out border border-white/5"
            style={{
              animation: 'spin 16s linear infinite',
              animationPlayState: isVinylActive ? 'running' : 'paused',
              backgroundImage: `
                radial-gradient(circle at center, transparent 33%, rgba(255,255,255,0.05) 34%, transparent 35%),
                radial-gradient(circle at center, transparent 44%, rgba(255,255,255,0.04) 45%, transparent 46%),
                radial-gradient(circle at center, transparent 56%, rgba(255,255,255,0.045) 57%, transparent 58%),
                radial-gradient(circle at center, transparent 68%, rgba(255,255,255,0.035) 69%, transparent 70%),
                radial-gradient(circle at center, transparent 80%, rgba(255,255,255,0.04) 81%, transparent 82%),
                radial-gradient(circle at center, transparent 92%, rgba(255,255,255,0.03) 93%, transparent 94%),
                radial-gradient(circle at center, #13141a 0%, #0a0b0e 70%, #040507 100%)
              `,
            }}
          >
            {/* Vinyl Sheen Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/[0.06] via-transparent to-white/[0.08] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/[0.05] via-transparent to-white/[0.06] pointer-events-none" />

            {/* Center Label / Album Artwork */}
            <div className="relative w-[38%] h-[38%] rounded-full border-2 sm:border-3 border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
              <img
                src={coverImage}
                alt={trackTitle}
                className="w-full h-full object-cover select-none pointer-events-none"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80';
                }}
              />

              {/* Center Spindle Hole */}
              <div className="absolute w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full bg-slate-950 border border-white/25 shadow-md flex items-center justify-center">
                <div 
                  className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-colors duration-700" 
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 0 8px ${accentColor}`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Precision Unified Tonearm Assembly */}
        <div
          className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 md:-top-6 md:-right-6 w-28 sm:w-36 md:w-44 lg:w-48 h-36 sm:h-48 md:h-56 lg:h-60 pointer-events-none transition-transform duration-700 ease-in-out origin-[82%_14%]"
          style={{
            transform: isVinylActive ? 'rotate(0deg)' : 'rotate(-28deg)',
          }}
        >
          <svg
            viewBox="0 0 140 180"
            className="w-full h-full overflow-visible drop-shadow-2xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Metallic Arm Gradient */}
              <linearGradient id="arm-metallic-grad" x1="115" y1="25" x2="42" y2="135" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="35%" stopColor="#E2E8F0" />
                <stop offset="65%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Base Pivot Metal Gradient */}
              <linearGradient id="pivot-metal-grad" x1="95" y1="5" x2="135" y2="45" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>

              {/* Glow Filter for Active Stylus LED Indicator */}
              <filter id="stylus-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Resting Stand Bracket (Docking base) */}
            <rect x="118" y="58" width="12" height="5" rx="2" fill="#334155" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

            {/* Main Metallic Tonearm Stick / Rod */}
            <path
              d="M 115 25 L 42 135"
              stroke="url(#arm-metallic-grad)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Luminous Light Reflection Sheen on the Stick */}
            <path
              d="M 114 26 L 43 134"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Headshell / Cartridge directly at the tip of the stick touching the vinyl */}
            <g transform="translate(42, 135) rotate(22)">
              {/* Cartridge housing sitting on top of the stick tip */}
              <rect
                x="-8"
                y="-6"
                width="16"
                height="24"
                rx="4"
                fill="#0F172A"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.5"
              />
              {/* Stylus needle pin touching the groove */}
              <polygon
                points="-3.5,18 3.5,18 0,25"
                fill="#CBD5E1"
              />
              {/* That glowing button / LED indicator on top of the stick touching the vinyl */}
              <circle
                cx="0"
                cy="5"
                r="3.5"
                fill={accentColor}
                filter="url(#stylus-glow)"
              />
              <circle
                cx="0"
                cy="5"
                r="1.5"
                fill="#FFFFFF"
                opacity="0.9"
              />
            </g>

            {/* Top-Right Base Gimbal Bearing Pivot */}
            <circle
              cx="115"
              cy="25"
              r="17"
              fill="url(#pivot-metal-grad)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
            />
            <circle
              cx="115"
              cy="25"
              r="11"
              fill="#0F172A"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
            />
            {/* Gimbal Center Accent Dot */}
            <circle
              cx="115"
              cy="25"
              r="4.5"
              fill={accentColor}
              filter="url(#stylus-glow)"
            />
            <circle
              cx="115"
              cy="25"
              r="1.8"
              fill="#FFFFFF"
              opacity="0.9"
            />
          </svg>
        </div>
      </div>

      {/* Track Info & Visualizer */}
      <div className="mt-3 sm:mt-4 flex flex-col items-center justify-center text-center max-w-lg lg:max-w-xl px-2 space-y-2 w-full shrink-0 mx-auto">
        <div 
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs uppercase font-bold tracking-wider backdrop-blur-sm mx-auto transition-all duration-700"
          style={{
            backgroundColor: palette ? `rgba(${palette.primaryRgb[0]}, ${palette.primaryRgb[1]}, ${palette.primaryRgb[2]}, 0.12)` : 'rgba(99, 102, 241, 0.10)',
            borderColor: palette ? `rgba(${palette.primaryRgb[0]}, ${palette.primaryRgb[1]}, ${palette.primaryRgb[2]}, 0.25)` : 'rgba(99, 102, 241, 0.20)',
            color: palette ? palette.primary : '#A5B4FC',
          }}
        >
          <span 
            className="w-1.5 h-1.5 rounded-full animate-ping shrink-0" 
            style={{ backgroundColor: accentColor }}
          />
          <span className="truncate max-w-[140px] sm:max-w-[200px]">{station?.name || 'YouTube Stream'}</span>
          <span className="text-white/20">•</span>
          <span className="truncate max-w-[90px] sm:max-w-[130px]">{station?.tag || 'Radio'}</span>
        </div>

        <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-100 line-clamp-1 px-1 text-center w-full">
          {trackTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium line-clamp-1 text-center w-full">
          {trackArtist}
        </p>

        {/* 60 FPS Interactive Audio Visualizer */}
        <div className="w-full max-w-sm sm:max-w-md pt-1 mx-auto flex flex-col items-center justify-center">
          <AudioVisualizerCanvas
            isPlaying={isPlaying}
            isBuffering={isBuffering}
            volume={volume}
            isMuted={isMuted}
            stationTag={station?.tag || ''}
            accentColor={accentColor}
            mode={visMode}
            onModeChange={setVisMode}
            showModeSelector={true}
            showBeatControls={false}
            height={38}
            barCount={32}
            interactive={true}
          />
        </div>

        {/* Quick Option Navigator Pills for PC & Desktop */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5 w-full mx-auto">
          {onOpenOfflineLibrary && (
            <button
              id="btn-vinyl-downloads"
              onClick={onOpenOfflineLibrary}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95 text-center ${
                isOfflineMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-amber-500/10'
                  : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 hover:text-white border border-emerald-500/35'
              }`}
            >
              <Download className={`w-3.5 h-3.5 ${isOfflineMode ? 'text-amber-400' : 'text-emerald-400'} shrink-0`} />
              <span>{isOfflineMode ? 'Device Offline • Downloads' : `Downloads ${offlineTracksCount > 0 ? `(${offlineTracksCount})` : ''}`}</span>
            </button>
          )}

          {onOpenQueue && (
            <button
              id="btn-vinyl-open-queue"
              onClick={onOpenQueue}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 hover:text-white border border-indigo-500/35 text-xs font-semibold transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95 text-center"
            >
              <ListMusic className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Playlist Queue {playlistTrackCount > 0 && `(${playlistTrackCount})`}</span>
            </button>
          )}

          {onOpenPlaylistManager && (
            <button
              id="btn-vinyl-add-url"
              onClick={onOpenPlaylistManager}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95 text-center"
            >
              <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Add YouTube URL</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

VinylView.displayName = 'VinylView';

