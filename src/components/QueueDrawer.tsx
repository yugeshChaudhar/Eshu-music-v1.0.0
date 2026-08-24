import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  ListMusic, 
  Music, 
  Play, 
  Radio, 
  Check, 
  Sparkles, 
  Disc, 
  Flame, 
  Loader2, 
  Shuffle, 
  PlayCircle 
} from 'lucide-react';
import { Station, TrackMetadata } from '../types';
import { fetchBatchTrackMetadata, getCachedTrackMetadata } from '../services/youtubeService';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  station: Station | null;
  currentTrack: TrackMetadata | null;
  playlistVideoIds: string[];
  onSelectTrackIndex?: (index: number) => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  isOpen,
  onClose,
  station,
  currentTrack,
  playlistVideoIds,
  onSelectTrackIndex,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [metadataMap, setMetadataMap] = useState<Record<string, { title: string; author: string; thumbnail: string }>>({});
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // Fetch track metadata when playlist video IDs change
  useEffect(() => {
    if (!isOpen || playlistVideoIds.length === 0) return;

    let isMounted = true;
    setIsLoadingMetadata(true);

    // Seed from cache immediately
    const initialMap: Record<string, { title: string; author: string; thumbnail: string }> = {};
    playlistVideoIds.forEach((id, idx) => {
      const cached = getCachedTrackMetadata(id);
      if (cached) {
        initialMap[id] = cached;
      } else if (currentTrack && currentTrack.videoId === id) {
        initialMap[id] = {
          title: currentTrack.title,
          author: currentTrack.author,
          thumbnail: currentTrack.thumbnail,
        };
      }
    });
    setMetadataMap(prev => ({ ...prev, ...initialMap }));

    // Fetch batch metadata in background
    fetchBatchTrackMetadata(playlistVideoIds)
      .then(fetched => {
        if (isMounted) {
          setMetadataMap(prev => ({ ...prev, ...fetched }));
          setIsLoadingMetadata(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingMetadata(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, playlistVideoIds]);

  // Map tracks with metadata and search filter
  const trackItems = useMemo(() => {
    return playlistVideoIds.map((id, index) => {
      const meta = metadataMap[id] || getCachedTrackMetadata(id);
      const isCurrentlyPlaying = 
        (currentTrack?.playlistIndex === index) || 
        (currentTrack?.videoId === id && (!currentTrack.playlistIndex || currentTrack.playlistIndex === index));

      const title = isCurrentlyPlaying && currentTrack?.title 
        ? currentTrack.title 
        : (meta?.title || `Track #${index + 1}`);

      const author = isCurrentlyPlaying && currentTrack?.author 
        ? currentTrack.author 
        : (meta?.author || station?.name || 'YouTube Stream');

      const thumbnail = meta?.thumbnail || `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

      return {
        id,
        index,
        title,
        author,
        thumbnail,
        isCurrentlyPlaying,
      };
    });
  }, [playlistVideoIds, metadataMap, currentTrack, station]);

  const filteredTracks = useMemo(() => {
    if (!searchTerm.trim()) return trackItems;
    const term = searchTerm.toLowerCase().trim();
    return trackItems.filter(
      t =>
        t.title.toLowerCase().includes(term) ||
        t.author.toLowerCase().includes(term) ||
        `#${t.index + 1}`.includes(term)
    );
  }, [trackItems, searchTerm]);

  if (!isOpen) return null;

  return (
    <div id="queue-drawer-backdrop" className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        id="queue-drawer-panel"
        className="w-full sm:max-w-lg h-[85vh] sm:h-full bg-[#0E0F14] rounded-t-3xl sm:rounded-none border-t sm:border-l sm:border-t-0 border-white/10 shadow-2xl flex flex-col animate-slideLeft overflow-hidden pb-[env(safe-area-inset-bottom,0px)]"
      >
        {/* Mobile Swipe Handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.35)] shrink-0">
              <ListMusic className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight">Playlist Tracks</h3>
                {playlistVideoIds.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold">
                    {playlistVideoIds.length} Songs
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate max-w-[200px] sm:max-w-[240px]">
                {station?.name || 'Active Playlist'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-queue-drawer"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Close Tracks Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search / Filter Bar */}
        {playlistVideoIds.length > 0 && (
          <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-b border-white/5 bg-[#0B0C10] shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="input-search-playlist-tracks"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search songs or artists in this playlist..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.04] text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 border border-white/5 focus:border-indigo-500/60 focus:bg-white/[0.07] focus:outline-none transition-all min-h-[38px]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Current Playing Banner */}
        {currentTrack && (
          <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-b border-white/5 bg-indigo-950/20 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden shrink-0 border border-indigo-500/30 bg-slate-900 shadow-md">
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-full bg-indigo-400 animate-pulse" />
                    <span className="w-0.5 h-2 bg-indigo-300 animate-bounce" />
                    <span className="w-0.5 h-3 bg-indigo-400 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  Now Playing {currentTrack.playlistIndex !== undefined ? `(#${currentTrack.playlistIndex + 1})` : ''}
                </span>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                  {currentTrack.title}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                  {currentTrack.author}
                </p>
              </div>
            </div>

            {isLoadingMetadata && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 text-slate-400 text-[10px] shrink-0">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                <span className="hidden sm:inline">Loading details</span>
              </div>
            )}
          </div>
        )}

        {/* Scrollable Tracks List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 custom-scrollbar touch-pan-y">
          {playlistVideoIds.length === 0 ? (
            /* Single Track or Empty State */
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 my-auto">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg">
                <Disc className="w-6 h-6 sm:w-7 sm:h-7 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-200">
                  {station?.name || 'Single Track Stream'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  {station?.playlistId
                    ? 'Connecting to YouTube playlist stream and resolving queue tracks...'
                    : 'This is a single track audio stream. To browse a list of songs, paste a full YouTube playlist or Mix link above.'}
                </p>
              </div>

              {currentTrack && (
                <div className="w-full max-w-sm p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/5 text-left flex items-center gap-3">
                  <img
                    src={currentTrack.thumbnail}
                    alt={currentTrack.title}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-200 truncate">{currentTrack.title}</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">{currentTrack.author}</p>
                  </div>
                </div>
              )}
            </div>
          ) : filteredTracks.length === 0 ? (
            /* Search yielded no matches */
            <div className="text-center py-10 px-4 space-y-3">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs sm:text-sm font-medium text-slate-400">No tracks matching "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-indigo-300 font-medium transition-colors min-h-[36px]"
              >
                Clear Search
              </button>
            </div>
          ) : (
            /* List of songs in the playlist */
            filteredTracks.map((track) => (
              <div
                key={`${track.id}-${track.index}`}
                id={`queue-track-item-${track.index}`}
                onClick={() => {
                  if (onSelectTrackIndex) {
                    onSelectTrackIndex(track.index);
                  }
                }}
                className={`group relative flex items-center justify-between gap-2.5 p-2 sm:p-3 rounded-xl cursor-pointer transition-all duration-200 select-none min-h-[48px] ${
                  track.isCurrentlyPlaying
                    ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-100 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                    : 'bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 text-slate-300 active:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  {/* Track Position Number / Equalizer */}
                  <div className="w-5 text-center shrink-0">
                    {track.isCurrentlyPlaying ? (
                      <div className="flex items-end justify-center gap-0.5 h-3">
                        <span className="w-0.5 h-3 bg-indigo-400 animate-pulse rounded-full" />
                        <span className="w-0.5 h-2 bg-indigo-300 animate-bounce rounded-full" />
                        <span className="w-0.5 h-2.5 bg-indigo-400 animate-pulse rounded-full" />
                      </div>
                    ) : (
                      <span className="text-[11px] sm:text-xs font-mono text-slate-500 font-medium group-hover:hidden">
                        {track.index + 1}
                      </span>
                    )}
                    {!track.isCurrentlyPlaying && (
                      <Play className="w-3.5 h-3.5 text-indigo-400 hidden group-hover:block mx-auto fill-current" />
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-slate-900">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${track.id}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Track Info */}
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-xs sm:text-sm font-medium line-clamp-1 ${track.isCurrentlyPlaying ? 'text-indigo-200 font-bold' : 'text-slate-200 group-hover:text-white'}`}>
                      {track.title}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {track.author}
                    </p>
                  </div>
                </div>

                {/* Right Action / Play Button */}
                <div className="shrink-0 flex items-center gap-1.5 pl-1">
                  {track.isCurrentlyPlaying ? (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider font-mono">
                      Playing
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectTrackIndex) onSelectTrackIndex(track.index);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-indigo-600 text-slate-400 hover:text-white transition-all active:scale-95 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Play this song"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info bar */}
        {playlistVideoIds.length > 0 && (
          <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-t border-white/5 bg-[#0B0C10] flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span className="text-[10px] sm:text-[11px]">
              Tap any song to play
            </span>
            {onSelectTrackIndex && (
              <button
                onClick={() => onSelectTrackIndex(0)}
                className="text-indigo-400 hover:text-indigo-300 font-medium text-[11px] transition-colors min-h-[32px] flex items-center"
              >
                Play from start
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
