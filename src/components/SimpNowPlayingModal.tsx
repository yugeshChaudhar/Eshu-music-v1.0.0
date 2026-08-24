import React, { useState, useEffect, useRef } from 'react';
import { Track, LyricsData, PlayerViewMode, EqualizerPreset, SleepTimerState } from '../types';
import { 
  ChevronDown, 
  Heart, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Mic2, 
  ListMusic, 
  Disc, 
  Video, 
  Sliders, 
  Moon, 
  Download, 
  Share2, 
  Volume2, 
  VolumeX,
  Sparkles,
  Check,
  Languages,
  Plus
} from 'lucide-react';

interface SimpNowPlayingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  playbackRate: number;
  isFavorite: boolean;
  lyricsData: LyricsData | null;
  isLoadingLyrics: boolean;
  queue: Track[];
  currentQueueIndex: number;
  sleepTimer: SleepTimerState;
  equalizerPreset: EqualizerPreset;
  aiTranslationEnabled: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleFavorite: () => void;
  onSelectTrackFromQueue: (index: number) => void;
  onRemoveTrackFromQueue: (index: number) => void;
  onClearQueue: () => void;
  onSetPlaybackRate: (rate: number) => void;
  onSetEqualizerPreset: (preset: EqualizerPreset) => void;
  onSetSleepTimerMinutes: (minutes: number) => void;
  onToggleAiTranslation: () => void;
  onDownloadCurrentSong: () => void;
  onOpenArtist?: (artistName: string) => void;
  onOpenAddToPlaylist?: () => void;
}

