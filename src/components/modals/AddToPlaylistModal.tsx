import React from 'react';
import { X, Plus, Check, Music2 } from 'lucide-react';
import { Playlist, Track } from '../../types';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  playlists: Playlist[];
  onAddTrackToPlaylist: (playlistId: string, track: Track) => void;
  onCreateNewPlaylist: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  onClose,
  track,
  playlists,
  onAddTrackToPlaylist,
  onCreateNewPlaylist,
}) => {
  if (!isOpen || !track) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-neutral-900 border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Add to Playlist</h3>
            <p className="text-xs text-neutral-400 truncate max-w-xs">{track.title}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => {
            onClose();
            onCreateNewPlaylist();
          }}
          className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#8ECAE6]/15 hover:bg-[#8ECAE6]/25 border border-[#8ECAE6]/30 text-[#8ECAE6] text-xs font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Playlist</span>
        </button>

        <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
          {playlists.length === 0 ? (
            <p className="text-xs text-neutral-500 text-center py-6">
              No playlists found. Create one above!
            </p>
          ) : (
            playlists.map((pl) => {
              const alreadyHas = pl.tracks.some((t) => t.id === track.id);
              return (
                <button
                  key={pl.id}
                  onClick={() => {
                    if (!alreadyHas) {
                      onAddTrackToPlaylist(pl.id, track);
                      onClose();
                    }
                  }}
                  disabled={alreadyHas}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                    alreadyHas
                      ? 'bg-neutral-800/40 border-white/5 opacity-60'
                      : 'bg-neutral-800/80 hover:bg-neutral-700/80 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-neutral-700 overflow-hidden shrink-0">
                      {pl.thumbnail ? (
                        <img src={pl.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <Music2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{pl.title}</h4>
                      <p className="text-[11px] text-neutral-400">{pl.trackCount} songs</p>
                    </div>
                  </div>

                  {alreadyHas ? (
                    <span className="text-[11px] font-semibold text-[#8ECAE6] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Added
                    </span>
                  ) : (
                    <Plus className="w-4 h-4 text-neutral-400" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
