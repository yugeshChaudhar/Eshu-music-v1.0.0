import React, { useState } from 'react';
import { 
  Search, 
  Play, 
  Pause, 
  Heart, 
  Plus, 
  ListPlus, 
  Sparkles, 
  Clock, 
  Radio, 
  Headphones, 
  TrendingUp, 
  Youtube,
  Disc3
} from 'lucide-react';
import { Track, Playlist, Artist } from '../../types';
import { ECHO_QUICK_PICKS, ECHO_TOP_ARTISTS, COUNTRY_CHARTS } from '../../data/echoMusicData';

interface SearchScreenProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, queue?: Track[]) => void;
  onAddToQueue: (track: Track) => void;
  onToggleFavorite: (track: Track) => void;
  favoriteTrackIds: Set<string>;
  onSelectArtist: (artist: Artist) => void;
  seedColor?: string;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  currentTrack,
  isPlaying,
  onPlayTrack,
  onAddToQueue,
  onToggleFavorite,
  favoriteTrackIds,
  onSelectArtist,
  seedColor = '#FF5252',
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'songs' | 'artists' | 'podcasts'>('all');

  const trendingTags = [
    'Bohemian Rhapsody',
    'The Weeknd',
    'Taylor Swift',
    'Kesariya',
    'Billie Eilish',
    'Alan Walker Faded',
    'Synthwave 80s',
    'Deep Focus Study',
  ];

  // Search all available tracks
  const allTracks = [
    ...ECHO_QUICK_PICKS,
    ...COUNTRY_CHARTS.GLOBAL.tracks,
    ...COUNTRY_CHARTS.IN.tracks,
  ];

  // Deduplicate tracks by ID
  const uniqueTracks = Array.from(new Map(allTracks.map((t) => [t.id, t])).values());

  const searchResults = uniqueTracks.filter((track) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      track.title.toLowerCase().includes(q) ||
      track.artist.toLowerCase().includes(q) ||
      (track.album && track.album.toLowerCase().includes(q))
    );
  });

  const matchingArtists = ECHO_TOP_ARTISTS.filter((a) => 
    !query || a.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-32 animate-fadeIn max-w-5xl mx-auto">
      {/* Search Input Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, albums, or paste YouTube video link..."
            className="w-full pl-12 pr-12 py-3.5 rounded-3xl bg-neutral-900/90 border border-white/15 text-white placeholder-neutral-500 text-sm sm:text-base focus:outline-none focus:border-white/40 shadow-2xl transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Trending Search Tags */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Trending Searches</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-3.5 py-1.5 rounded-2xl bg-neutral-900 border border-white/10 hover:border-white/25 text-xs font-medium text-neutral-300 hover:text-white transition-colors whitespace-nowrap"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {[
          { id: 'all' as const, label: 'All Results' },
          { id: 'songs' as const, label: 'Songs' },
          { id: 'artists' as const, label: 'Artists' },
        ].map((tab) => {
          const isSelected = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              style={{
                color: isSelected ? seedColor : undefined,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Matching Artists */}
      {(activeFilter === 'all' || activeFilter === 'artists') && matchingArtists.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Artists
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {matchingArtists.map((artist) => (
              <div
                key={artist.id}
                onClick={() => onSelectArtist(artist)}
                className="p-3.5 rounded-2xl bg-neutral-900/60 border border-white/10 hover:border-white/25 hover:bg-neutral-900 transition-all cursor-pointer group flex items-center gap-3"
              >
                <img 
                  src={artist.thumbnail} 
                  alt={artist.name} 
                  className="w-12 h-12 rounded-full object-cover shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-[#FF5252] transition-colors">
                    {artist.name}
                  </h4>
                  <p className="text-[10px] text-neutral-400 truncate">
                    Artist
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Track Results */}
      {(activeFilter === 'all' || activeFilter === 'songs') && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Songs & Tracks ({searchResults.length})
          </h3>

          <div className="space-y-2">
            {searchResults.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isFav = favoriteTrackIds.has(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track, searchResults)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                    isCurrent
                      ? 'bg-neutral-900 border-white/30 ring-1 ring-[#FF5252]'
                      : 'bg-neutral-900/60 border-white/10 hover:bg-neutral-900 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-5 text-center text-xs font-bold text-neutral-400">
                      {idx + 1}
                    </span>

                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0 shadow-md">
                      <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {isCurrent && isPlaying ? (
                          <Pause className="w-5 h-5 fill-white text-white" />
                        ) : (
                          <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${isCurrent ? 'text-[#FF5252]' : 'text-white'}`}>
                        {track.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {track.artist} {track.album ? `• ${track.album}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onAddToQueue(track)}
                      className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Add to Up Next Queue"
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onToggleFavorite(track)}
                      className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Favorite"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-[#FF4081] text-[#FF4081]' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
