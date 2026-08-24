import React from 'react';
import { Artist, Track } from '../../types';
import { 
  Play, 
  Shuffle, 
  Heart, 
  CheckCircle2, 
  UserPlus, 
  UserCheck, 
  ArrowLeft, 
  Disc, 
  Radio,
  Flame,
  ListPlus
} from 'lucide-react';

interface ArtistScreenProps {
  artist: Artist;
  currentPlayingTrackId?: string;
  isFollowing: boolean;
  onBack: () => void;
  onPlayTrack: (track: Track, fromList?: Track[]) => void;
  onPlayAll: () => void;
  onShuffleAll: () => void;
  onToggleFollow: () => void;
  onToggleFavorite: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
  onAddToQueue: (track: Track) => void;
}

export const ArtistScreen: React.FC<ArtistScreenProps> = ({
  artist,
  currentPlayingTrackId,
  isFollowing,
  onBack,
  onPlayTrack,
  onPlayAll,
  onShuffleAll,
  onToggleFollow,
  onToggleFavorite,
  isFavorite,
  onAddToQueue,
}) => {
  return (
    <div className="space-y-8 pb-36 max-w-6xl mx-auto animate-fadeIn select-none">
      {/* Top Back Navigation Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Artist Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8 shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 blur-xl pointer-events-none"
          style={{ backgroundImage: `url(${artist.thumbnail})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent pointer-events-none" />

        <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-white/15 shadow-2xl shrink-0">
          <img src={artist.thumbnail} alt={artist.name} className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 text-center md:text-left flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#8ECAE6]/15 text-[#8ECAE6] border border-[#8ECAE6]/30">
              Verified Artist
            </span>
            {artist.verified && (
              <CheckCircle2 className="w-4 h-4 text-[#8ECAE6]" />
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            {artist.name}
          </h1>

          <p className="text-sm text-neutral-300 font-medium mt-1">
            {artist.monthlyListeners || '12.5M monthly listeners'} • {artist.subscribers || 'SimpMusic Artist'}
          </p>

          {artist.bio && (
            <p className="text-xs text-neutral-400 mt-2 max-w-xl line-clamp-2">
              {artist.bio}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center md:justify-start gap-3 mt-5">
            <button
              onClick={onPlayAll}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8ECAE6] hover:bg-[#72b8d8] text-black font-bold text-sm shadow-xl shadow-[#8ECAE6]/20 transition-transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Play All</span>
            </button>

            <button
              onClick={onShuffleAll}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={onToggleFollow}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border transition-all ${
                isFollowing
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-transparent border-[#8ECAE6] text-[#8ECAE6] hover:bg-[#8ECAE6]/10'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Follow</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Top Tracks Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#FF007F]" />
          <span>Popular Songs</span>
        </h3>

        <div className="space-y-1.5">
          {artist.topTracks.map((track, idx) => {
            const isCurrent = track.id === currentPlayingTrackId;
            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track, artist.topTracks)}
                className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#8ECAE6]/15 border-[#8ECAE6]/40 shadow-md'
                    : 'bg-neutral-900/40 hover:bg-neutral-800/80 border-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <span className="w-5 text-center text-sm font-bold text-neutral-500">
                    {idx + 1}
                  </span>

                  <img src={track.thumbnail} alt="" className="w-11 h-11 rounded-xl object-cover" />

                  <div className="min-w-0 flex-1">
                    <h4 className={`text-sm font-bold truncate ${
                      isCurrent ? 'text-[#8ECAE6]' : 'text-white group-hover:text-[#8ECAE6]'
                    }`}>
                      {track.title}
                    </h4>
                    <p className="text-xs text-neutral-400 truncate">
                      {track.album || artist.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToQueue(track);
                    }}
                    className="p-2 rounded-full text-neutral-400 hover:text-white"
                    title="Add to queue"
                  >
                    <ListPlus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(track);
                    }}
                    className="p-2 rounded-full text-neutral-400 hover:text-[#FF4081]"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(track.id) ? 'fill-[#FF4081] text-[#FF4081]' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Albums Discography Section */}
      {artist.albums.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Disc className="w-5 h-5 text-[#8ECAE6]" />
            <span>Albums & EPs</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {artist.albums.map((alb) => (
              <div
                key={alb.id}
                className="group p-3 rounded-2xl bg-neutral-900/40 hover:bg-neutral-800/80 border border-white/[0.06] cursor-pointer transition-all shadow-md"
              >
                <img src={alb.thumbnail} alt="" className="w-full aspect-square rounded-xl object-cover mb-3" />
                <h4 className="text-sm font-bold text-white truncate group-hover:text-[#8ECAE6]">
                  {alb.title}
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {alb.year} • {alb.trackCount} Tracks
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
