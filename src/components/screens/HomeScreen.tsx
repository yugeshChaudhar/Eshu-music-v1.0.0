import React, { useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Shuffle, 
  Heart, 
  Sparkles, 
  Flame, 
  Radio, 
  ChevronRight, 
  Compass, 
  Headphones,
  Coffee,
  Zap,
  Brain,
  Moon,
  Disc3,
  FolderHeart,
  FolderPlus,
  Plus,
  Youtube,
  Music,
  ListMusic
} from 'lucide-react';
import { Track, Playlist, Artist, MoodCategory, TabType, YouTubeUserProfile } from '../../types';
import { 
  ECHO_TOP_ARTISTS 
} from '../../data/echoMusicData';
import { MOOD_DEFINITIONS, getMoodCategory } from '../../services/moodDiscoveryService';
import { getDynamicQuickPicks } from '../../services/recommendationService';
import { useScreenSize } from '../../hooks/useScreenSize';

interface HomeScreenProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, queue?: Track[]) => void;
  onPlayAll: (tracks: Track[]) => void;
  onShuffleAll: (tracks: Track[]) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
  onSelectArtist: (artist: Artist) => void;
  onSelectMood: (mood: MoodCategory) => void;
  onTabChange: (tab: TabType) => void;
  customPlaylists: Playlist[];
  onCreatePlaylist: () => void;
  favoriteTrackIds: Set<string>;
  onToggleFavorite: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  history?: { track: Track; timestamp: number }[];
  favoriteTracks?: Track[];
  youtubeUser?: YouTubeUserProfile | null;
  onOpenYouTubeAuth?: () => void;
  seedColor?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentTrack,
  isPlaying,
  onPlayTrack,
  onPlayAll,
  onShuffleAll,
  onSelectPlaylist,
  onSelectArtist,
  onSelectMood,
  onTabChange,
  customPlaylists,
  onCreatePlaylist,
  favoriteTrackIds,
  onToggleFavorite,
  onAddToPlaylist,
  history = [],
  favoriteTracks = [],
  youtubeUser = null,
  onOpenYouTubeAuth,
  seedColor = '#FF5252',
}) => {
  const screenSize = useScreenSize();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Compute dynamic Quick Picks based on what user is currently playing, history & favorites
  const dynamicPicks = useMemo(() => {
    return getDynamicQuickPicks({
      currentTrack,
      history,
      favorites: favoriteTracks,
      customPlaylists,
    });
  }, [currentTrack?.id, history.length, favoriteTracks.length, customPlaylists.length]);

  return (
    <div className="space-y-8 sm:space-y-10 pb-36 animate-fadeIn max-w-7xl mx-auto px-1 sm:px-0">
      {/* 1. Top Hero / Greeting Section */}
      <section className="relative overflow-hidden rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-white/10 shadow-2xl">
        <div 
          className="absolute -right-24 -top-24 w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none transition-colors"
          style={{ backgroundColor: seedColor }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] sm:text-xs font-bold text-neutral-200 mb-2 sm:mb-3">
              <Sparkles className="w-3.5 h-3.5" style={{ color: seedColor }} />
              <span>Eshu Music Experience</span>
            </div>

            <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              {getGreeting()}{youtubeUser ? `, ${youtubeUser.name.split(' ')[0]}` : ', Listener'}
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
              {currentTrack 
                ? `Currently tuning to "${currentTrack.title}" by ${currentTrack.artist}. Continuous background play is enabled.`
                : 'Stream millions of tracks ad-free with dynamic AutoEq acoustic tuning, synced lyrics, and continuous background play.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <button
              onClick={() => onPlayAll(dynamicPicks.tracks)}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm text-black transition-all active:scale-95 shadow-xl hover:brightness-110"
              style={{ backgroundColor: seedColor }}
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Play All Picks</span>
            </button>

            <button
              onClick={() => onShuffleAll(dynamicPicks.tracks)}
              className="flex items-center gap-2 px-4 py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs sm:text-sm font-bold text-white transition-all active:scale-95"
            >
              <Shuffle className="w-4 h-4 text-neutral-300" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Dynamic Quick Picks (Changes according to what user is listening to) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5" style={{ color: seedColor }} />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>{dynamicPicks.headline}</span>
                {currentTrack && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 font-semibold border border-white/10 hidden sm:inline-block">
                    Live Adaptive
                  </span>
                )}
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {dynamicPicks.subheadline}
            </p>
          </div>

          <button
            onClick={() => onPlayAll(dynamicPicks.tracks)}
            className="text-xs font-bold text-neutral-400 hover:text-white transition-colors flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Play all picks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {dynamicPicks.tracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            const isFav = favoriteTrackIds.has(track.id);

            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track, dynamicPicks.tracks)}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                  isCurrent 
                    ? 'bg-neutral-900 border-white/30 ring-1 ring-[#FF5252]' 
                    : 'bg-neutral-900/60 border-white/10 hover:bg-neutral-900 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0 shadow-md">
                    <img 
                      src={track.thumbnail} 
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
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
                    <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-[#FF5252]' : 'text-white'}`}>
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {onAddToPlaylist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToPlaylist(track);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                      title="Add to Playlist"
                    >
                      <FolderPlus className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(track);
                    }}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                  >
                    <Heart 
                      className={`w-4 h-4 transition-transform active:scale-125 ${
                        isFav ? 'fill-[#FF4081] text-[#FF4081]' : 'text-neutral-400'
                      }`} 
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Your Playlists (Replaces Top Charts and Curated Playlists) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Your Playlists
              </h2>
              <p className="text-xs text-neutral-400 hidden sm:block">
                All your custom mixes and synced YouTube collections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCreatePlaylist}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>

            <button
              onClick={() => onTabChange('library')}
              className="text-xs font-bold text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {customPlaylists.length === 0 ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/60 border border-dashed border-white/15 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neutral-400">
              <ListMusic className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                No Playlists Yet
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Create custom song collections or connect your YouTube account to automatically import all your personal playlists.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              <button
                onClick={onCreatePlaylist}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs text-black"
                style={{ backgroundColor: seedColor }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Playlist</span>
              </button>

              {onOpenYouTubeAuth && (
                <button
                  onClick={onOpenYouTubeAuth}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs border border-white/10"
                >
                  <Youtube className="w-3.5 h-3.5 text-[#FF0000] fill-[#FF0000]" />
                  <span>Import from YouTube</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {customPlaylists.map((pl) => {
              const isYouTube = pl.isYouTubePlaylist || pl.id.startsWith('yt-pl-');
              return (
                <div
                  key={pl.id}
                  onClick={() => onSelectPlaylist(pl)}
                  className="p-3 sm:p-4 rounded-3xl bg-neutral-900/70 border border-white/10 hover:border-white/25 hover:bg-neutral-900 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-neutral-800 shadow-md">
                      <img 
                        src={pl.thumbnail} 
                        alt={pl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80';
                        }}
                      />

                      {/* YouTube Tag Badge */}
                      {isYouTube && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#FF0000]/90 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1 shadow-sm">
                          <Youtube className="w-2.5 h-2.5 fill-white text-white" />
                          <span>YouTube</span>
                        </div>
                      )}

                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-white">
                        {pl.trackCount || (pl.tracks ? pl.tracks.length : 0)} Songs
                      </span>

                      {/* Hover / Touch Quick Play Button */}
                      {pl.tracks && pl.tracks.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (pl.tracks && pl.tracks.length > 0) {
                              onPlayTrack(pl.tracks[0], pl.tracks);
                            }
                          }}
                          className="absolute bottom-2 left-2 w-9 h-9 rounded-xl flex items-center justify-center text-black shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                          style={{ backgroundColor: seedColor }}
                          title="Play Playlist"
                        >
                          <Play className="w-4 h-4 fill-black ml-0.5" />
                        </button>
                      )}
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#FF5252] transition-colors">
                      {pl.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                      {pl.description || `${pl.trackCount || (pl.tracks ? pl.tracks.length : 0)} tracks`}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Quick Add Playlist Card */}
            <div
              onClick={onCreatePlaylist}
              className="p-3 sm:p-4 rounded-3xl bg-neutral-900/40 border border-dashed border-white/15 hover:border-white/30 hover:bg-neutral-900/70 transition-all cursor-pointer flex flex-col items-center justify-center text-center aspect-square"
            >
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2 shadow-sm"
                style={{ backgroundColor: seedColor + '25', color: seedColor }}
              >
                <Plus className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-white">New Playlist</h4>
              <p className="text-[10px] text-neutral-400">Create custom collection</p>
            </div>
          </div>
        )}
      </section>

      {/* 4. Moods & Moments */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Moods & Moments</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 hidden sm:inline-block">
                  Live Discovery
                </span>
              </h2>
            </div>
          </div>
          <span className="text-xs text-neutral-400 font-medium">
            Explore 6 dynamic stations
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
          {MOOD_DEFINITIONS.map((def) => {
            const moodCategory = getMoodCategory(def);
            
            const renderMoodIcon = () => {
              switch (def.iconName) {
                case 'Coffee': return <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-white" />;
                case 'Zap': return <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />;
                case 'Brain': return <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />;
                case 'Moon': return <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />;
                case 'Disc3': return <Disc3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />;
                case 'Heart': return <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />;
                default: return <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-white" />;
              }
            };

            return (
              <div
                key={def.id}
                onClick={() => onSelectMood(moodCategory)}
                className="relative overflow-hidden p-3.5 sm:p-4 rounded-3xl bg-neutral-900/80 hover:bg-neutral-900 border border-white/10 hover:border-white/25 transition-all duration-200 cursor-pointer group flex flex-col justify-between h-36 sm:h-40 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 select-none"
              >
                {/* Subtle Ambient Radial Glow on Hover */}
                <div 
                  className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-30 filter blur-xl transition-opacity pointer-events-none"
                  style={{ backgroundColor: def.color }}
                />

                <div className="flex items-center justify-between w-full relative z-10">
                  <div 
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-200 border border-white/15"
                    style={{ 
                      backgroundColor: def.color,
                      boxShadow: `0 4px 14px ${def.color}40`
                    }}
                  >
                    {renderMoodIcon()}
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-7 h-7 rounded-full bg-white/15 text-white">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="relative z-10 space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight line-clamp-1">
                    {def.title}
                  </h3>
                  <p className="text-[10px] text-neutral-400 line-clamp-1 font-medium">
                    {def.tags.slice(0, 2).join(' • ')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

