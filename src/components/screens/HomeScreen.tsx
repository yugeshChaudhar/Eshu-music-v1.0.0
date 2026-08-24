import React from 'react';
import { 
  Play, 
  Pause, 
  Shuffle, 
  Heart, 
  Sparkles, 
  Globe, 
  Flame, 
  Radio, 
  Layers, 
  ChevronRight, 
  Check, 
  TrendingUp, 
  Compass, 
  Headphones 
} from 'lucide-react';
import { Track, Playlist, Artist, MoodCategory, TabType } from '../../types';
import { 
  ECHO_QUICK_PICKS, 
  COUNTRY_CHARTS, 
  ECHO_MOODS_AND_GENRES, 
  ECHO_TOP_ARTISTS, 
  ECHO_CURATED_PLAYLISTS,
  ECHO_PODCASTS 
} from '../../data/echoMusicData';

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
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
  favoriteTrackIds: Set<string>;
  onToggleFavorite: (track: Track) => void;
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
  selectedCountry,
  onSelectCountry,
  favoriteTrackIds,
  onToggleFavorite,
  seedColor = '#FF5252',
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const activeChart = COUNTRY_CHARTS[selectedCountry] || COUNTRY_CHARTS.GLOBAL;

  return (
    <div className="space-y-10 pb-36 animate-fadeIn max-w-7xl mx-auto">
      {/* 1. Top Hero / Greeting Section */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-white/10 shadow-2xl">
        <div 
          className="absolute -right-24 -top-24 w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none transition-colors"
          style={{ backgroundColor: seedColor }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-neutral-200 mb-3">
              <Sparkles className="w-3.5 h-3.5" style={{ color: seedColor }} />
              <span>Eshu Music Experience</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              {getGreeting()}, Listener
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
              Stream millions of songs ad-free with dynamic AutoEq acoustic tuning, synced lyrics, and SponsorBlock auto-skips.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => onPlayAll(ECHO_QUICK_PICKS)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm text-black transition-all active:scale-95 shadow-xl hover:brightness-110"
              style={{ backgroundColor: seedColor }}
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Play All</span>
            </button>

            <button
              onClick={() => onShuffleAll(ECHO_QUICK_PICKS)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs sm:text-sm font-bold text-white transition-all active:scale-95"
            >
              <Shuffle className="w-4 h-4 text-neutral-300" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Quick Picks (Song Grid) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FF5252]" style={{ color: seedColor }} />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Quick Picks
            </h2>
          </div>
          <button
            onClick={() => onPlayAll(ECHO_QUICK_PICKS)}
            className="text-xs font-bold text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Play all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ECHO_QUICK_PICKS.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            const isFav = favoriteTrackIds.has(track.id);

            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track, ECHO_QUICK_PICKS)}
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

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(track);
                  }}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <Heart 
                    className={`w-4 h-4 transition-transform active:scale-125 ${
                      isFav ? 'fill-[#FF4081] text-[#FF4081]' : 'text-neutral-400'
                    }`} 
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Country Charts Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Top Charts
            </h2>
            <span className="text-xs text-neutral-400 font-normal">
              ({activeChart.name})
            </span>
          </div>

          {/* Country Pill Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {Object.entries(COUNTRY_CHARTS).map(([key, data]) => {
              const isSelected = selectedCountry === key;
              return (
                <button
                  key={key}
                  onClick={() => onSelectCountry(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-white/15 text-white border-white/30 shadow-sm'
                      : 'bg-neutral-900 text-neutral-400 border-white/10 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <span className="mr-1">{data.flag}</span>
                  <span>{key}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeChart.tracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track, activeChart.tracks)}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer group ${
                  isCurrent 
                    ? 'bg-neutral-900 border-white/30 ring-1 ring-[#FF5252]' 
                    : 'bg-neutral-900/60 border-white/10 hover:bg-neutral-900 hover:border-white/20'
                }`}
              >
                <span className="w-5 text-center font-bold text-xs text-neutral-400 group-hover:text-white">
                  #{idx + 1}
                </span>

                <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0">
                  <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-[#FF5252]' : 'text-white'}`}>
                    {track.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {track.artist}
                  </p>
                </div>

                <span className="text-[10px] text-neutral-400 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                  {track.views || 'HQ'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Moods & Moments */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Moods & Moments
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ECHO_MOODS_AND_GENRES.map((mood) => (
            <div
              key={mood.id}
              onClick={() => onSelectMood(mood)}
              className="p-4 rounded-3xl bg-neutral-900/70 border border-white/10 hover:border-white/25 hover:bg-neutral-900 transition-all cursor-pointer group flex flex-col justify-between h-36"
            >
              <div 
                className="w-8 h-8 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform"
                style={{ backgroundColor: mood.color }}
              >
                <Headphones className="w-4 h-4" />
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#FF5252] transition-colors leading-tight mb-1">
                  {mood.title}
                </h3>
                <p className="text-[10px] text-neutral-400 line-clamp-1">
                  {mood.tags.join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Top Artists */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Featured Artists
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {ECHO_TOP_ARTISTS.map((artist) => (
            <div
              key={artist.id}
              onClick={() => onSelectArtist(artist)}
              className="p-4 rounded-3xl bg-neutral-900/70 border border-white/10 hover:border-white/20 hover:bg-neutral-900 transition-all cursor-pointer group text-center flex flex-col items-center"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3 bg-neutral-800 shadow-xl ring-2 ring-white/10 group-hover:ring-white/30 transition-all">
                <img 
                  src={artist.thumbnail} 
                  alt={artist.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-full group-hover:text-[#FF5252] transition-colors">
                {artist.name}
              </h3>
              <p className="text-[10px] text-neutral-400 truncate max-w-full">
                {artist.monthlyListeners || artist.subscribers}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Curated Playlists */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Curated Playlists
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ECHO_CURATED_PLAYLISTS.map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl)}
              className="p-4 rounded-3xl bg-neutral-900/70 border border-white/10 hover:border-white/20 hover:bg-neutral-900 transition-all cursor-pointer group"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 bg-neutral-800 shadow-md">
                <img 
                  src={pl.thumbnail} 
                  alt={pl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white">
                  {pl.trackCount} Tracks
                </span>
              </div>

              <h3 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#FF5252] transition-colors">
                {pl.title}
              </h3>
              <p className="text-[11px] text-neutral-400 line-clamp-1">
                {pl.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
