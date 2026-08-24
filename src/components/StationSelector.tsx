import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Station, CustomPlaylist } from '../types';
import { 
  Link2, 
  Play, 
  Plus, 
  Trash2, 
  Disc, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { parseYouTubeUrl } from '../services/youtubeService';

interface StationSelectorProps {
  stations: Station[];
  customPlaylists: CustomPlaylist[];
  currentStation: Station | null;
  onSelectStation: (station: Station) => void;
  onOpenPlaylistManager: () => void;
  onDirectStream?: (url: string, name?: string) => void;
  onDeletePlaylist?: (id: string) => void;
  onOpenQueue?: () => void;
  playlistTrackCount?: number;
}

export const StationSelector: React.FC<StationSelectorProps> = ({
  stations,
  customPlaylists,
  currentStation,
  onSelectStation,
  onOpenPlaylistManager,
  onDirectStream,
  onDeletePlaylist,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [inputError, setInputError] = useState(false);

  // Sliding Strip State & Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const checkScrollBounds = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    checkScrollBounds();
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScrollBounds, { passive: true });
    window.addEventListener('resize', checkScrollBounds, { passive: true });

    return () => {
      el.removeEventListener('scroll', checkScrollBounds);
      window.removeEventListener('resize', checkScrollBounds);
    };
  }, [checkScrollBounds, stations, customPlaylists]);

  const handleSlideLeft = () => {
    if (!scrollContainerRef.current) return;
    const step = Math.max(220, scrollContainerRef.current.clientWidth * 0.6);
    scrollContainerRef.current.scrollBy({ left: -step, behavior: 'smooth' });
  };

  const handleSlideRight = () => {
    if (!scrollContainerRef.current) return;
    const step = Math.max(220, scrollContainerRef.current.clientWidth * 0.6);
    scrollContainerRef.current.scrollBy({ left: step, behavior: 'smooth' });
  };

  // Mouse Drag to Slide support for PC
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Mouse Wheel horizontal sliding
  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollContainerRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
      scrollContainerRef.current.scrollLeft += e.deltaY * 0.85;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    const parsed = parseYouTubeUrl(inputUrl.trim());
    if (parsed.type === 'invalid') {
      setInputError(true);
      setTimeout(() => setInputError(false), 2500);
      return;
    }

    if (onDirectStream) {
      onDirectStream(inputUrl.trim());
      setInputUrl('');
    }
  };

  return (
    <div id="playlist-stream-bar" className="w-full px-3 sm:px-6 md:px-8 lg:px-10 py-1.5 sm:py-2 border-b border-white/5 bg-[#0A0A0C]/75 backdrop-blur-md shrink-0">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Direct YouTube Stream URL Input (Compact on all screens) */}
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5 w-44 xs:w-56 sm:w-64 md:w-72 lg:w-80 shrink-0">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Link2 className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <input
              id="input-direct-yt-playlist"
              type="text"
              placeholder="Paste YouTube URL..."
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                setInputError(false);
              }}
              className={`w-full pl-8 pr-2.5 py-1 sm:py-1.5 rounded-xl bg-white/[0.04] text-[11px] sm:text-xs text-slate-100 placeholder:text-slate-500 border transition-all focus:outline-none h-8 sm:h-8.5 ${
                inputError 
                  ? 'border-rose-500/60 bg-rose-500/10 text-rose-200' 
                  : 'border-white/10 focus:border-indigo-500/50 focus:bg-white/[0.07]'
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={!inputUrl.trim()}
            className="px-2.5 py-1 sm:py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white text-[11px] sm:text-xs font-semibold transition-all h-8 sm:h-8.5 shrink-0 flex items-center gap-1 cursor-pointer"
            title="Stream YouTube URL"
          >
            <Play className="w-3 h-3 fill-white" />
            <span className="hidden sm:inline">Play</span>
          </button>
        </form>

        {/* Sliding Playlist / Station Strip with Interactive Controls */}
        <div className="relative flex-1 flex items-center min-w-0">
          {/* Slide Left Button */}
          <button
            id="btn-slide-left"
            onClick={handleSlideLeft}
            className={`absolute left-0 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-900/90 hover:bg-indigo-600 text-white border border-white/15 shadow-lg flex items-center justify-center transition-all cursor-pointer -translate-x-1 ${
              canScrollLeft ? 'opacity-100 scale-100' : 'opacity-0 pointer-events-none scale-90'
            }`}
            title="Slide Playlists Left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Left Gradient Fade */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0A0A0C] to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Scrollable Track / Playlist Strip */}
          <div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onWheel={handleWheel}
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 px-1 w-full select-none cursor-grab active:cursor-grabbing scroll-smooth"
          >
            {/* Custom User Playlists First */}
            {customPlaylists.map((pl) => {
              const isSelected = currentStation?.id === pl.id;
              return (
                <div
                  key={pl.id}
                  className={`group relative flex items-center gap-1.5 px-2 py-1 rounded-xl border text-[11px] sm:text-xs font-medium transition-all shrink-0 cursor-pointer h-8 sm:h-8.5 ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-100 border-emerald-500/50 shadow-sm'
                      : 'bg-white/[0.03] text-slate-300 border-white/5 hover:bg-white/[0.07] hover:text-white'
                  }`}
                  onClick={() => {
                    onSelectStation({
                      id: pl.id,
                      name: pl.name,
                      category: 'chillout',
                      playlistId: pl.playlistId,
                      videoId: pl.videoId,
                      description: pl.description || 'Custom YouTube Playlist',
                      coverUrl: pl.coverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
                      tag: pl.playlistId ? 'Playlist' : 'Track Stream',
                      color: '#10B981',
                      isCustom: true,
                    });
                  }}
                >
                  <div className="relative w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-white/15 shadow-sm flex items-center justify-center">
                    <img
                      src={pl.coverUrl || (pl.videoId ? `https://img.youtube.com/vi/${pl.videoId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80')}
                      alt={pl.name}
                      className="w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute bottom-0 right-0 px-0.5 py-0 bg-red-600 text-[6px] font-black text-white rounded-tl-[3px] leading-tight">
                      YT
                    </div>
                  </div>

                  <span className="truncate max-w-[90px] sm:max-w-[130px] font-semibold">{pl.name}</span>

                  {/* Delete custom playlist button on hover */}
                  {onDeletePlaylist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlaylist(pl.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 text-slate-500 transition-opacity ml-0.5"
                      title="Delete playlist"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Curated Ambient Radio Stations */}
            {stations.map((st) => {
              const isSelected = currentStation?.id === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => onSelectStation(st)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] sm:text-xs font-medium transition-all shrink-0 cursor-pointer h-8 sm:h-8.5 ${
                    isSelected
                      ? 'bg-indigo-600/30 text-indigo-100 border-indigo-500/50 shadow-sm'
                      : 'bg-white/[0.03] text-slate-300 border-white/5 hover:bg-white/[0.07] hover:text-white'
                  }`}
                  title={`${st.name} - ${st.tag}`}
                >
                  <Disc className={`w-3 h-3 shrink-0 ${isSelected ? 'text-indigo-400 animate-spin' : 'text-slate-400'}`} />
                  <span className="truncate max-w-[80px] sm:max-w-[120px] font-medium">{st.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right Gradient Fade */}
          <div
            className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0A0A0C] to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
              canScrollRight ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Slide Right Button */}
          <button
            id="btn-slide-right"
            onClick={handleSlideRight}
            className={`absolute right-0 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-900/90 hover:bg-indigo-600 text-white border border-white/15 shadow-lg flex items-center justify-center transition-all cursor-pointer translate-x-1 ${
              canScrollRight ? 'opacity-100 scale-100' : 'opacity-0 pointer-events-none scale-90'
            }`}
            title="Slide Playlists Right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
