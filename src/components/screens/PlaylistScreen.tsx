import React from 'react';
import { Playlist, Track } from '../../types';
import { 
  Play, 
  Shuffle, 
  Heart, 
  ArrowLeft, 
  Trash2, 
  ListPlus, 
  Music2, 
  Share2, 
  Clock 
} from 'lucide-react';

interface PlaylistScreenProps {
  playlist: Playlist;
  currentPlayingTrackId?: string;
  onBack: () => void;
  onPlayTrack: (track: Track, fromList?: Track[]) => void;
  onPlayAll: () => void;
  onShuffleAll: () => void;
  onRemoveTrackFromPlaylist?: (trackId: string) => void;
  onToggleFavorite: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
  onAddToQueue: (track: Track) => void;
}

export const PlaylistScreen: React.FC<PlaylistScreenProps> = ({
  playlist,
  currentPlayingTrackId,
  onBack,
  onPlayTrack,
  onPlayAll,
  onShuffleAll,
  onRemoveTrackFromPlaylist,
  onToggleFavorite,
  isFavorite,
  onAddToQueue,
}) => {
  const formatTotalTime = (tracks: Track[]) => {
    const totalSecs = tracks.reduce((acc, t) => acc + (t.duration || 180), 0);
    const mins = Math.floor(totalSecs / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs} hr ${mins % 60} min`;
    return `${mins} min`;
  };

  const formatDuration = (secs?: number) => {
    if (!secs) return '3:45';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

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

      {/* Playlist Hero */}
      <div className="rounded-3xl overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-900/90 to-neutral-950 border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 shadow-2xl">
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden bg-neutral-800 shrink-0 shadow-2xl border border-white/10">
          {playlist.thumbnail ? (
            <img src={playlist.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-600">
              <Music2 className="w-16 h-16" />
            </div>
          )}
        </div>

        <div className="text-center sm:text-left flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8ECAE6]">
            Playlist
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
            {playlist.title}
          </h1>
          {playlist.description && (
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              {playlist.description}
            </p>
          )}

          <p className="text-xs text-neutral-300 font-medium mt-2">
            Created by <span className="text-white font-bold">{playlist.author || 'You'}</span> • {playlist.tracks.length} Songs, {formatTotalTime(playlist.tracks)}
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-3 mt-5">
            <button
              onClick={onPlayAll}
              disabled={playlist.tracks.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8ECAE6] hover:bg-[#72b8d8] text-black font-bold text-sm shadow-xl shadow-[#8ECAE6]/20 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Play</span>
            </button>

            <button
              onClick={onShuffleAll}
              disabled={playlist.tracks.length === 0}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tracklist Table */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-white/[0.08]">
          <span className="w-8">#</span>
          <span className="flex-1">Title</span>
          <span className="w-16 text-right flex items-center justify-end gap-1">
            <Clock className="w-3.5 h-3.5" />
          </span>
        </div>

        {playlist.tracks.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 border border-dashed border-white/10 rounded-2xl">
            <Music2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">This playlist has no songs yet.</p>
            <p className="text-xs text-neutral-400 mt-1">Use Search to find songs and add them here!</p>
          </div>
        ) : (
          playlist.tracks.map((track, idx) => {
            const isCurrent = track.id === currentPlayingTrackId;
            return (
              <div
                key={`${track.id}-${idx}`}
                onClick={() => onPlayTrack(track, playlist.tracks)}
                className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#8ECAE6]/15 border-[#8ECAE6]/40 shadow-md'
                    : 'bg-neutral-900/40 hover:bg-neutral-800/80 border-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <span className="w-6 text-center text-xs font-bold text-neutral-500">
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
                      {track.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
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

                  {onRemoveTrackFromPlaylist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTrackFromPlaylist(track.id);
                      }}
                      className="p-2 rounded-full text-neutral-500 hover:text-red-400"
                      title="Remove from this playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <span className="text-xs text-neutral-400 font-mono w-12 text-right">
                    {formatDuration(track.duration)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
