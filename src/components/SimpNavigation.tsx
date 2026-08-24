import React from 'react';
import { TabType, Playlist } from '../types';
import { 
  Home, 
  Search, 
  Library, 
  BarChart3, 
  Settings, 
  Plus, 
  Heart, 
  Download, 
  Sparkles, 
  Radio,
  Flame,
  Music2
} from 'lucide-react';

interface SimpNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  customPlaylists: Playlist[];
  onSelectPlaylist?: (playlist: Playlist) => void;
  onCreatePlaylistModal: () => void;
  onOpenFavorites: () => void;
  onOpenOfflineTracks: () => void;
}

export const SimpNavigation: React.FC<SimpNavigationProps> = ({
  activeTab,
  onTabChange,
  customPlaylists,
  onSelectPlaylist,
  onCreatePlaylistModal,
  onOpenFavorites,
  onOpenOfflineTracks,
}) => {
  const navItems = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'search' as TabType, label: 'Search', icon: Search },
    { id: 'library' as TabType, label: 'Library', icon: Library },
    { id: 'analytics' as TabType, label: 'Stats', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* 1. Desktop Left Sidebar / Navigation Rail */}
      <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-61px)] sticky top-[61px] bg-neutral-950/70 border-r border-white/[0.06] p-4 select-none shrink-0 overflow-y-auto">
        <div className="space-y-1 mb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#8ECAE6]/15 text-[#8ECAE6] shadow-sm shadow-[#8ECAE6]/10 font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#8ECAE6]' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
                {item.id === 'home' && isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#8ECAE6]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Collections Section */}
        <div className="pt-4 border-t border-white/[0.06] space-y-1 mb-6">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
            Quick Collections
          </p>

          <button
            onClick={onOpenFavorites}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-neutral-300 hover:text-white hover:bg-white/[0.05] transition-all group"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FF4081] to-[#C2185B] flex items-center justify-center text-white shadow-sm shadow-[#FF4081]/20">
              <Heart className="w-3.5 h-3.5 fill-white" />
            </div>
            <span className="font-medium">Liked Songs</span>
          </button>

          <button
            onClick={onOpenOfflineTracks}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-neutral-300 hover:text-white hover:bg-white/[0.05] transition-all group"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#06D6A0] to-[#049669] flex items-center justify-center text-white shadow-sm shadow-[#06D6A0]/20">
              <Download className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium">Downloaded</span>
          </button>
        </div>

        {/* Playlists List with Create button */}
        <div className="flex-1 min-h-[140px] flex flex-col">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Playlists
            </span>
            <button
              onClick={onCreatePlaylistModal}
              className="p-1 rounded-lg text-neutral-400 hover:text-[#8ECAE6] hover:bg-[#8ECAE6]/10 transition-colors"
              title="Create new playlist"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {customPlaylists.length === 0 ? (
              <div className="px-3 py-4 text-center border border-dashed border-white/10 rounded-xl bg-neutral-900/30">
                <Music2 className="w-6 h-6 text-neutral-500 mx-auto mb-1.5" />
                <p className="text-xs text-neutral-400">No custom playlists yet</p>
                <button
                  onClick={onCreatePlaylistModal}
                  className="mt-2 text-xs font-semibold text-[#8ECAE6] hover:underline"
                >
                  + Create Playlist
                </button>
              </div>
            ) : (
              customPlaylists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => onSelectPlaylist?.(pl)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/[0.05] text-left truncate transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-neutral-800 shrink-0 overflow-hidden">
                    {pl.thumbnail ? (
                      <img src={pl.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-500">
                        <Music2 className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <span className="truncate font-medium">{pl.title}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* SimpMusic FOSS Badge */}
        <div className="pt-3 border-t border-white/[0.06] text-center">
          <a
            href="https://github.com/maxrave-dev/SimpMusic"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-[#8ECAE6] transition-colors"
          >
            <Sparkles className="w-3 h-3 text-[#8ECAE6]" />
            <span>SimpMusic v1.2.0 • FOSS</span>
          </a>
        </div>
      </aside>

      {/* 2. Mobile Bottom Liquid Glass Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-2 pt-1 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto bg-neutral-950/90 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/80 px-2 py-1.5 flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-[#8ECAE6]' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-[#8ECAE6]/15 scale-110' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium mt-0.5 tracking-tight">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#8ECAE6]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
