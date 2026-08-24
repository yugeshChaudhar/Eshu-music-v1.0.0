import React from 'react';
import { 
  Home, 
  Search, 
  Library, 
  BarChart3, 
  Settings, 
  Heart, 
  Plus, 
  Download, 
  Music2, 
  Sparkles,
  Sliders,
  Radio,
  FolderHeart
} from 'lucide-react';
import { TabType, Playlist } from '../types';

interface EchoNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  customPlaylists: Playlist[];
  onSelectPlaylist: (playlist: Playlist) => void;
  onCreatePlaylistModal: () => void;
  onOpenFavorites: () => void;
  onOpenOfflineTracks: () => void;
  seedColor?: string;
}

export const EchoNavigation: React.FC<EchoNavigationProps> = ({
  activeTab,
  onTabChange,
  customPlaylists,
  onSelectPlaylist,
  onCreatePlaylistModal,
  onOpenFavorites,
  onOpenOfflineTracks,
  seedColor = '#FF5252',
}) => {
  const mainNavItems = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'search' as TabType, label: 'Search', icon: Search },
    { id: 'podcasts' as TabType, label: 'Podcasts', icon: Radio },
    { id: 'library' as TabType, label: 'Library', icon: Library },
    { id: 'equalizer' as TabType, label: 'AutoEq', icon: Sliders },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* 1. Desktop Left Navigation Sidebar */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-neutral-950/60 border-r border-white/10 h-[calc(100vh-61px)] p-4 flex-shrink-0 select-none overflow-y-auto">
        {/* Main Tab Links */}
        <div className="space-y-1 mb-6">
          <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Menu
          </div>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? 'text-white bg-white/10 shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <span 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full"
                    style={{ backgroundColor: seedColor }}
                  />
                )}
                <Icon 
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? '' : 'text-neutral-400 group-hover:text-neutral-200'
                  }`}
                  style={{ color: isActive ? seedColor : undefined }}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Collections */}
        <div className="space-y-1 mb-6">
          <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Collections
          </div>
          
          <button
            onClick={onOpenFavorites}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 transition-all group"
          >
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#FF4081] to-[#FF5252] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Heart className="w-3.5 h-3.5 fill-white" />
            </div>
            <span className="truncate">Liked Songs</span>
          </button>

          <button
            onClick={onOpenOfflineTracks}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 transition-all group"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Download className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">Downloaded Tracks</span>
          </button>
        </div>

        {/* Custom Playlists */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-3 py-1 mb-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Playlists
            </span>
            <button
              onClick={onCreatePlaylistModal}
              className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              title="Create New Playlist"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {customPlaylists.length === 0 ? (
              <div className="px-3 py-4 text-center text-[11px] text-neutral-400 border border-dashed border-white/10 rounded-2xl">
                No custom playlists yet. Click '+' to create one.
              </div>
            ) : (
              customPlaylists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => onSelectPlaylist(pl)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors text-left truncate group"
                >
                  <FolderHeart className="w-4 h-4 text-neutral-400 group-hover:text-white flex-shrink-0" />
                  <span className="truncate flex-1">{pl.title}</span>
                  <span className="text-[10px] text-neutral-400">
                    {pl.trackCount}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-4 p-3 rounded-2xl bg-neutral-900/80 border border-white/10 text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5 font-bold text-neutral-200 mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5252]" style={{ color: seedColor }} />
            <span>Eshu Audio Engine</span>
          </div>
          <p className="text-[10px] leading-relaxed text-neutral-400">
            SponsorBlock auto-skip & AutoEq active.
          </p>
        </div>
      </aside>

      {/* 2. Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around">
        {mainNavItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-white scale-105' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon 
                className="w-5 h-5 mb-0.5" 
                style={{ color: isActive ? seedColor : undefined }}
              />
              <span 
                className="text-[10px] font-semibold tracking-tight"
                style={{ color: isActive ? seedColor : undefined }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
