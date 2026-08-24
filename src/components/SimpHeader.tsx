import React from 'react';
import { TabType } from '../types';
import { Search, Bell, BarChart3, Settings, Music, Disc3, Sparkles } from 'lucide-react';

interface SimpHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenNotifications: () => void;
  onOpenSearchFocus: () => void;
  isOnline: boolean;
  unreadNotifications?: number;
}

export const SimpHeader: React.FC<SimpHeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenNotifications,
  onOpenSearchFocus,
  isOnline,
  unreadNotifications = 0,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-neutral-950/85 backdrop-blur-xl border-b border-white/[0.06] transition-colors">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8ECAE6] via-[#219EBC] to-[#023047] p-0.5 flex items-center justify-center shadow-lg shadow-[#8ECAE6]/15 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-neutral-950/90 rounded-[10px] flex items-center justify-center">
              <Disc3 className="w-5 h-5 text-[#8ECAE6] animate-[spin_8s_linear_infinite]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white flex items-center">
                Simp<span className="text-[#8ECAE6]">Music</span>
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#8ECAE6]/15 text-[#8ECAE6] border border-[#8ECAE6]/30 hidden sm:inline-block">
                FOSS
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-medium hidden md:block">
              YouTube Music Client
            </p>
          </div>
        </button>
      </div>

      {/* Center Search Input Trigger (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <button
          onClick={() => {
            onTabChange('search');
            onOpenSearchFocus();
          }}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800/90 border border-white/10 text-neutral-400 text-sm transition-all shadow-inner group"
        >
          <Search className="w-4 h-4 text-neutral-400 group-hover:text-[#8ECAE6] transition-colors" />
          <span className="flex-1 text-left">Search songs, artists, podcasts, or YouTube links...</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-white/10">
            /
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Search button on Mobile */}
        <button
          onClick={() => {
            onTabChange('search');
            onOpenSearchFocus();
          }}
          className="md:hidden p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Analytics shortcut */}
        <button
          onClick={() => onTabChange('analytics')}
          className={`p-2 rounded-full transition-colors ${
            activeTab === 'analytics'
              ? 'text-[#8ECAE6] bg-[#8ECAE6]/10'
              : 'text-neutral-300 hover:text-white hover:bg-white/10'
          }`}
          title="Listening Analytics"
        >
          <BarChart3 className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Notifications & Updates"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF4081] ring-2 ring-neutral-950" />
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => onTabChange('settings')}
          className={`p-2 rounded-full transition-colors ${
            activeTab === 'settings'
              ? 'text-[#8ECAE6] bg-[#8ECAE6]/10'
              : 'text-neutral-300 hover:text-white hover:bg-white/10'
          }`}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
