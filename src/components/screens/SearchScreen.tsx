import React, { useState, useEffect, useRef } from 'react';
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
  Disc3,
  Loader2,
  ExternalLink,
  Check,
  AlertCircle,
  FolderPlus
} from 'lucide-react';
import { Track, Playlist, Artist } from '../../types';
import { ECHO_QUICK_PICKS, ECHO_TOP_ARTISTS, COUNTRY_CHARTS } from '../../data/echoMusicData';
import { universalSearch, fetchLiveSearchSuggestions, extractYouTubeInfo } from '../../services/universalSearchService';

interface SearchScreenProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, queue?: Track[]) => void;
  onAddToQueue: (track: Track) => void;
  onToggleFavorite: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  favoriteTrackIds: Set<string>;
  onSelectArtist: (artist: Artist) => void;
  seedColor?: string;
  initialQuery?: string;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  currentTrack,
  isPlaying,
  onPlayTrack,
  onAddToQueue,
  onToggleFavorite,
  onAddToPlaylist,
  favoriteTrackIds,
  onSelectArtist,
  seedColor = '#FF5252',
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<'all' | 'songs' | 'artists'>('all');
  
  // Live Search State
  const [liveResults, setLiveResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isDirectLink, setIsDirectLink] = useState(false);
  const [directLinkTrack, setDirectLinkTrack] = useState<Track | null>(null);
  const [addedQueueNotice, setAddedQueueNotice] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<any>(null);

  const trendingTags = [
    'Kesariya',
    'Arijit Singh',
    'The Weeknd',
    'Taylor Swift',
    'Alan Walker Faded',
    'Bohemian Rhapsody',
    'Synthwave 80s',
    'Lofi Hip Hop Study',
    'Billie Eilish',
    'Coldplay',
  ];

  // Static Local Curated Fallbacks
  const allStaticTracks = [
    ...ECHO_QUICK_PICKS,
    ...COUNTRY_CHARTS.GLOBAL.tracks,
    ...COUNTRY_CHARTS.IN.tracks,
  ];
  const uniqueStaticTracks = Array.from(new Map(allStaticTracks.map((t) => [t.id, t])).values());

  // Perform Live Universal Search (Vercel, Node, and Invidious compatible)
  const executeSearch = async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setLiveResults([]);
      setIsLoading(false);
      setHasSearched(false);
      setIsDirectLink(false);
      setDirectLinkTrack(null);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await universalSearch(trimmed);
      setLiveResults(response.results);

      if (response.isDirectLink || response.directTrack) {
        setIsDirectLink(true);
        setDirectLinkTrack(response.directTrack || response.results[0] || null);
      } else {
        setIsDirectLink(false);
        setDirectLinkTrack(null);
      }
    } catch (err) {
      console.warn('Search error:', err);
      // Local fallback
      const filtered = uniqueStaticTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(trimmed.toLowerCase()) ||
          t.artist.toLowerCase().includes(trimmed.toLowerCase())
      );
      setLiveResults(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch search suggestions
  const fetchSuggestions = async (term: string) => {
    if (!term || term.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const sugs = await fetchLiveSearchSuggestions(term);
      setSuggestions(sugs);
    } catch {
      setSuggestions([]);
    }
  };

  // Handle Input Changes with Debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val.trim()) {
      setLiveResults([]);
      setSuggestions([]);
      setIsLoading(false);
      setHasSearched(false);
      setIsDirectLink(false);
      setDirectLinkTrack(null);
      return;
    }

    // Check if user pasted a direct link -> search immediately!
    const yt = extractYouTubeInfo(val);
    if (yt.videoId || yt.playlistId) {
      executeSearch(val);
      return;
    }

    fetchSuggestions(val);

    searchTimeoutRef.current = setTimeout(() => {
      executeSearch(val);
    }, 380);
  };

  // Handle Key Down (Enter executes instantly)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      setSuggestions([]);
      executeSearch(query);
    }
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    setSuggestions([]);
    executeSearch(tag);
  };

  const handleSuggestionClick = (sug: string) => {
    setQuery(sug);
    setSuggestions([]);
    executeSearch(sug);
  };

  const handleQueueTrack = (track: Track) => {
    onAddToQueue(track);
    setAddedQueueNotice(track.title);
    setTimeout(() => setAddedQueueNotice(null), 2500);
  };

  // Artist Matches
  const matchingArtists = ECHO_TOP_ARTISTS.filter(
    (a) => !query || a.name.toLowerCase().includes(query.toLowerCase())
  );

  // Active track list to show
  const displayedTracks = hasSearched ? liveResults : uniqueStaticTracks.slice(0, 15);

  return (
    <div className="space-y-8 pb-32 animate-fadeIn max-w-5xl mx-auto">
      {/* Search Input Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search any song, artist, album, or paste YouTube link..."
            className="w-full pl-12 pr-24 py-4 rounded-3xl bg-neutral-900/90 border border-white/15 text-white placeholder-neutral-500 text-sm sm:text-base focus:outline-none focus:border-white/40 shadow-2xl transition-all"
            autoFocus
          />

          <div className="absolute right-4 flex items-center gap-2">
            {isLoading && (
              <Loader2 className="w-5 h-5 text-[#FF5252] animate-spin" style={{ color: seedColor }} />
            )}
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setLiveResults([]);
                  setSuggestions([]);
                  setHasSearched(false);
                  setIsDirectLink(false);
                  setDirectLinkTrack(null);
                  inputRef.current?.focus();
                }}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white text-xs transition-colors"
                title="Clear Search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Autocomplete Suggestions Dropdown */}
        {suggestions.length > 0 && query && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-30 p-2 overflow-hidden animate-fadeIn">
            {suggestions.map((sug) => (
              <button
                key={sug}
                onClick={() => handleSuggestionClick(sug)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-neutral-500" />
                <span className="truncate">{sug}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Added to Queue Toast */}
      {addedQueueNotice && (
        <div className="fixed bottom-24 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-900/95 border border-white/20 text-white text-xs shadow-2xl animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Added to Up Next: <strong>{addedQueueNotice}</strong></span>
        </div>
      )}

      {/* Direct YouTube Video / Link Detected Banner */}
      {isDirectLink && directLinkTrack && (
        <div 
          className="p-5 rounded-3xl border border-white/15 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5 animate-fadeIn"
          style={{ backgroundColor: `${seedColor}18` }}
        >
          <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-neutral-900 border border-white/20 flex-shrink-0 shadow-lg group">
              <img 
                src={directLinkTrack.thumbnail} 
                alt={directLinkTrack.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Youtube className="w-8 h-8 text-[#FF5252]" style={{ color: seedColor }} />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-white mb-1">
                <Youtube className="w-3 h-3 text-[#FF5252]" style={{ color: seedColor }} />
                <span>YouTube Link Detected</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                {directLinkTrack.title}
              </h3>
              <p className="text-xs text-neutral-300 truncate">
                {directLinkTrack.artist}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleQueueTrack(directLinkTrack)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 border border-white/15 text-xs font-bold text-neutral-200 transition-all"
            >
              <ListPlus className="w-4 h-4" />
              <span>Add to Queue</span>
            </button>

            <button
              onClick={() => onPlayTrack(directLinkTrack, [directLinkTrack])}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-extrabold text-black transition-all shadow-lg hover:scale-105"
              style={{ backgroundColor: seedColor }}
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Play Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Trending Search Tags */}
      {!hasSearched && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Trending Searches & Artists</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {trendingTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-3.5 py-1.5 rounded-2xl bg-neutral-900 border border-white/10 hover:border-white/25 text-xs font-medium text-neutral-300 hover:text-white transition-colors whitespace-nowrap hover:bg-neutral-800"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

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
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Artists</span>
            <span className="text-[10px] text-neutral-500">{matchingArtists.length} found</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {matchingArtists.map((artist) => (
              <div
                key={artist.id}
                onClick={() => onSelectArtist(artist)}
                className="p-3.5 rounded-2xl bg-neutral-900/60 border border-white/10 hover:border-white/25 hover:bg-neutral-900 transition-all cursor-pointer group flex items-center gap-3 shadow-sm"
              >
                <img 
                  src={artist.thumbnail} 
                  alt={artist.name} 
                  className="w-12 h-12 rounded-full object-cover shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-[#FF5252] transition-colors" style={{ color: undefined }}>
                    {artist.name}
                  </h4>
                  <p className="text-[10px] text-neutral-400 truncate">
                    Artist • {artist.monthlyListeners || '10M+ streams'}
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
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
              <Youtube className="w-3.5 h-3.5 text-neutral-400" />
              <span>{hasSearched ? `Search Results (${displayedTracks.length})` : 'Popular Tracks & Quick Picks'}</span>
            </h3>
            {displayedTracks.length > 0 && (
              <button
                onClick={() => onPlayTrack(displayedTracks[0], displayedTracks)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Play All</span>
              </button>
            )}
          </div>

          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: seedColor }} />
              <p className="text-xs font-medium">Searching YouTube Music for &quot;{query}&quot;...</p>
            </div>
          )}

          {!isLoading && hasSearched && displayedTracks.length === 0 && (
            <div className="py-16 text-center space-y-3 rounded-3xl bg-neutral-900/40 border border-white/5 p-6">
              <AlertCircle className="w-10 h-10 text-neutral-500 mx-auto" />
              <h4 className="text-base font-bold text-white">No songs found for &quot;{query}&quot;</h4>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Try searching for the artist name, song title, or paste the exact YouTube video URL or ID directly.
              </p>
            </div>
          )}

          {!isLoading && displayedTracks.length > 0 && (
            <div className="space-y-2">
              {displayedTracks.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                const isFav = favoriteTrackIds.has(track.id);

                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => onPlayTrack(track, displayedTracks)}
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
                        <img 
                          src={track.thumbnail} 
                          alt={track.title} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${track.id}/hqdefault.jpg`;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {isCurrent && isPlaying ? (
                            <Pause className="w-5 h-5 fill-white text-white" />
                          ) : (
                            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs sm:text-sm font-bold truncate ${isCurrent ? 'text-[#FF5252]' : 'text-white'}`} style={{ color: isCurrent ? seedColor : undefined }}>
                          {track.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 truncate flex items-center gap-2">
                          <span>{track.artist}</span>
                          {track.views && (
                            <span className="text-neutral-500 text-[10px] hidden sm:inline">• {track.views}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {onAddToPlaylist && (
                        <button
                          onClick={() => onAddToPlaylist(track)}
                          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Add to Playlist"
                        >
                          <FolderPlus className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleQueueTrack(track)}
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
          )}
        </section>
      )}
    </div>
  );
};
