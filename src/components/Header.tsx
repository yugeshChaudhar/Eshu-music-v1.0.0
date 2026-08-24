import React from 'react';
import { 
  Disc, 
  Sparkles, 
  Clock, 
  Video, 
  Plus, 
  Timer, 
  Keyboard, 
  Palette,
  ListMusic,
  Download,
  HardDriveDownload,
  WifiOff,
  Radio,
  Headphones,
  ShieldCheck,
} from 'lucide-react';
import { ThemeMode, ViewMode, SleepTimerState } from '../types';
import { EshuMusicLogo } from './EshuMusicLogo';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  sleepTimer: SleepTimerState;
  onOpenSleepTimer: () => void;
  onOpenPlaylistManager: () => void;
  onOpenShortcuts: () => void;
  onOpenQueue: () => void;
  queueTrackCount?: number;
  isOfflineMode?: boolean;
  offlineTracksCount?: number;
  onOpenOfflineLibrary: () => void;
  backgroundPlayEnabled?: boolean;
  onToggleBackgroundPlay?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  theme,
  onThemeChange,
  sleepTimer,
  onOpenSleepTimer,
  onOpenPlaylistManager,
  onOpenShortcuts,
  onOpenQueue,
  queueTrackCount = 0,
  isOfflineMode = false,
  offlineTracksCount = 0,
  onOpenOfflineLibrary,
  backgroundPlayEnabled = true,
  onToggleBackgroundPlay,
}) => {
  const [imgError, setImgError] = React.useState(false);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const nextTheme = () => {
    const order: ThemeMode[] = ['warm-dark', 'twilight-indigo', 'cyber-noir', 'clean-light'];
    const currIdx = order.indexOf(theme);
    const nextIdx = (currIdx + 1) % order.length;
    onThemeChange(order[nextIdx]);
  };

  return (
    <header id="app-header" className="sticky top-0 z-50 flex items-center justify-between px-2.5 sm:px-6 md:px-8 lg:px-10 py-1.5 sm:py-2.5 border-b border-white/10 backdrop-blur-2xl bg-[#08080A]/95 shadow-md shadow-black/30 shrink-0">
      <div className="flex items-center justify-between max-w-7xl 2xl:max-w-[1600px] mx-auto w-full gap-1.5 sm:gap-4">
        {/* Brand - Name and Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink-0">
          <EshuMusicLogo className="w-7 h-7 sm:w-9 sm:h-9" />
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-xs sm:text-base md:text-lg font-extrabold tracking-tight text-white truncate drop-shadow-sm">
              ESHU MUSIC
            </span>
            <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0 uppercase tracking-wider">
              Pro
            </span>
          </div>
        </div>

        {/* Center View Switcher (Desktop & Mobile Unified) */}
        <nav className="flex items-center gap-0.5 p-0.5 sm:p-1 rounded-lg sm:rounded-xl bg-white/[0.04] border border-white/5 shrink-0">
          <button
            id="btn-view-vinyl"
            onClick={() => onViewModeChange('vinyl')}
            className={`flex items-center gap-1 px-1.5 sm:px-3 py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'vinyl'
                ? 'bg-indigo-600/30 text-indigo-100 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
            title="Vinyl Turntable"
          >
            <Disc className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Vinyl</span>
          </button>

          <button
            id="btn-view-ambient"
            onClick={() => onViewModeChange('ambient')}
            className={`flex items-center gap-1 px-1.5 sm:px-3 py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'ambient'
                ? 'bg-indigo-600/30 text-indigo-100 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
            title="Ambient Backdrop"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Ambient</span>
          </button>

          <button
            id="btn-view-zen"
            onClick={() => onViewModeChange('zen')}
            className={`flex items-center gap-1 px-1.5 sm:px-3 py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'zen'
                ? 'bg-indigo-600/30 text-indigo-100 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
            title="Zen Focus"
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Zen</span>
          </button>

          <button
            id="btn-view-video"
            onClick={() => onViewModeChange('video')}
            className={`flex items-center gap-1 px-1.5 sm:px-3 py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'video'
                ? 'bg-indigo-600/30 text-indigo-100 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
            title="Video Player"
          >
            <Video className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Video</span>
          </button>
        </nav>

        {/* Right Tools & Modals */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* DOWNLOADS BUTTON */}
          <button
            id="btn-header-downloads"
            onClick={onOpenOfflineLibrary}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all min-h-[28px] sm:min-h-[32px] cursor-pointer shadow-sm ${
              isOfflineMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-amber-500/10'
                : 'bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/30'
            }`}
            title="Downloads • View and play all downloaded songs"
          >
            <Download className={`w-3.5 h-3.5 shrink-0 ${isOfflineMode ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
            <span className="hidden sm:inline">Downloads</span>
            {offlineTracksCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                isOfflineMode
                  ? 'bg-amber-500/30 text-amber-200'
                  : 'bg-emerald-500/30 text-emerald-200'
              }`}>
                {offlineTracksCount}
              </span>
            )}
          </button>

          {/* BACKGROUND PLAY STATUS BUTTON (Desktop & Mobile) */}
          {onToggleBackgroundPlay && (
            <button
              id="btn-header-background-play"
              onClick={onToggleBackgroundPlay}
              className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border text-[11px] sm:text-xs font-medium transition-all min-h-[28px] sm:min-h-[32px] min-w-[28px] cursor-pointer ${
                backgroundPlayEnabled
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200'
                  : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
              }`}
              title={`Background Play: ${backgroundPlayEnabled ? 'ON (Keeps playing on lock-screen & background)' : 'OFF'}`}
            >
              <Headphones className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">BG Play</span>
              <span className={`w-1.5 h-1.5 rounded-full ${backgroundPlayEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            </button>
          )}

          {/* Add Playlist */}
          <button
            id="btn-custom-playlist"
            onClick={onOpenPlaylistManager}
            className="flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-200 text-[11px] sm:text-xs font-medium transition-all min-h-[28px] sm:min-h-[32px] min-w-[28px] cursor-pointer"
            title="Manage Playlists"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">Playlists</span>
          </button>

          {/* Sleep Timer */}
          <button
            id="btn-sleep-timer"
            onClick={onOpenSleepTimer}
            className={`flex items-center justify-center gap-1 p-1.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border text-[11px] sm:text-xs font-medium transition-all min-h-[28px] sm:min-h-[32px] min-w-[28px] cursor-pointer ${
              sleepTimer.active
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200'
                : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
            }`}
            title="Sleep Timer"
          >
            <Timer className="w-3.5 h-3.5 shrink-0" />
            {sleepTimer.active && (
              <span className="font-mono text-[10px] font-semibold text-indigo-300">
                {formatTimer(sleepTimer.remainingSeconds)}
              </span>
            )}
          </button>

          {/* Queue Drawer Button */}
          <button
            id="btn-queue-drawer"
            onClick={onOpenQueue}
            className="flex items-center justify-center gap-1 p-1.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 hover:border-indigo-500/30 border border-white/5 text-slate-200 hover:text-white transition-all min-h-[28px] sm:min-h-[32px] min-w-[28px] cursor-pointer"
            title="Open Playlist Track Queue"
          >
            <ListMusic className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[11px] sm:text-xs font-semibold hidden md:inline">Queue</span>
            {queueTrackCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/25 text-indigo-200 border border-indigo-500/40 text-[9px] font-mono font-bold">
                {queueTrackCount}
              </span>
            )}
          </button>

          {/* Keyboard Shortcuts (Desktop) */}
          <button
            id="btn-shortcuts-guide"
            onClick={onOpenShortcuts}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all min-h-[30px] min-w-[30px] cursor-pointer"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>

          {/* Theme Cycler */}
          <button
            id="btn-theme-cycler"
            onClick={nextTheme}
            className="flex items-center justify-center p-1.5 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all min-h-[28px] sm:min-h-[30px] min-w-[28px] sm:min-w-[30px] cursor-pointer"
            title={`Theme: ${theme.replace('-', ' ')}`}
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

