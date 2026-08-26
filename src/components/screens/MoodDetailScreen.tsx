import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Shuffle, 
  RefreshCw, 
  Heart, 
  Plus, 
  Clock, 
  Sparkles,
  Coffee,
  Zap,
  Brain,
  Moon,
  Disc3,
  Flame,
  Music2,
  Headphones,
  Check
} from 'lucide-react';
import { Track, MoodCategory } from '../../types';
import { fetchMoodTracks, MOOD_DEFINITIONS, MoodDefinition } from '../../services/moodDiscoveryService';

interface MoodDetailScreenProps {
  mood: MoodCategory;
  onBack: () => void;
  onPlayTrack: (track: Track, queue?: Track[]) => void;
  onPlayAll: (tracks: Track[]) => void;
  onShuffleAll: (tracks: Track[]) => void;
  favoriteTrackIds?: Set<string>;
  onToggleFavorite?: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  currentTrack?: Track | null;
  isPlaying?: boolean;
  seedColor?: string;
}

export const MoodDetailScreen: React.FC<MoodDetailScreenProps> = ({
  mood,
  onBack,
  onPlayTrack,
  onPlayAll,
  onShuffleAll,
  favoriteTrackIds = new Set(),
  onToggleFavorite,
  onAddToPlaylist,
  currentTrack,
  isPlaying,
  seedColor = '#FF5252',
}) => {
  const [tracks, setTracks] = useState<Track[]>(mood.tracks || []);
  const [isLoading, setIsLoading] = useState<boolean>(!mood.tracks || mood.tracks.length === 0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number>(20);

  const moodDef: MoodDefinition | undefined = MOOD_DEFINITIONS.find((m) => m.id === mood.id) || {
    id: mood.id,
    title: mood.title,
    subtitle: mood.subtitle,
    description: mood.subtitle,
    iconName: 'Headphones',
    color: mood.color,
    gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    coverUrl: mood.coverUrl,
    tags: mood.tags || [],
    searchQueries: [],
    seedTracks: mood.tracks || [],
  };

  const loadTracks = async (force: boolean = false) => {
    if (force) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const results = await fetchMoodTracks(mood.id, { forceRefresh: force, limit: 30 });
      if (results && results.length > 0) {
        setTracks(results);
      } else if (moodDef.seedTracks && moodDef.seedTracks.length > 0) {
        setTracks(moodDef.seedTracks);
      } else {
        setError('No tracks found for this mood yet. Try refreshing!');
      }
    } catch (err: any) {
      console.warn('Error loading mood tracks:', err);
      if (moodDef.seedTracks && moodDef.seedTracks.length > 0) {
        setTracks(moodDef.seedTracks);
      } else {
        setError('Failed to load mood tracks. Please check your internet connection.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTracks(false);
  }, [mood.id]);

  const renderIcon = () => {
    const iconClass = "w-7 h-7 sm:w-8 sm:h-8";
    switch (moodDef.iconName) {
      case 'Coffee': return <Coffee className={iconClass} />;
      case 'Zap': return <Zap className={iconClass} />;
      case 'Brain': return <Brain className={iconClass} />;
      case 'Moon': return <Moon className={iconClass} />;
      case 'Disc3': return <Disc3 className={iconClass} />;
      case 'Heart': return <Heart className={iconClass} />;
      case 'Flame': return <Flame className={iconClass} />;
      default: return <Headphones className={iconClass} />;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return '3:30';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const visibleTracks = tracks.slice(0, displayLimit);

  return (
    <div className="space-y-6 sm:space-y-8 pb-36 animate-fadeIn max-w-6xl mx-auto px-2 sm:px-4 select-none">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-400 hover:text-white px-3 py-2 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-white/10 transition-all cursor-pointer group shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Discovery</span>
        </button>

        <button
          onClick={() => loadTracks(true)}
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white px-3.5 py-2 rounded-2xl bg-neutral-900/70 hover:bg-neutral-900 border border-white/10 transition-all cursor-pointer disabled:opacity-50"
          title="Refresh and discover new tracks"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          <span className="hidden sm:inline">{isRefreshing ? 'Discovering...' : 'Refresh Tracks'}</span>
        </button>
      </div>

      {/* Hero Banner with Dynamic Gradient Background */}
      <div 
        className="relative overflow-hidden rounded-3xl border border-white/15 p-6 sm:p-10 shadow-2xl transition-all"
        style={{
          backgroundColor: `${moodDef.color}15`,
          backgroundImage: `radial-gradient(circle at 10% 20%, ${moodDef.color}35 0%, transparent 60%)`,
        }}
      >
        {/* Subtle blur backdrop image */}
        <div 
          className="absolute -right-10 -bottom-10 w-96 h-96 rounded-full bg-cover bg-center opacity-25 filter blur-3xl pointer-events-none"
          style={{ backgroundImage: `url(${moodDef.coverUrl})` }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Mood Icon Badge */}
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-white shadow-xl shrink-0 border border-white/20"
              style={{ 
                backgroundColor: moodDef.color,
                boxShadow: `0 10px 30px ${moodDef.color}50`
              }}
            >
              {renderIcon()}
            </div>

            {/* Title & Description */}
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/15">
                  Dynamic Mood Station
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  {tracks.length} tracks discovered
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {moodDef.title}
              </h1>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {moodDef.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {moodDef.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-neutral-900/80 text-neutral-300 border border-white/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto pt-2 md:pt-0">
            <button
              onClick={() => tracks.length > 0 && onPlayAll(tracks)}
              disabled={tracks.length === 0}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-black shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: seedColor }}
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Play All</span>
            </button>

            <button
              onClick={() => tracks.length > 0 && onShuffleAll(tracks)}
              disabled={tracks.length === 0}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-white/10 hover:bg-white/20 border border-white/15 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error state with retry */}
      {error && (
        <div className="p-6 rounded-3xl bg-red-950/40 border border-red-500/30 text-center space-y-3">
          <p className="text-xs sm:text-sm text-red-200">{error}</p>
          <button
            onClick={() => loadTracks(true)}
            className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold transition-all cursor-pointer"
          >
            Retry Discovery
          </button>
        </div>
      )}

      {/* Tracks Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Music2 className="w-4 h-4 text-cyan-400" />
            <span>Discovered Songs ({visibleTracks.length} of {tracks.length})</span>
          </h2>
          <span className="text-[11px] text-neutral-400 font-medium">
            Click any song to start instant playback
          </span>
        </div>

        {/* Loading Skeletons */}
        {isLoading && tracks.length === 0 ? (
          <div className="space-y-2.5">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl bg-neutral-900/50 border border-white/5 flex items-center justify-between gap-4 animate-pulse"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-5 text-center text-xs text-neutral-600 font-bold">{idx + 1}</div>
                  <div className="w-12 h-12 rounded-xl bg-neutral-800 shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="h-3.5 bg-neutral-800 rounded w-2/5" />
                    <div className="h-2.5 bg-neutral-800/60 rounded w-1/4" />
                  </div>
                </div>
                <div className="w-12 h-3 bg-neutral-800 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {visibleTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isFav = favoriteTrackIds.has(track.id);

              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => onPlayTrack(track, tracks)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                    isCurrent
                      ? 'bg-white/10 border-white/30 shadow-lg'
                      : 'bg-neutral-900/60 hover:bg-neutral-900 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Index / Play indicator */}
                    <div className="w-5 text-center flex items-center justify-center shrink-0">
                      {isCurrent && isPlaying ? (
                        <div className="flex items-end justify-center gap-0.5 h-3.5 w-3.5">
                          <span className="w-1 h-3.5 bg-[#FF5252] animate-bounce" />
                          <span className="w-1 h-2 bg-[#FF5252] animate-bounce delay-75" />
                          <span className="w-1 h-3 bg-[#FF5252] animate-bounce delay-150" />
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-neutral-400 group-hover:hidden">
                          {idx + 1}
                        </span>
                      )}
                      <Play className="w-3.5 h-3.5 text-white hidden group-hover:block shrink-0 fill-white" />
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-800 shrink-0 shadow-md">
                      <img 
                        src={track.thumbnail} 
                        alt={track.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        loading="lazy"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs sm:text-sm font-bold truncate leading-snug ${
                        isCurrent ? 'text-white' : 'text-neutral-100 group-hover:text-[#FF5252]'
                      }`}>
                        {track.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Duration */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {onToggleFavorite && (
                      <button
                        onClick={() => onToggleFavorite(track)}
                        className={`p-2 rounded-xl hover:bg-white/10 transition-colors ${
                          isFav ? 'text-rose-500' : 'text-neutral-400 hover:text-white'
                        }`}
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                      </button>
                    )}

                    {onAddToPlaylist && (
                      <button
                        onClick={() => onAddToPlaylist(track)}
                        className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                        title="Add to custom playlist"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}

                    <div className="text-[11px] font-medium text-neutral-400 w-10 text-right pr-1">
                      {formatDuration(track.duration)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {tracks.length > displayLimit && (
          <div className="text-center pt-4">
            <button
              onClick={() => setDisplayLimit((prev) => prev + 15)}
              className="px-6 py-2.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-900 border border-white/15 text-xs font-bold text-white transition-all hover:scale-105 cursor-pointer shadow-md"
            >
              Load More Discovered Tracks ({tracks.length - displayLimit} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
