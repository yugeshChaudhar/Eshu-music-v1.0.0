import React, { useState } from 'react';
import { 
  Radio, 
  Play, 
  Pause, 
  Clock, 
  Share2, 
  Sparkles, 
  RotateCcw, 
  RotateCw,
  Search,
  ExternalLink,
  Headphones
} from 'lucide-react';
import { Track, PodcastShow, PodcastEpisode } from '../../types';
import { ECHO_PODCASTS } from '../../data/echoMusicData';

interface PodcastsScreenProps {
  currentPlayingTrackId?: string;
  isPlaying?: boolean;
  onPlayEpisode: (track: Track) => void;
  seedColor?: string;
}

export const PodcastsScreen: React.FC<PodcastsScreenProps> = ({
  currentPlayingTrackId,
  isPlaying,
  onPlayEpisode,
  seedColor = '#FF5252',
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedShow, setSelectedShow] = useState<PodcastShow | null>(null);

  const genres = ['All', 'Technology', 'Science & Health', 'Philosophy & AI', 'Stories & Relax'];

  const filteredShows = ECHO_PODCASTS.filter((show) => {
    const matchesGenre = selectedGenre === 'All' || show.genre.toLowerCase() === selectedGenre.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      show.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      show.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const handlePlayPodcastEpisode = (ep: PodcastEpisode, show: PodcastShow) => {
    const track: Track = {
      id: ep.videoId,
      title: ep.title,
      artist: show.title,
      album: show.author,
      duration: ep.duration,
      thumbnail: ep.thumbnail,
      category: 'Podcast',
    };
    onPlayEpisode(track);
  };

  const formatPodcastDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours} hr ${mins} min`;
    return `${mins} min`;
  };

  return (
    <div className="space-y-8 pb-32 animate-fadeIn max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-white/10 shadow-2xl">
        <div 
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ backgroundColor: seedColor }}
        />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-neutral-200 mb-3">
            <Radio className="w-3.5 h-3.5" style={{ color: seedColor }} />
            <span>Echo Podcasts & Shows</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Explore Audio Podcasts
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6">
            Stream high-definition tech talks, deep science, stories and philosophy channels powered by YouTube audio.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search podcasts, hosts, topics..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-800/90 border border-white/15 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-white/40 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Genre Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {genres.map((genre) => {
          const isSelected = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'text-black border-transparent shadow-lg scale-105'
                  : 'bg-neutral-900/80 text-neutral-300 border-white/10 hover:bg-neutral-800 hover:text-white'
              }`}
              style={{
                backgroundColor: isSelected ? seedColor : undefined,
              }}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Shows Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Headphones className="w-5 h-5 text-neutral-400" />
            <span>Featured Audio Shows</span>
          </h2>
          <span className="text-xs text-neutral-400 font-medium">
            {filteredShows.length} Shows available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredShows.map((show) => (
            <div
              key={show.id}
              onClick={() => setSelectedShow(selectedShow?.id === show.id ? null : show)}
              className={`p-4 rounded-3xl bg-neutral-900/70 border transition-all cursor-pointer group hover:bg-neutral-900 hover:border-white/20 ${
                selectedShow?.id === show.id ? 'border-white/30 ring-1 ring-white/20' : 'border-white/10'
              }`}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-neutral-800 shadow-md">
                <img 
                  src={show.thumbnail} 
                  alt={show.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white">
                  {show.genre}
                </span>
              </div>

              <h3 className="font-bold text-sm text-white truncate group-hover:text-[#FF5252] transition-colors">
                {show.title}
              </h3>
              <p className="text-xs text-neutral-400 truncate mb-1">
                {show.author}
              </p>
              <p className="text-[11px] text-neutral-400 line-clamp-2 leading-snug">
                {show.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Selected Show Episodes or Top Recent Episodes */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          {selectedShow ? `Episodes in ${selectedShow.title}` : 'Popular Podcast Episodes'}
        </h2>

        <div className="space-y-3">
          {(selectedShow ? selectedShow.episodes : ECHO_PODCASTS.flatMap((s) => s.episodes)).map((ep) => {
            const parentShow = selectedShow || ECHO_PODCASTS.find((s) => s.episodes.some((e) => e.id === ep.id));
            const isCurrentPlaying = currentPlayingTrackId === ep.videoId;

            return (
              <div
                key={ep.id}
                className={`p-4 rounded-3xl bg-neutral-900/80 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                  isCurrentPlaying 
                    ? 'border-white/30 bg-neutral-900 ring-1 ring-[#FF5252]' 
                    : 'border-white/10 hover:border-white/20 hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-neutral-800 flex-shrink-0 shadow-md">
                    <img 
                      src={ep.thumbnail} 
                      alt={ep.title}
                      className="w-full h-full object-cover" 
                    />
                    <button
                      onClick={() => parentShow && handlePlayPodcastEpisode(ep, parentShow)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isCurrentPlaying && isPlaying ? (
                        <Pause className="w-6 h-6 fill-white" />
                      ) : (
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                        {ep.showTitle}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {ep.publishedAt}
                      </span>
                    </div>

                    <h4 className={`text-sm font-bold truncate ${isCurrentPlaying ? 'text-[#FF5252]' : 'text-white'}`}>
                      {ep.title}
                    </h4>
                    <p className="text-xs text-neutral-400 line-clamp-1">
                      {ep.description}
                    </p>
                  </div>
                </div>

                {/* Duration & Play Action */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <span className="text-xs text-neutral-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{formatPodcastDuration(ep.duration)}</span>
                  </span>

                  <button
                    onClick={() => parentShow && handlePlayPodcastEpisode(ep, parentShow)}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs text-black transition-all active:scale-95 shadow-md"
                    style={{ backgroundColor: seedColor }}
                  >
                    {isCurrentPlaying && isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-black" />
                        <span>Playing</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                        <span>Stream Episode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
