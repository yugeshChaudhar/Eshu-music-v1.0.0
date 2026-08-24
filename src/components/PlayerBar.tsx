import React, { useState, memo } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Heart, 
  SlidersHorizontal, 
  ListMusic, 
  Maximize2, 
  Minimize2, 
  Gauge,
  Download,
  HardDriveDownload,
  WifiOff,
  Headphones
} from 'lucide-react';
import { Station, TrackMetadata } from '../types';
import { CoverColorPalette } from '../services/colorSyncService';

interface PlayerBarProps {
  station: Station | null;
  currentTrack: TrackMetadata | null;
  isPlaying: boolean;
  isBuffering: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isShuffle: boolean;
  isRepeat: boolean;
  isFavorite: boolean;
  queueTrackCount?: number;
  isOfflineMode?: boolean;
  backgroundPlayEnabled?: boolean;
  onToggleBackgroundPlay?: () => void;
  palette?: CoverColorPalette;
  onOpenOfflineLibrary?: () => void;
  onDownloadCurrentSong?: () => void;
  isDownloadingSong?: boolean;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (time: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  onToggleFavorite: () => void;
  onOpenQueue: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = memo(({
  station,
  currentTrack,
  isPlaying,
  isBuffering,
  isMuted,
  volume,
  currentTime,
  duration,
  playbackRate,
  isShuffle,
  isRepeat,
  isFavorite,
  queueTrackCount = 0,
  isOfflineMode = false,
  backgroundPlayEnabled = true,
  onToggleBackgroundPlay,
  palette,
  onOpenOfflineLibrary,
  onDownloadCurrentSong,
  isDownloadingSong = false,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onToggleShuffle,
  onToggleRepeat,
  onToggleMute,
  onVolumeChange,
  onSeek,
  onPlaybackRateChange,
  onToggleFavorite,
  onOpenQueue,
}) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPreviewTime, setSeekPreviewTime] = useState<number | null>(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showMobileVolume, setShowMobileVolume] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeAccent = palette?.primary || '#818CF8';

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const totalSecs = Math.floor(secs);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSeekPreviewTime(val);
  };

  const handleSeekCommit = () => {
    if (seekPreviewTime !== null) {
      onSeek(seekPreviewTime);
      setSeekPreviewTime(null);
    }
    setIsSeeking(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const displayCurrentTime = isSeeking && seekPreviewTime !== null ? seekPreviewTime : currentTime;
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (displayCurrentTime / duration) * 100)) : 0;

  const trackTitle = currentTrack?.title || station?.name || 'ESHU MUSIC';
  const trackArtist = currentTrack?.author || station?.tag || 'Relaxing Stream';
  const coverImage = currentTrack?.thumbnail || station?.coverUrl || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80';

