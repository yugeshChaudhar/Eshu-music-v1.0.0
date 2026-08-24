import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Sliders, 
  Radio, 
  Wifi, 
  WifiOff, 
  Sparkles,
  Globe,
  Headphones,
  Check
} from 'lucide-react';
import { TabType } from '../types';
import { COUNTRY_CHARTS } from '../data/echoMusicData';

interface EchoHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenNotifications: () => void;
  onOpenSearchFocus: () => void;
  onOpenEqualizer: () => void;
  selectedCountry: string;
  onSelectCountry: (countryKey: string) => void;
  isOnline?: boolean;
  unreadNotifications?: number;
  seedColor?: string;
}

export const EchoHeader: React.FC<EchoHeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenNotifications,
  onOpenSearchFocus,
  onOpenEqualizer,
  selectedCountry,
  onSelectCountry,
  isOnline = true,
  unreadNotifications = 1,
  seedColor = '#FF5252',
}) => {
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

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
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden bg-neutral-900 border border-white/20 p-1 flex items-center justify-center">
              <img 
                src="/echo-logo.png" 
                alt="Eshu Music" 
                className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <Radio className="w-5 h-5 text-[#FF5252]" style={{ color: seedColor }} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1">
                Eshu<span style={{ color: seedColor }}>Music</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-white/10 text-neutral-300 border border-white/10 hidden sm:inline-block">
                v5.2.8
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
          {/* Chart Region Selector */}
          <div className="relative">
            <button
              onClick={() => setIsCountryDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 text-xs font-semibold text-neutral-200 transition-colors"
              title="Change Charts Region"
            >
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
              <span>{COUNTRY_CHARTS[selectedCountry]?.flag || '🌐'}</span>
              <span className="hidden sm:inline">{selectedCountry}</span>
            </button>

            {isCountryDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsCountryDropdownOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-48 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-50 p-1.5 animate-fadeIn">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-white/10 mb-1">
                    Charts Region
                  </div>
                  {Object.entries(COUNTRY_CHARTS).map(([key, data]) => {
                    const isSelected = selectedCountry === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          onSelectCountry(key);
                          setIsCountryDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-white/15 text-white font-bold'
                            : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{data.flag}</span>
                          <span>{data.name}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5" style={{ color: seedColor }} />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

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
