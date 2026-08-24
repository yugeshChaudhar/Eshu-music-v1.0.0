import React, { useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Heart, 
  ListMusic, 
  Mic2, 
  Maximize2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Track } from '../types';

interface EchoMiniPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  isFavorite: boolean;
  activeLyricLine?: string;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onToggleFavorite: () => void;
  onOpenFullPlayer: () => void;
  onOpenQueue: () => void;
  onOpenLyrics: () => void;
  onSeek: (seconds: number) => void;
  seedColor?: string;
}

export const EchoMiniPlayer: React.FC<EchoMiniPlayerProps> = ({
  currentTrack,
  isPlaying,
  isBuffering,
  currentTime,
  duration,
  isFavorite,
  activeLyricLine,
  onTogglePlay,
  onNextTrack,
  onToggleFavorite,
  onOpenFullPlayer,
  onOpenQueue,
  onOpenLyrics,
  onSeek,
  seedColor = '#FF5252',
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  return (
    <div className="fixed bottom-14 md:bottom-4 left-0 right-0 z-40 px-2 sm:px-6 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div 
          onClick={onOpenFullPlayer}
          className="relative overflow-hidden rounded-3xl bg-neutral-900/90 hover:bg-neutral-900/98 backdrop-blur-2xl border border-white/15 shadow-2xl p-2.5 sm:p-3 transition-all cursor-pointer group"
        >
          {/* Subtle Ambient Glow */}
          <div 
            className="absolute -top-12 -left-12 w-36 h-36 rounded-full opacity-20 blur-2xl pointer-events-none transition-colors"
            style={{ backgroundColor: seedColor }}
          />

          <div className="flex items-center justify-between gap-3 relative z-10">
            {/* Left: Thumbnail & Song Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-neutral-800 flex-shrink-0 shadow-md">
                <img 
                  src={currentTrack.thumbnail} 
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                />
                {isBuffering && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 pr-2">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#FF5252] transition-colors">
                  {currentTrack.title}
                </h4>
                
                {/* Active Lyric snippet or Artist */}
                {activeLyricLine ? (
                  <p className="text-[11px] font-semibold text-[#FFFF00] truncate flex items-center gap-1.5 animate-fadeIn">
                    <Mic2 className="w-3 h-3 text-[#FFFF00] flex-shrink-0" />
                    <span>{activeLyricLine}</span>
                  </p>
                ) : (
                  <p className="text-[11px] font-medium text-neutral-400 truncate">
                    {currentTrack.artist}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              {/* Like / Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Like Song"
              >
                <Heart 
                  className={`w-4 h-4 transition-transform active:scale-125 ${
                    isFavorite ? 'fill-[#FF4081] text-[#FF4081]' : 'text-neutral-400'
                  }`} 
                />
              </button>

              {/* Lyrics Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLyrics();
                }}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
                title="Synced Lyrics"
              >
                <Mic2 className="w-4 h-4" />
              </button>

              {/* Play / Pause Main Action */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay();
                }}
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-black font-bold shadow-lg transition-transform active:scale-95"
                style={{ backgroundColor: seedColor }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isBuffering ? (
                  <Loader2 className="w-5 h-5 text-black animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                )}
              </button>

              {/* Next Track Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNextTrack();
                }}
                className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Next Track"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Expand Full Player */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenFullPlayer();
                }}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
                title="Expand Now Playing"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Smooth Bottom Line Progress Bar */}
          <div 
            ref={progressBarRef}
            onClick={handleProgressBarClick}
            className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 hover:h-1.5 cursor-pointer transition-all"
          >
            <div 
              className="h-full transition-all duration-150"
              style={{ 
                width: `${progressPercent}%`,
                backgroundColor: seedColor
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
