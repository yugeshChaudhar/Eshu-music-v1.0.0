import React from 'react';
import eshuLogoImage from '../assets/images/eshu_logo_1787596023085.jpg';
import { 
  Search, 
  Bell, 
  Sliders, 
  Radio, 
  WifiOff, 
  Youtube
} from 'lucide-react';
import { TabType, YouTubeUserProfile } from '../types';

interface EchoHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenNotifications: () => void;
  onOpenSearchFocus: () => void;
  onOpenEqualizer: () => void;
  isOnline?: boolean;
  unreadNotifications?: number;
  seedColor?: string;
  youtubeUser?: YouTubeUserProfile | null;
  onOpenYouTubeAuth?: () => void;
}

export const EchoHeader: React.FC<EchoHeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenNotifications,
  onOpenSearchFocus,
  onOpenEqualizer,
  isOnline = true,
  unreadNotifications = 1,
  seedColor = '#FF5252',
  youtubeUser = null,
  onOpenYouTubeAuth,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-neutral-950/80 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Brand Identity */}
        <div 
          onClick={() => onTabChange('home')}
          className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="relative flex items-center justify-center">
            <div 
              className="absolute -inset-1.5 rounded-2xl opacity-40 blur-md group-hover:opacity-75 transition-opacity"
              style={{ backgroundColor: seedColor }}
            />
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden bg-neutral-900 border border-white/20 p-0.5 flex items-center justify-center shadow-lg shadow-purple-950/40">
              <img 
                src={eshuLogoImage || '/eshu-logo.png'} 
                alt="Eshu Music" 
                className="w-full h-full object-contain rounded-xl filter drop-shadow-md group-hover:scale-105 transition-transform"
                onError={(e) => {
                  if ((e.currentTarget as HTMLImageElement).src !== '/eshu-logo.png') {
                    (e.currentTarget as HTMLImageElement).src = '/eshu-logo.png';
                  }
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1">
                Eshu<span style={{ color: seedColor }}>Music</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 hidden sm:inline-block">
                v1.0.0
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium hidden md:block">
              High-Fidelity YouTube Music Client
            </p>
          </div>
        </div>

        {/* Center: Search Trigger Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div
            onClick={onOpenSearchFocus}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-neutral-900/90 border border-white/10 hover:border-white/25 text-neutral-400 hover:text-neutral-200 cursor-pointer shadow-inner transition-all group"
          >
            <Search className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
            <span className="text-xs sm:text-sm font-medium flex-1 truncate">
              Search songs, artists, albums, podcasts, or paste YouTube link...
            </span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-neutral-400 bg-neutral-800 border border-neutral-700 rounded-md shadow-xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Quick Tools & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Equalizer & AutoEq Shortcut */}
          <button
            onClick={onOpenEqualizer}
            className={`p-2 rounded-xl border transition-all ${
              activeTab === 'equalizer'
                ? 'bg-white/20 text-white border-white/30 shadow-lg'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-white/10'
            }`}
            title="AutoEq & Equalizer"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Stream Quality / Network Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-[11px] font-semibold text-neutral-300">
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-neutral-400">256k HQ</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400">Offline</span>
              </>
            )}
          </div>

          {/* YouTube Account Avatar / Connect Button */}
          {onOpenYouTubeAuth && (
            <button
              onClick={onOpenYouTubeAuth}
              className={`flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all ${
                youtubeUser
                  ? 'bg-neutral-900/90 hover:bg-neutral-800 border-white/20 text-white'
                  : 'bg-[#FF0000]/20 hover:bg-[#FF0000]/30 border-[#FF0000]/40 text-red-200'
              }`}
              title={youtubeUser ? `YouTube: ${youtubeUser.name}` : 'Connect YouTube Account'}
            >
              {youtubeUser ? (
                <div className="flex items-center gap-1.5">
                  <img 
                    src={youtubeUser.picture} 
                    alt={youtubeUser.name} 
                    className="w-5 h-5 rounded-full object-cover border border-white/20"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
                    }}
                  />
                  <span className="text-xs font-semibold max-w-[80px] truncate hidden md:inline">
                    {youtubeUser.name.split(' ')[0]}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Youtube className="w-4 h-4 text-[#FF0000] fill-[#FF0000]" />
                  <span className="text-xs font-bold text-neutral-200 hidden sm:inline">
                    Sign in
                  </span>
                </div>
              )}
            </button>
          )}

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 transition-colors"
            title="What's New & Updates"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span 
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" 
                style={{ backgroundColor: seedColor }}
              />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
