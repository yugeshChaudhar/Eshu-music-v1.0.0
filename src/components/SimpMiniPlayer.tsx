import React from 'react';
import { Track } from '../types';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Heart, 
  Maximize2, 
  Disc, 
  Volume2, 
  VolumeX, 
  Radio, 
  Mic2,
  ListMusic
} from 'lucide-react';

interface SimpMiniPlayerProps {
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
}

export const SimpMiniPlayer: React.FC<SimpMiniPlayerProps> = ({
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
}) => {
  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    onSeek(pos * duration);
  };

  return (
    <div className="fixed bottom-[68px] lg:bottom-4 left-3 right-3 lg:left-[272px] lg:right-6 z-30 pointer-events-auto">
      <div 
        onClick={onOpenFullPlayer}
        className="group relative overflow-hidden bg-neutral-900/90 hover:bg-neutral-900/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/80 transition-all cursor-pointer select-none"
      >
        {/* Top Edge Audio Scrub Progress Bar */}
        <div 
          onClick={handleProgressBarClick}
          className="relative w-full h-1 bg-white/[0.08] cursor-pointer group-hover:h-1.5 transition-all"
        >
          <div 
            className="h-full bg-gradient-to-r from-[#8ECAE6] to-[#06D6A0] relative transition-all duration-100"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 sm:p-3 gap-3">
          {/* Left: Thumbnail + Title & Artist */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-xl overflow-hidden bg-neutral-800 shrink-0 shadow-md">
              <img 
                src={currentTrack.thumbnail} 
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="flex gap-0.5 items-end h-4">
                    <span className="w-1 bg-[#8ECAE6] animate-[bounce_0.8s_infinite_ease-in-out] rounded-full h-3" />
                    <span className="w-1 bg-[#8ECAE6] animate-[bounce_0.6s_infinite_ease-in-out_0.2s] rounded-full h-4" />
                    <span className="w-1 bg-[#8ECAE6] animate-[bounce_0.7s_infinite_ease-in-out_0.4s] rounded-full h-2" />
                  </span>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate group-hover:text-[#8ECAE6] transition-colors">
                {currentTrack.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="truncate">{currentTrack.artist}</span>
                {currentTrack.album && (
                  <>
                    <span className="text-neutral-600 hidden sm:inline">•</span>
                    <span className="text-neutral-500 truncate hidden sm:inline">{currentTrack.album}</span>
                  </>
                )}
              </div>

              {/* Active Synced Lyric Preview */}
              {activeLyricLine && (
                <p className="text-[11px] text-[#FFFF00] font-medium truncate mt-0.5 flex items-center gap-1 animate-fadeIn">
                  <Mic2 className="w-3 h-3 shrink-0" />
                  <span>{activeLyricLine}</span>
                </p>
              )}
            </div>
          </div>

          {/* Right: Controls (Like, Play/Pause, Next, Lyrics, Expand) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Time Indicator (Desktop) */}
            <span className="text-xs text-neutral-400 font-mono hidden md:inline-block mr-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={`p-2 rounded-full transition-all ${
                isFavorite 
                  ? 'text-[#FF4081] hover:scale-110' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              title={isFavorite ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#FF4081]' : ''}`} />
            </button>

            {/* Lyrics View Trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenLyrics();
              }}
              className="p-2 rounded-full text-neutral-400 hover:text-[#8ECAE6] hover:bg-white/10 transition-colors hidden sm:inline-flex"
              title="View Synced Lyrics"
            >
              <Mic2 className="w-5 h-5" />
            </button>

            {/* Queue Trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenQueue();
              }}
              className="p-2 rounded-full text-neutral-400 hover:text-[#8ECAE6] hover:bg-white/10 transition-colors hidden sm:inline-flex"
              title="Up Next Queue"
            >
              <ListMusic className="w-5 h-5" />
            </button>

            {/* Play / Pause Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
              }}
              className="w-10 h-10 rounded-full bg-white hover:bg-[#8ECAE6] text-black flex items-center justify-center shadow-lg transition-transform active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isBuffering ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
              className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Expand Fullscreen Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenFullPlayer();
              }}
              className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors hidden sm:inline-flex"
              title="Expand Now Playing"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
