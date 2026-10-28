import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Play, 
  Pause, 
  Heart, 
  ListPlus, 
  Clock, 
  Youtube, 
  Loader2, 
  Check, 
  AlertCircle, 
  FolderPlus, 
  Shuffle, 
  X, 
  RotateCw,
  Music
} from 'lucide-react';
import { Track, Artist } from '../../types';
import { ECHO_TOP_ARTISTS } from '../../data/echoMusicData';
import { universalSearch, fetchLiveSearchSuggestions, extractYouTubeInfo } from '../../services/universalSearchService';
import { 
  getRecentSearches, 
  addRecentSearch, 
  removeRecentSearch, 
  clearRecentSearches 
} from '../../services/echoStorage';

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
  
  // Real Search State
  const [liveResults, setLiveResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isDirectLink, setIsDirectLink] = useState(false);
  const [directLinkTrack, setDirectLinkTrack] = useState<Track | null>(null);
  const [addedQueueNotice, setAddedQueueNotice] = useState<string | null>(null);

  // Persistent Recent Searches State
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getRecentSearches());

  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<any>(null);

  // Perform Live Universal Search
  const executeSearch = async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setLiveResults([]);
      setIsLoading(false);
      setHasSearched(false);
      setIsDirectLink(false);
      setDirectLinkTrack(null);
      setSearchError(null);
      return;
    }

    // Persist real search query into recent searches history
    const updatedHistory = addRecentSearch(trimmed);
    setRecentSearches(updatedHistory);

    setIsLoading(true);
    setHasSearched(true);
    setSearchError(null);

    try {
      const response = await universalSearch(trimmed);
      setLiveResults(response.results || []);

      if (response.isDirectLink || response.directTrack) {
        setIsDirectLink(true);
        setDirectLinkTrack(response.directTrack || response.results[0] || null);
      } else {
        setIsDirectLink(false);
        setDirectLinkTrack(null);
      }
    } catch (err: any) {
      console.warn('Search error:', err);
      setSearchError(err?.message || 'Search request failed. Please check your network and try again.');
      setLiveResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial query if provided from external navigation
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setQuery(initialQuery);
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  // Fetch search suggestions
  const fetchSuggestions = async (term: string) => {
    if (!term || term.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const sugs = await fetchLiveSearchSuggestions(term);
      setSuggestions(sugs || []);
    } catch {
      setSuggestions([]);
    }
  };

  // Handle Input Changes with Debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSearchError(null);

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

    // Check if user pasted a direct YouTube link -> execute immediately
    const yt = extractYouTubeInfo(val);
    if (yt.videoId || yt.playlistId) {
      executeSearch(val);
      return;
    }

    fetchSuggestions(val);

    searchTimeoutRef.current = setTimeout(() => {
      executeSearch(val);
    }, 450);
  };

  // Handle Key Down (Enter executes instantly)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      setSuggestions([]);
      executeSearch(query);
    }
  };

  const handleSuggestionClick = (sug: string) => {
    setQuery(sug);
    setSuggestions([]);
    executeSearch(sug);
  };

  const handleSelectRecentSearch = (term: string) => {
    setQuery(term);
    setSuggestions([]);
    executeSearch(term);
    inputRef.current?.focus();
  };

  const handleRemoveRecentSearch = (e: React.MouseEvent | React.KeyboardEvent, term: string) => {
    e.stopPropagation();
    const updated = removeRecentSearch(term);
    setRecentSearches(updated);
  };

  const handleClearAllRecentSearches = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleResetSearch = () => {
    setQuery('');
    setLiveResults([]);
    setSuggestions([]);
    setHasSearched(false);
    setIsDirectLink(false);
    setDirectLinkTrack(null);
    setSearchError(null);
    inputRef.current?.focus();
  };

  const handleQueueTrack = (track: Track) => {
    onAddToQueue(track);
    setAddedQueueNotice(track.title);
    setTimeout(() => setAddedQueueNotice(null), 2500);
  };

  // Matching Artists only rendered when user actively searches for a name
  const matchingArtists = (hasSearched && query.trim())
    ? ECHO_TOP_ARTISTS.filter((a) => a.name.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  /**
   * Generates a randomized queue from search results.
   * Keeps the selected track first so it starts immediately,
   * while shuffling all remaining search results so playback advances randomly.
   */
  const createRandomQueueFromSearch = (selectedTrack: Track, allTracks: Track[]): Track[] => {
    if (!allTracks || allTracks.length <= 1) {
      return [selectedTrack];
    }
    const pool = allTracks.filter((t) => t.id !== selectedTrack.id);
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return [selectedTrack, ...shuffled];
  };

  const handlePlayTrackFromSearch = (track: Track) => {
    const randomQueue = createRandomQueueFromSearch(track, liveResults);
    onPlayTrack(track, randomQueue);
  };

  const handlePlayRandomAll = () => {
    if (liveResults.length === 0) return;
    const randomIndex = Math.floor(Math.random() * liveResults.length);
    const randomFirstTrack = liveResults[randomIndex];
    const randomQueue = createRandomQueueFromSearch(randomFirstTrack, liveResults);
    onPlayTrack(randomFirstTrack, randomQueue);
  };

  const handlePlayAllStandard = () => {
    if (liveResults.length === 0) return;
    const firstTrack = liveResults[0];
    const randomQueue = createRandomQueueFromSearch(firstTrack, liveResults);
    onPlayTrack(firstTrack, randomQueue);
  };

  return (
    <div className="space-y-6 pb-36 animate-fadeIn max-w-4xl mx-auto px-1 sm:px-2">
      {/* Search Input Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-neutral-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search songs, artists, albums, or paste YouTube link..."
            className="w-full pl-12 pr-24 py-4 rounded-3xl bg-neutral-900/90 border border-white/15 text-white placeholder-neutral-500 text-sm sm:text-base focus:outline-none focus:border-white/40 shadow-2xl transition-all"
            autoFocus
          />

          <div className="absolute right-4 flex items-center gap-2">
            {isLoading && (
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: seedColor }} />
            )}
            {query && (
              <button
                onClick={handleResetSearch}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-white/40"
                title="Clear Search"
                aria-label="Clear Search Input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Autocomplete Suggestions Dropdown */}
        {suggestions.length > 0 && query.trim() && (
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
                <Youtube className="w-8 h-8" style={{ color: seedColor }} />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-white mb-1">
                <Youtube className="w-3 h-3" style={{ color: seedColor }} />
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
              onClick={() => handlePlayTrackFromSearch(directLinkTrack)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-extrabold text-black transition-all shadow-lg hover:scale-105"
              style={{ backgroundColor: seedColor }}
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Play Now</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STATE A: DEFAULT SEARCH LANDING PAGE (Empty Query / No Active Search)
          Displays user's authentic Recent Searches or clean empty state.
          No random songs, no hardcoded artists grid, no placeholder lists.
         ========================================================================= */}
      {!hasSearched && !isLoading && (
        <section className="space-y-4 animate-fadeIn" aria-label="Recent Searches">
          {recentSearches.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2 text-neutral-300">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                    Recent Searches
                  </h2>
                </div>
                <button
                  onClick={handleClearAllRecentSearches}
                  className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-white/30"
                  aria-label="Clear all recent searches"
                >
                  Clear history
                </button>
              </div>

              {/* Recent Search Queries List */}
              <div className="space-y-2" role="list">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    role="listitem"
                    onClick={() => handleSelectRecentSearch(term)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectRecentSearch(term);
                      }
                    }}
                    tabIndex={0}
                    className="group flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/10 hover:border-white/20 transition-all cursor-pointer backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/30"
                    aria-label={`Search for ${term}`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-neutral-400 group-hover:text-white transition-colors">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-neutral-200 group-hover:text-white truncate">
                        {term}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleRemoveRecentSearch(e, term)}
                      className="p-2 -mr-1 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-white/30 flex-shrink-0"
                      title={`Remove "${term}" from history`}
                      aria-label={`Remove "${term}" from history`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Clean Empty State when user has no recent searches */
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 rounded-3xl bg-white/[0.02] border border-white/5 p-8 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                <Search className="w-7 h-7 text-neutral-400" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-base font-bold text-white">Search for songs, artists, or podcasts</h3>
                <p className="text-xs text-neutral-400">
                  Your recent searches will appear here. You can also paste direct YouTube video and playlist links.
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          STATE B: SEARCHING / LOADING INDICATOR
         ========================================================================= */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400 animate-fadeIn">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: seedColor }} />
          <p className="text-xs sm:text-sm font-medium text-neutral-300">
            Searching for &quot;{query}&quot;...
          </p>
        </div>
      )}

      {/* =========================================================================
          STATE E: ERROR STATE WITH RETRY
         ========================================================================= */}
      {!isLoading && searchError && (
        <div className="py-16 text-center space-y-4 rounded-3xl bg-red-500/5 border border-red-500/20 p-6 backdrop-blur-md animate-fadeIn">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="text-base font-bold text-white">Search encountered an issue</h4>
            <p className="text-xs text-neutral-400">{searchError}</p>
          </div>
          <button
            onClick={() => executeSearch(query)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all shadow-md hover:scale-105"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Retry Search</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          STATE D: NO RESULTS FOUND
         ========================================================================= */}
      {!isLoading && !searchError && hasSearched && liveResults.length === 0 && (
        <div className="py-16 text-center space-y-3 rounded-3xl bg-neutral-900/40 border border-white/5 p-6 animate-fadeIn">
          <AlertCircle className="w-10 h-10 text-neutral-500 mx-auto" />
          <h4 className="text-base font-bold text-white">No songs found for &quot;{query}&quot;</h4>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Try searching for the artist name, song title, or paste the exact YouTube video URL directly.
          </p>
        </div>
      )}

      {/* =========================================================================
          STATE C: GENUINE SEARCH RESULTS FOUND
         ========================================================================= */}
      {!isLoading && !searchError && hasSearched && liveResults.length > 0 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Filter Tabs if Matching Artists Exist */}
          {matchingArtists.length > 0 && (
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              {[
                { id: 'all' as const, label: 'All Results' },
                { id: 'songs' as const, label: `Songs (${liveResults.length})` },
                { id: 'artists' as const, label: `Artists (${matchingArtists.length})` },
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
          )}

          {/* Genuine Artist Matches (Only shown when query explicitly matches) */}
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
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-[#FF5252] transition-colors">
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

          {/* Song Results List */}
          {(activeFilter === 'all' || activeFilter === 'songs') && (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                    <Youtube className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Search Results ({liveResults.length})</span>
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Shuffle className="w-2.5 h-2.5" />
                    Random Queue
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlayRandomAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                    title="Randomize search results and play a random track"
                  >
                    <Shuffle className="w-3.5 h-3.5" style={{ color: seedColor }} />
                    <span>Random Queue</span>
                  </button>
                  <button
                    onClick={handlePlayAllStandard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                    title="Play top track with randomized upcoming queue"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Play All</span>
                  </button>
                </div>
              </div>

              {/* Real Tracks List */}
              <div className="space-y-2">
                {liveResults.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  const isFav = favoriteTrackIds.has(track.id);

                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => handlePlayTrackFromSearch(track)}
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
                              const target = e.currentTarget as HTMLImageElement;
                              const fallbackUrl = `https://img.youtube.com/vi/${track.id}/hqdefault.jpg`;
                              if (target.src !== fallbackUrl) {
                                target.src = fallbackUrl;
                              }
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
                          <h4 
                            className={`text-xs sm:text-sm font-bold truncate ${isCurrent ? 'text-[#FF5252]' : 'text-white'}`} 
                            style={{ color: isCurrent ? seedColor : undefined }}
                          >
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

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        {onAddToPlaylist && (
                          <button
                            onClick={() => onAddToPlaylist(track)}
                            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Add to Playlist"
                            aria-label="Add to Playlist"
                          >
                            <FolderPlus className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleQueueTrack(track)}
                          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Add to Up Next Queue"
                          aria-label="Add to Up Next Queue"
                        >
                          <ListPlus className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onToggleFavorite(track)}
                          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Favorite"
                          aria-label="Favorite"
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
      )}
    </div>
  );
};