export const SimpNowPlayingModal: React.FC<SimpNowPlayingModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  isBuffering,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  isRepeat,
  playbackRate,
  isFavorite,
  lyricsData,
  isLoadingLyrics,
  queue,
  currentQueueIndex,
  sleepTimer,
  equalizerPreset,
  aiTranslationEnabled,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onToggleFavorite,
  onSelectTrackFromQueue,
  onRemoveTrackFromQueue,
  onClearQueue,
  onSetPlaybackRate,
  onSetEqualizerPreset,
  onSetSleepTimerMinutes,
  onToggleAiTranslation,
  onDownloadCurrentSong,
  onOpenArtist,
  onOpenAddToPlaylist,
}) => {
  const [viewMode, setViewMode] = useState<PlayerViewMode>('artwork');
  const [showEqModal, setShowEqModal] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll synchronized lyrics as audio plays
  const currentMs = currentTime * 1000;
  const activeLyricIndex = lyricsData?.lines?.findIndex((line, i, arr) => {
    const nextLine = arr[i + 1];
    if (nextLine) {
      return currentMs >= line.timeMs && currentMs < nextLine.timeMs;
    }
    return currentMs >= line.timeMs;
  }) ?? -1;

  useEffect(() => {
    if (viewMode === 'lyrics' && lyricsContainerRef.current && activeLyricIndex >= 0) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [activeLyricIndex, viewMode]);

  if (!isOpen || !currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSeek(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950 text-white overflow-hidden animate-fadeIn">
      {/* Background Dynamic Ambient Radial Glow */}
      <div 
        className="absolute inset-0 opacity-40 blur-3xl pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 30%, #8ECAE6 0%, transparent 60%), radial-gradient(circle at 80% 80%, #023047 0%, transparent 50%)`,
        }}
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/[0.08]">
        <button
          onClick={onClose}
          className="p-2.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
          title="Collapse Player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <p className="text-[11px] font-bold tracking-wider uppercase text-[#8ECAE6]">
            Playing from SimpMusic
          </p>
          <p className="text-xs text-neutral-400 font-medium truncate max-w-[200px] sm:max-w-md">
            {currentTrack.album || currentTrack.artist}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenAddToPlaylist}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Add to Playlist"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={onDownloadCurrentSong}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Download song offline"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Segment View Selector */}
      <div className="relative z-10 flex justify-center py-2 px-4">
        <div className="flex items-center p-1 rounded-full bg-neutral-900/80 border border-white/10 shadow-lg text-xs font-medium">
          <button
            onClick={() => setViewMode('artwork')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
              viewMode === 'artwork'
                ? 'bg-[#8ECAE6] text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>Artwork</span>
          </button>

          <button
            onClick={() => setViewMode('lyrics')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
              viewMode === 'lyrics'
                ? 'bg-[#8ECAE6] text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lyrics</span>
            {lyricsData?.synced && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFFF00]" />
            )}
          </button>

          <button
            onClick={() => setViewMode('vinyl')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
              viewMode === 'vinyl'
                ? 'bg-[#8ECAE6] text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>Vinyl</span>
          </button>

          <button
            onClick={() => setViewMode('video')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
              viewMode === 'video'
                ? 'bg-[#8ECAE6] text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 overflow-y-auto flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full">
        {/* VIEW 1: Artwork Card View */}
        {viewMode === 'artwork' && (
          <div className="flex flex-col items-center justify-center w-full max-w-sm sm:max-w-md my-auto">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl shadow-black/90 border border-white/10 group">
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-1000 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>
        )}

        {/* VIEW 2: Vinyl Turntable View */}
        {viewMode === 'vinyl' && (
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
              {/* Vinyl Disc */}
              <div 
                className={`w-full h-full rounded-full bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-950 p-2 shadow-2xl shadow-black border-4 border-neutral-800 ${
                  isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''
                }`}
                style={{
                  backgroundImage: `repeating-radial-gradient(circle, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 2px, transparent 3px, transparent 6px)`,
                }}
              >
                {/* Center Record Label */}
                <div className="w-full h-full rounded-full flex items-center justify-center border border-white/10 overflow-hidden relative">
                  <img
                    src={currentTrack.thumbnail}
                    alt=""
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-black"
                  />
                  {/* Spindle hole */}
                  <div className="absolute w-5 h-5 rounded-full bg-neutral-950 border-2 border-neutral-700 shadow-inner" />
                </div>
              </div>

              {/* Tonearm Assembly */}
              <div 
                className={`absolute -top-4 -right-4 w-32 h-36 origin-top-right transition-transform duration-700 pointer-events-none ${
                  isPlaying ? 'rotate-12' : '-rotate-12'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-neutral-600 border border-neutral-400 shadow-md ml-auto mr-2" />
                <div className="w-1.5 h-28 bg-gradient-to-b from-neutral-400 via-neutral-200 to-neutral-500 rounded-full shadow-lg ml-auto mr-3.5 -mt-1" />
                <div className="w-5 h-7 bg-neutral-800 rounded-sm border border-neutral-400 shadow-md ml-auto mr-2 -mt-1 rotate-12 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8ECAE6]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Synced Karaoke Lyrics View */}
        {viewMode === 'lyrics' && (
          <div className="w-full max-w-2xl h-[360px] sm:h-[420px] flex flex-col my-auto">
            <div className="flex items-center justify-between px-2 mb-3">
              <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8ECAE6]" />
                <span>Source: {lyricsData?.source || 'LRCLIB'}</span>
              </span>

              <button
                onClick={onToggleAiTranslation}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  aiTranslationEnabled
                    ? 'bg-[#8ECAE6]/20 border-[#8ECAE6] text-[#8ECAE6]'
                    : 'bg-neutral-900 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>AI Translation</span>
              </button>
            </div>

            <div 
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto px-4 py-8 space-y-6 text-center scroll-smooth mask-fade"
            >
              {isLoadingLyrics ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-3">
                  <div className="w-6 h-6 border-2 border-[#8ECAE6] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm">Fetching synchronized lyrics...</p>
                </div>
              ) : lyricsData?.lines && lyricsData.lines.length > 0 ? (
                lyricsData.lines.map((line, idx) => {
                  const isActive = idx === activeLyricIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => onSeek(line.timeMs / 1000)}
                      className={`cursor-pointer transition-all duration-300 py-1 ${
                        isActive
                          ? 'text-2xl sm:text-3xl font-black text-[#FFFF00] scale-105 drop-shadow-md'
                          : 'text-lg sm:text-xl font-medium text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <p>{line.text}</p>
                      {aiTranslationEnabled && line.translation && (
                        <p className="text-sm text-neutral-400 font-normal mt-1">
                          {line.translation}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                  <Mic2 className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm font-medium">
                    {lyricsData?.plainLyrics || 'No lyrics found for this track.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: Embedded Video View */}
        {viewMode === 'video' && (
          <div className="w-full max-w-2xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 my-auto">
            <iframe
              src={`https://www.youtube.com/embed/${currentTrack.id}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`}
              title={currentTrack.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Bottom Controls Section */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 pb-6 pt-2 select-none">
        {/* Title, Artist & Like Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0 flex-1 mr-4">
            <h2 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">
              {currentTrack.title}
            </h2>
            <button
              onClick={() => onOpenArtist?.(currentTrack.artist)}
              className="text-sm sm:text-base font-semibold text-neutral-400 hover:text-[#8ECAE6] truncate transition-colors"
            >
              {currentTrack.artist}
            </button>
          </div>

          <button
            onClick={onToggleFavorite}
            className={`p-3 rounded-full transition-all ${
              isFavorite
                ? 'text-[#FF4081] bg-[#FF4081]/15 scale-110'
                : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
            title="Favorite Track"
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-[#FF4081]' : ''}`} />
          </button>
        </div>

        {/* Scrub Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleScrubChange}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#8ECAE6] hover:h-2 transition-all"
          />
          <div className="flex justify-between text-xs text-neutral-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Audio Controls (Shuffle, Prev, Play/Pause, Next, Repeat) */}
        <div className="flex items-center justify-between sm:justify-center sm:gap-8 mb-4">
          <button
            onClick={onToggleShuffle}
            className={`p-2.5 rounded-full transition-colors ${
              isShuffle ? 'text-[#8ECAE6] bg-[#8ECAE6]/15' : 'text-neutral-400 hover:text-white'
            }`}
            title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={onPrevTrack}
            className="p-3 rounded-full text-neutral-200 hover:text-white hover:bg-white/10 transition-colors"
            title="Previous"
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-16 h-16 rounded-full bg-white hover:bg-[#8ECAE6] text-black flex items-center justify-center shadow-xl shadow-[#8ECAE6]/20 transition-transform active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-8 h-8 fill-black" />
            ) : (
              <Play className="w-8 h-8 fill-black ml-1" />
            )}
          </button>

          <button
            onClick={onNextTrack}
            className="p-3 rounded-full text-neutral-200 hover:text-white hover:bg-white/10 transition-colors"
            title="Next"
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={onToggleRepeat}
            className={`p-2.5 rounded-full transition-colors ${
              isRepeat ? 'text-[#8ECAE6] bg-[#8ECAE6]/15' : 'text-neutral-400 hover:text-white'
            }`}
            title={isRepeat ? 'Repeat On' : 'Repeat Off'}
          >
            <Repeat className="w-5 h-5" />
          </button>
        </div>

        {/* Secondary Auxiliary Controls (Equalizer, Speed, Sleep Timer, Volume) */}
        <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/[0.08]">
          <div className="flex items-center gap-3">
            {/* Equalizer Preset trigger */}
            <button
              onClick={() => setShowEqModal(!showEqModal)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-neutral-300 transition-colors"
              title="Equalizer FX"
            >
              <Sliders className="w-4 h-4 text-[#8ECAE6]" />
              <span className="capitalize">{equalizerPreset}</span>
            </button>

            {/* Playback speed trigger */}
            <button
              onClick={() => setShowSpeedModal(!showSpeedModal)}
              className="px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-neutral-300 font-mono transition-colors"
              title="Playback Rate"
            >
              {playbackRate}x
            </button>

            {/* Sleep Timer trigger */}
            <button
              onClick={() => setShowSleepTimerModal(!showSleepTimerModal)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                sleepTimer.active ? 'text-[#8ECAE6] bg-[#8ECAE6]/15 font-semibold' : 'hover:bg-white/10 text-neutral-300'
              }`}
              title="Sleep Timer"
            >
              <Moon className="w-4 h-4" />
              <span>{sleepTimer.active ? `${Math.ceil(sleepTimer.remainingSeconds / 60)}m` : 'Timer'}</span>
            </button>
          </div>

          {/* Volume Slider (Desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={onToggleMute} className="p-1 hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseInt(e.target.value, 10))}
              className="w-20 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#8ECAE6]"
            />
          </div>
        </div>
      </div>

      {/* Popovers & Sub-Modals (Equalizer, Speed, Sleep Timer) */}
      {showEqModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/15 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#8ECAE6]" />
              <span>Equalizer Presets</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {(['flat', 'bass-boost', 'vocal', 'acoustic', 'rock', 'electronic', 'chill'] as EqualizerPreset[]).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => {
                      onSetEqualizerPreset(p);
                      setShowEqModal(false);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all ${
                      equalizerPreset === p
                        ? 'bg-[#8ECAE6] text-black shadow-md'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {p.replace('-', ' ')}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => setShowEqModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showSleepTimerModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/15 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Moon className="w-5 h-5 text-[#8ECAE6]" />
              <span>Sleep Timer</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[0, 15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    onSetSleepTimerMinutes(mins);
                    setShowSleepTimerModal(false);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    (mins === 0 && !sleepTimer.active) || (sleepTimer.active && sleepTimer.totalMinutes === mins)
                      ? 'bg-[#8ECAE6] text-black shadow-md'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {mins === 0 ? 'Turn Off' : `${mins} Minutes`}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSleepTimerModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showSpeedModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/15 rounded-3xl p-6 max-w-xs w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 text-center">Playback Speed</h3>
            <div className="space-y-1.5 mb-6">
              {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => {
                    onSetPlaybackRate(spd);
                    setShowSpeedModal(false);
                  }}
                  className={`w-full py-2 px-4 rounded-xl text-sm font-mono flex items-center justify-between transition-all ${
                    playbackRate === spd
                      ? 'bg-[#8ECAE6] text-black font-bold'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <span>{spd}x</span>
                  {playbackRate === spd && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSpeedModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
