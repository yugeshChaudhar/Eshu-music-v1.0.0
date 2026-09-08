import React, { useState } from 'react';
import { Playlist, Track } from '../../types';
import { 
  Play, 
  Shuffle, 
  Heart, 
  ArrowLeft, 
  Trash2, 
  ListPlus, 
  Music2, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface PlaylistScreenProps {
  playlist: Playlist;
  currentPlayingTrackId?: string;
  seedColor?: string;
  onBack: () => void;
  onPlayTrack: (track: Track, fromList?: Track[]) => void;
  onPlayAll: () => void;
  onShuffleAll: () => void;
  onRemoveTrackFromPlaylist?: (trackId: string, trackIndex?: number) => void;
  onDeletePlaylist?: (playlistId: string) => void;
  onToggleFavorite: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
  onAddToQueue: (track: Track) => void;
}

export const PlaylistScreen: React.FC<PlaylistScreenProps> = ({
  playlist,
  currentPlayingTrackId,
  seedColor = '#8ECAE6',
  onBack,
  onPlayTrack,
  onPlayAll,
  onShuffleAll,
  onRemoveTrackFromPlaylist,
  onDeletePlaylist,
  onToggleFavorite,
  isFavorite,
  onAddToQueue,
}) => {
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [trackToDelete, setTrackToDelete] = useState<{ id: string; index: number; title: string } | null>(null);

  const playlistTracks = Array.isArray(playlist?.tracks) ? playlist.tracks : [];

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const formatTotalTime = (tracks: Track[]) => {
    const totalSecs = (tracks || []).reduce((acc, t) => acc + (t.duration || 180), 0);
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

  const handleConfirmDeleteSong = () => {
    if (!trackToDelete || !onRemoveTrackFromPlaylist) return;
    onRemoveTrackFromPlaylist(trackToDelete.id, trackToDelete.index);
    showToast(`Removed "${trackToDelete.title}" from playlist`, 'info');
    setTrackToDelete(null);
  };

  return (
    <div className="space-y-8 pb-36 max-w-6xl mx-auto animate-fadeIn select-none relative">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-neutral-900/95 border border-white/20 shadow-2xl backdrop-blur-xl text-white text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal for Track */}
      {trackToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-900 border border-white/15 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete song from playlist?</h3>
                <p className="text-xs text-neutral-400">This will remove the song from "{playlist?.title}".</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-800/60 border border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center text-neutral-400 text-xs font-bold">
                {trackToDelete.index + 1}
              </div>
              <p className="text-sm font-semibold text-white truncate flex-1">
                {trackToDelete.title}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setTrackToDelete(null)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteSong}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all flex items-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Song</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Back Navigation Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {onDeletePlaylist && (
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete the entire playlist "${playlist?.title}"?`)) {
                onDeletePlaylist(playlist.id);
                onBack();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete entire playlist"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Playlist</span>
          </button>
        )}
      </div>

      {/* Playlist Hero */}
      <div className="rounded-3xl overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-900/90 to-neutral-950 border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 shadow-2xl">
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden bg-neutral-800 shrink-0 shadow-2xl border border-white/10">
          {playlist?.thumbnail ? (
            <img 
              src={playlist.thumbnail} 
              alt={playlist?.title} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-600">
              <Music2 className="w-16 h-16" />
            </div>
          )}
        </div>

        <div className="text-center sm:text-left flex-1 min-w-0">
          <span 
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: seedColor }}
          >
            Playlist
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1 truncate">
            {playlist?.title || 'Untitled Playlist'}
          </h1>
          {playlist?.description && (
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl line-clamp-2">
              {playlist.description}
            </p>
          )}

          <p className="text-xs text-neutral-300 font-medium mt-2">
            Created by <span className="text-white font-bold">{playlist?.author || 'You'}</span> • {playlistTracks.length} {playlistTracks.length === 1 ? 'Song' : 'Songs'}, {formatTotalTime(playlistTracks)}
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-3 mt-5 flex-wrap">
            <button
              onClick={onPlayAll}
              disabled={playlistTracks.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm text-black shadow-xl transition-transform active:scale-95 disabled:opacity-40"
              style={{ backgroundColor: seedColor }}
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Play All</span>
            </button>

            <button
              onClick={onShuffleAll}
              disabled={playlistTracks.length === 0}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-40"
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tracklist Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-white/[0.08]">
          <span className="w-8">#</span>
          <span className="flex-1">Title</span>
          <span className="w-24 text-right flex items-center justify-end gap-1">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>Actions</span>
          </span>
        </div>

        {playlistTracks.length === 0 ? (
          <div className="py-16 px-4 text-center text-neutral-400 border border-dashed border-white/10 rounded-3xl bg-neutral-900/30 space-y-2">
            <Music2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-neutral-400" />
            <h3 className="text-sm font-bold text-white">This playlist has no songs</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Use the Search tab or Quick Picks on Home to discover tracks and add them to this playlist!
            </p>
          </div>
        ) : (
          playlistTracks.map((track, idx) => {
            const isCurrent = track.id === currentPlayingTrackId;
            return (
              <div
                key={`${track.id}-${idx}`}
                onClick={() => onPlayTrack(track, playlistTracks)}
                className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-white/10 border-white/25 shadow-lg'
                    : 'bg-neutral-900/40 hover:bg-neutral-800/80 border-white/[0.06] hover:border-white/15'
                }`}
              >
                {/* Track numbering & thumbnail & title */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <span className="w-6 text-center text-xs font-bold text-neutral-500 group-hover:text-neutral-300">
                    {idx + 1}
                  </span>

                  <img 
                    src={track.thumbnail} 
                    alt={track.title} 
                    className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-md" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800';
                    }}
                  />

                  <div className="min-w-0 flex-1 pr-2">
                    <h4 
                      className={`text-sm font-bold truncate transition-colors ${
                        isCurrent ? 'text-white' : 'text-white group-hover:text-[#FF5252]'
                      }`}
                    >
                      {track.title}
                    </h4>
                    <p className="text-xs text-neutral-400 truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>

                {/* Actions & duration */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Add to Queue */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToQueue(track);
                      showToast(`Added "${track.title}" to queue`);
                    }}
                    className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Add to queue"
                  >
                    <ListPlus className="w-4 h-4" />
                  </button>

                  {/* Favorite Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(track);
                    }}
                    className="p-2 rounded-xl text-neutral-400 hover:text-[#FF4081] hover:bg-white/10 transition-colors"
                    title={isFavorite(track.id) ? 'Remove from Liked' : 'Save to Liked'}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(track.id) ? 'fill-[#FF4081] text-[#FF4081]' : ''}`} />
                  </button>

                  {/* DELETE OPTION: Delete Song from Playlist */}
                  {onRemoveTrackFromPlaylist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTrackToDelete({ id: track.id, index: idx, title: track.title });
                      }}
                      className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/15 transition-all group/del"
                      title="Delete song from playlist"
                      aria-label={`Delete ${track.title} from playlist`}
                    >
                      <Trash2 className="w-4 h-4 transition-transform group-hover/del:scale-110 text-neutral-400 group-hover/del:text-rose-400" />
                    </button>
                  )}

                  {/* Duration */}
                  <span className="text-xs text-neutral-400 font-mono w-12 text-right hidden sm:inline-block">
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
