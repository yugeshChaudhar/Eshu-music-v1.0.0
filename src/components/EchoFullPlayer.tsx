import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Heart, 
  ListMusic, 
  Mic2, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Moon, 
  Disc3, 
  Sparkles, 
  Video, 
  Image as ImageIcon,
  Film,
  ShieldCheck,
  Languages,
  Loader2,
  FolderPlus,
  X,
  Plus,
  Edit3,
  FileText
} from 'lucide-react';
import { Track, PlayerViewMode, LyricsData } from '../types';

interface EchoFullPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  isFavorite: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  volume: number;
  lyricsData: LyricsData | null;
  isLoadingLyrics: boolean;
  initialViewMode?: PlayerViewMode;
  sponsorBlockSkippedCount?: number;
  onClose: () => void;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleFavorite: () => void;
  onAddToPlaylist?: () => void;
  onOpenAddToPlaylist?: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onOpenQueue: () => void;
  onOpenEqualizer: () => void;
  onOpenSleepTimer: () => void;
  onOpenLyricsStudio?: () => void;
  seedColor?: string;
}

export const EchoFullPlayer: React.FC<EchoFullPlayerProps> = ({
  currentTrack,
  isPlaying,
  isBuffering,
  currentTime,
  duration,
  isFavorite,
  isShuffle,
  repeatMode,
  volume,
  lyricsData,
  isLoadingLyrics,
  initialViewMode = 'artwork',
  sponsorBlockSkippedCount = 0,
  onClose,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onToggleShuffle,
  onToggleRepeat,
  onToggleFavorite,
  onAddToPlaylist,
  onOpenAddToPlaylist,
  onSeek,
  onVolumeChange,
  onOpenQueue,
  onOpenEqualizer,
  onOpenSleepTimer,
  onOpenLyricsStudio,
  seedColor = '#FF5252',
}) => {
  const [viewMode, setViewMode] = useState<PlayerViewMode>(initialViewMode);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [lyricsViewType, setLyricsViewType] = useState<'synced' | 'plain'>('synced');
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLDivElement>(null);

  // Sync initialViewMode if changed externally
  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  // Keyboard shortcut (Escape to close full player)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Find active synchronized lyric line
  const currentMs = currentTime * 1000;
  const activeLineIndex = lyricsData?.lines?.length
    ? lyricsData.lines.reduce((acc, line, idx) => (line.timeMs <= currentMs ? idx : acc), -1)
    : -1;

  // Auto-scroll lyrics smoothly to active line
  useEffect(() => {
    if (viewMode === 'lyrics' && activeLyricRef.current && lyricsContainerRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex, viewMode]);


  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col justify-between p-4 sm:p-8 animate-fadeIn select-none overflow-hidden">
      {/* Background Dynamic Ambient Backdrops */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 filter blur-3xl scale-125 transition-all duration-1000 pointer-events-none"
        style={{ backgroundImage: `url(${currentTrack.thumbnail})` }}
      />
      <div 
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none transition-colors"
        style={{ backgroundColor: seedColor }}
      />

      {/* 1. Header Bar */}
      <header className="relative z-10 flex items-center justify-between gap-4 max-w-4xl mx-auto w-full">
        <button
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
          title="Minimize"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-xl">
          {[
            { id: 'artwork' as PlayerViewMode, label: 'Artwork', icon: ImageIcon },
            { id: 'canvas' as PlayerViewMode, label: 'Canvas', icon: Film },
            { id: 'vinyl' as PlayerViewMode, label: 'Vinyl', icon: Disc3 },
            { id: 'lyrics' as PlayerViewMode, label: 'Lyrics', icon: Mic2 },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? seedColor : undefined }} />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onOpenEqualizer}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
            title="AutoEq & Equalizer"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSleepTimer}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
            title="Sleep Timer"
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Center Content (Visualizer / Artwork / Lyrics) */}
      <main className="relative z-10 flex-1 flex items-center justify-center my-4 max-w-2xl mx-auto w-full min-h-0">
        {/* VIEW 1: Standard Artwork Mode */}
        {viewMode === 'artwork' && (
          <div className="flex flex-col items-center justify-center w-full max-w-md animate-fadeIn">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-neutral-900 group">
              <img 
                src={currentTrack.thumbnail} 
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-100' : 'scale-95 opacity-90'
                }`} 
              />
              {isBuffering && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: Spotify Canvas Video Loop */}
        {viewMode === 'canvas' && (
          <div className="relative aspect-[9/16] h-full max-h-[460px] rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-neutral-950 flex items-center justify-center animate-fadeIn">
            <video
              src={currentTrack.canvasVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-vintage-cassette-tape-spinning-41470-large.mp4'}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1.5 border border-white/10">
              <Film className="w-3 h-3 text-[#FF5252]" style={{ color: seedColor }} />
              <span>Canvas Visualizer</span>
            </div>
          </div>
        )}

        {/* VIEW 3: Vinyl Turntable Mode */}
        {viewMode === 'vinyl' && (
          <div className="flex items-center justify-center animate-fadeIn">
            <div 
              className={`relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-950 p-3 shadow-2xl border-4 border-neutral-800 flex items-center justify-center transition-all ${
                isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''
              }`}
            >
              {/* Vinyl Grooves */}
              <div className="absolute inset-4 rounded-full border border-white/10" />
              <div className="absolute inset-8 rounded-full border border-white/10" />
              <div className="absolute inset-12 rounded-full border border-white/10" />
              <div className="absolute inset-16 rounded-full border border-white/10" />

              {/* Center Record Label */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/20 shadow-inner flex items-center justify-center relative">
                <img src={currentTrack.thumbnail} alt={currentTrack.title} className="w-full h-full object-cover" />
                <div className="absolute w-4 h-4 rounded-full bg-black border border-white/40 shadow-md" />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: Synced Lyrics Mode */}
        {viewMode === 'lyrics' && (
          <div className="w-full h-full flex flex-col bg-neutral-900/70 rounded-3xl border border-white/10 p-5 sm:p-6 backdrop-blur-2xl animate-fadeIn overflow-hidden">
            {/* Lyrics Panel Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 mb-3 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#8ECAE6]/20 flex items-center justify-center">
                  <Mic2 className="w-3.5 h-3.5 text-[#8ECAE6]" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-white">
                    {lyricsData?.source || 'Lyrics'}
                  </span>
                  {lyricsData?.language && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-white/10">
                      {lyricsData.language === 'Nepali' ? '🇳🇵 Nepali' : lyricsData.language}
                    </span>
                  )}
                  {lyricsData?.isCustom && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#8ECAE6]/20 text-[#8ECAE6]">
                      ESHU VERIFIED
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {lyricsData?.plainLyrics && lyricsData?.lines && lyricsData.lines.length > 0 && (
                  <div className="inline-flex rounded-lg p-0.5 bg-neutral-950/80 border border-white/10 text-[10px] font-medium">
                    <button
                      onClick={() => setLyricsViewType('synced')}
                      className={`px-2 py-0.5 rounded ${
                        lyricsViewType === 'synced' ? 'bg-[#8ECAE6] text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Synced
                    </button>
                    <button
                      onClick={() => setLyricsViewType('plain')}
                      className={`px-2 py-0.5 rounded ${
                        lyricsViewType === 'plain' ? 'bg-[#8ECAE6] text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Plain
                    </button>
                  </div>
                )}

                {onOpenLyricsStudio && (
                  <button
                    onClick={onOpenLyricsStudio}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors"
                    title="Open Lyrics Studio to edit or add synchronized lyrics"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#8ECAE6]" />
                    <span>Studio</span>
                  </button>
                )}

                <button
                  onClick={() => setShowTranslation((v) => !v)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
                    showTranslation ? 'bg-white/20 text-white border-white/30' : 'text-neutral-400 border-white/10'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>AI Subtitles</span>
                </button>
              </div>
            </div>

            {/* Lyrics Content Display */}
            <div 
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar text-center py-6"
            >
              {isLoadingLyrics ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400">
                  <Loader2 className="w-7 h-7 animate-spin text-[#8ECAE6]" />
                  <p className="text-xs font-medium">Finding synchronized lyrics...</p>
                </div>
              ) : (!lyricsData || lyricsData.unavailable || (!lyricsData.plainLyrics && (!lyricsData.lines || lyricsData.lines.length === 0))) ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400 p-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
                    <Mic2 className="w-6 h-6 opacity-40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-neutral-200">Lyrics unavailable</p>
                    <p className="text-xs text-neutral-400 max-w-xs">
                      No synchronized lyrics were found for this track in external databases.
                    </p>
                  </div>
                  {onOpenLyricsStudio && (
                    <button
                      onClick={onOpenLyricsStudio}
                      className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8ECAE6] to-[#219EBC] hover:opacity-90 text-neutral-950 font-extrabold text-xs shadow-lg shadow-[#8ECAE6]/20 transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Lyrics in Studio</span>
                    </button>
                  )}
                </div>
              ) : lyricsViewType === 'plain' && lyricsData.plainLyrics ? (
                <div className="py-4 px-2 space-y-3 max-w-lg mx-auto text-left sm:text-center">
                  {lyricsData.plainLyrics.split(/\r?\n/).map((paragraph, pIdx) => (
                    <p key={pIdx} className="text-sm sm:text-base font-medium text-neutral-300 leading-relaxed">
                      {paragraph || '\u00A0'}
                    </p>
                  ))}
                </div>
              ) : (
                lyricsData.lines.map((line, idx) => {
                  const isActive = idx === activeLineIndex;
                  return (
                    <div
                      key={idx}
                      ref={isActive ? activeLyricRef : null}
                      onClick={() => onSeek(line.timeMs / 1000)}
                      className={`cursor-pointer transition-all duration-300 py-1.5 px-3 rounded-xl ${
                        isActive
                          ? 'scale-105 font-black text-[#FFFF00] text-xl sm:text-2xl drop-shadow-md bg-white/5'
                          : 'text-neutral-400 hover:text-neutral-200 text-sm sm:text-base font-medium opacity-60 hover:opacity-100'
                      }`}
                    >
                      <p className="leading-snug">{line.text}</p>
                      {showTranslation && line.translation && (
                        <p className="text-xs font-semibold text-neutral-300 mt-1">
                          {line.translation}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* 3. Footer Playback Controls & Progress Bar */}
      <footer className="relative z-10 max-w-2xl mx-auto w-full space-y-4">
        {/* Track Title & Artist */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-2xl font-extrabold text-white truncate tracking-tight">
              {currentTrack.title}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-medium truncate">
              {currentTrack.artist}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {sponsorBlockSkippedCount > 0 && (
              <span className="px-2 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Skipped Sponsor</span>
              </span>
            )}

            {(onOpenAddToPlaylist || onAddToPlaylist) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  (onOpenAddToPlaylist || onAddToPlaylist)?.();
                }}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
                title="Add to Playlist"
              >
                <FolderPlus className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={onToggleFavorite}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all active:scale-125"
              title="Like Song"
            >
              <Heart 
                className={`w-5 h-5 ${
                  isFavorite ? 'fill-[#FF4081] text-[#FF4081]' : 'text-neutral-300'
                }`} 
              />
            </button>

            <button
              onClick={onOpenQueue}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
              title="Up Next Queue"
            >
              <ListMusic className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Slider */}
        <div className="space-y-1.5">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full cursor-pointer accent-[#FF5252] h-2 bg-white/15 rounded-lg"
            style={{ accentColor: seedColor }}
          />

          <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-neutral-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Buttons Row */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onToggleShuffle}
            className={`p-3 rounded-2xl transition-colors ${
              isShuffle ? 'text-white bg-white/20' : 'text-neutral-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" style={{ color: isShuffle ? seedColor : undefined }} />
          </button>

          <button
            onClick={onPrevTrack}
            className="p-3 rounded-2xl text-neutral-200 hover:text-white hover:bg-white/10 transition-colors"
            title="Previous Track"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          {/* Primary Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className="w-16 h-16 rounded-3xl flex items-center justify-center text-black shadow-2xl transition-transform active:scale-95 hover:brightness-110"
            style={{ backgroundColor: seedColor }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <Loader2 className="w-8 h-8 text-black animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-8 h-8 fill-black text-black" />
            ) : (
              <Play className="w-8 h-8 fill-black text-black ml-1" />
            )}
          </button>

          <button
            onClick={onNextTrack}
            className="p-3 rounded-2xl text-neutral-200 hover:text-white hover:bg-white/10 transition-colors"
            title="Next Track"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          <button
            onClick={onToggleRepeat}
            className={`p-3 rounded-2xl transition-colors ${
              repeatMode !== 'off' ? 'text-white bg-white/20' : 'text-neutral-400 hover:text-white'
            }`}
            title="Repeat"
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" style={{ color: seedColor }} />
            ) : (
              <Repeat className="w-5 h-5" style={{ color: repeatMode === 'all' ? seedColor : undefined }} />
            )}
          </button>
        </div>

        {/* Volume & Bitrate Bar */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <button 
              onClick={() => onVolumeChange(volume > 0 ? 0 : 80)}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => onVolumeChange(parseInt(e.target.value))}
              className="w-full cursor-pointer h-1.5 bg-white/15 rounded-lg"
              style={{ accentColor: seedColor }}
            />
          </div>

          <span className="text-[10px] font-mono text-neutral-400 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
            {currentTrack.bitrate || '256 kbps HQ'}
          </span>
        </div>
      </footer>
    </div>
  );
};