  return (
    <div id="player-bar-container" className="relative z-40 w-full border-t border-white/5 bg-[#0A0A0C]/95 backdrop-blur-2xl px-3 sm:px-6 md:px-8 lg:px-10 pt-1.5 pb-2 sm:pb-2.5 pb-[max(8px,env(safe-area-inset-bottom))] select-none shrink-0">
      {/* Top Scrub Progress Bar */}
      <div className="w-full flex items-center gap-2 mb-1">
        <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono font-medium min-w-[28px] text-right">
          {formatTime(displayCurrentTime)}
        </span>

        <div className="relative flex-1 flex items-center group py-1.5 touch-none cursor-pointer">
          <input
            id="track-seek-slider"
            type="range"
            min={0}
            max={duration > 0 ? duration : 100}
            step={0.1}
            value={displayCurrentTime}
            onMouseDown={() => setIsSeeking(true)}
            onTouchStart={() => setIsSeeking(true)}
            onChange={handleSeekSliderChange}
            onMouseUp={handleSeekCommit}
            onTouchEnd={handleSeekCommit}
            onKeyUp={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                handleSeekCommit();
              }
            }}
            className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-400 group-hover:h-1.5 transition-all"
            style={{
              background: `linear-gradient(to right, ${activeAccent} ${progressPercent}%, #1E293B ${progressPercent}%)`,
            }}
          />
        </div>

        <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono font-medium min-w-[28px]">
          {duration > 0 ? formatTime(duration) : 'LIVE'}
        </span>
      </div>

      {/* Main Controls Row */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-7xl 2xl:max-w-[1600px] mx-auto">
        {/* Left: Track Info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 max-w-[34%] xs:max-w-[30%]">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden shadow-md shrink-0 border border-white/10 bg-slate-900">
            <img
              src={coverImage}
              alt={trackTitle}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-[11px] sm:text-xs font-semibold text-slate-100 truncate leading-snug">
              {trackTitle}
            </h4>
            <p className="text-[9px] sm:text-[10px] text-slate-400 truncate font-medium">
              {trackArtist}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* 1-Click Download Current Song Button */}
            {onDownloadCurrentSong && (
              <button
                id="btn-playerbar-download-song"
                onClick={onDownloadCurrentSong}
                disabled={isDownloadingSong}
                className="p-1 sm:p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15 border border-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer"
                title="Download this song to your phone storage & Downloads library"
              >
                <Download className={`w-3.5 h-3.5 ${isDownloadingSong ? 'animate-bounce text-emerald-300' : ''}`} />
                <span className="text-[10px] font-bold text-emerald-300 hidden md:inline">
                  {isDownloadingSong ? 'Saving...' : 'Download'}
                </span>
              </button>
            )}

            <button
              id="btn-toggle-favorite"
              onClick={onToggleFavorite}
              className={`p-1 rounded-lg transition-colors hidden sm:flex shrink-0 items-center justify-center cursor-pointer ${
                isFavorite ? 'text-rose-400 hover:text-rose-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Center: Playback Transport Controls */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-5 shrink-0">
          <button
            id="btn-toggle-shuffle"
            onClick={onToggleShuffle}
            className={`p-1.5 rounded-lg text-xs transition-colors hidden sm:flex items-center justify-center cursor-pointer ${
              isShuffle ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-white'
            }`}
            title={`Shuffle: ${isShuffle ? 'On' : 'Off'}`}
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-prev-track"
            onClick={onPrevTrack}
            className="p-1.5 text-slate-400 hover:text-white active:scale-90 transition-all flex items-center justify-center cursor-pointer"
            title="Previous Track"
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Main Play / Pause Button */}
          <button
            id="btn-toggle-play"
            onClick={onTogglePlay}
            disabled={isBuffering && !isPlaying}
            className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] active:scale-95 cursor-pointer shrink-0"
            title="Play / Pause"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
            ) : (
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black ml-0.5" />
            )}
          </button>

          <button
            id="btn-next-track"
            onClick={onNextTrack}
            className="p-1.5 text-slate-400 hover:text-white active:scale-90 transition-all flex items-center justify-center cursor-pointer"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            id="btn-toggle-repeat"
            onClick={onToggleRepeat}
            className={`p-1.5 rounded-lg text-xs transition-colors hidden sm:flex items-center justify-center cursor-pointer ${
              isRepeat ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-white'
            }`}
            title={`Repeat: ${isRepeat ? 'One/Loop' : 'Off'}`}
          >
            {isRepeat ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Right: Ambience, Queue, Speed, Volume */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 justify-end">
          {/* Playback Speed */}
          <div className="relative hidden md:block">
            <button
              id="btn-speed-selector"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 text-[11px] font-mono cursor-pointer"
              title="Playback Speed"
            >
              <Gauge className="w-3 h-3 text-indigo-400" />
              <span>{playbackRate}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full mb-2 right-0 bg-[#0E0F14] border border-white/10 rounded-xl p-1 shadow-2xl flex flex-col gap-0.5 z-50 min-w-[70px]">
                {[0.75, 1, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      onPlaybackRateChange(rate);
                      setShowSpeedMenu(false);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-mono text-left transition-colors cursor-pointer ${
                      playbackRate === rate ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="relative flex items-center">
            <button
              id="btn-toggle-mute"
              onClick={() => {
                if (window.innerWidth < 640) {
                  setShowMobileVolume(!showMobileVolume);
                } else {
                  onToggleMute();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : volume < 50 ? (
                <Volume1 className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>

            <input
              id="volume-slider"
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-16 sm:w-20 md:w-24 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-400 hidden sm:block"
            />

            {showMobileVolume && (
              <div className="sm:hidden absolute bottom-full mb-3 right-0 bg-[#0E0F14] border border-white/15 rounded-2xl p-2.5 shadow-2xl flex flex-col items-center gap-2 z-50 w-32">
                <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-mono">
                  <span>Volume</span>
                  <span className="text-indigo-300 font-bold">{isMuted ? 0 : volume}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-400"
                />
              </div>
            )}
          </div>

          {/* Background Audio Keep-Alive Quick Toggle */}
          {onToggleBackgroundPlay && (
            <button
              id="btn-playerbar-bg-play"
              onClick={onToggleBackgroundPlay}
              className={`p-1.5 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                backgroundPlayEnabled
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                  : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
              }`}
              title={`Background Play: ${backgroundPlayEnabled ? 'ON (Screen lock & app switch playback active)' : 'OFF'}`}
            >
              <Headphones className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Direct Download Current Song to Phone Storage Button */}
          {onDownloadCurrentSong && (
            <button
              id="btn-playerbar-downloads"
              onClick={onDownloadCurrentSong}
              disabled={isDownloadingSong}
              className={`p-1.5 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                isDownloadingSong
                  ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50 scale-105'
                  : 'bg-emerald-600/15 hover:bg-emerald-600/30 border-emerald-500/30 text-emerald-400 hover:text-emerald-300'
              }`}
              title="Download currently playing song to phone storage"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloadingSong ? 'animate-bounce text-emerald-300' : 'text-emerald-400'}`} />
            </button>
          )}

          {/* Queue Drawer Button */}
          <button
            id="btn-queue-bar"
            onClick={onOpenQueue}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:border-indigo-500/30 border border-white/5 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            title="Open Playlist Track Queue"
          >
            <ListMusic className="w-3.5 h-3.5 text-indigo-400" />
            {queueTrackCount > 0 && (
              <span className="text-[10px] font-mono font-bold text-indigo-300 px-1 py-0.2 rounded bg-indigo-500/20 hidden xs:inline">
                {queueTrackCount}
              </span>
            )}
          </button>

          {/* Fullscreen (Desktop Only) */}
          <button
            id="btn-fullscreen-toggle"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-colors hidden lg:flex items-center justify-center cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
});

PlayerBar.displayName = 'PlayerBar';
