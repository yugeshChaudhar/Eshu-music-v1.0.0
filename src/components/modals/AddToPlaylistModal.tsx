import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Check, 
  FolderPlus, 
  ListMusic, 
  Sparkles,
  Music2
} from 'lucide-react';
import { Track, Playlist } from '../../types';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, track: Track) => boolean;
  onCreatePlaylistWithTrack: (name: string, track: Track) => void;
  seedColor?: string;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  onClose,
  track,
  playlists,
  onAddToPlaylist,
  onCreatePlaylistWithTrack,
  seedColor = '#FF5252',
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [addedPlaylistIds, setAddedPlaylistIds] = useState<Set<string>>(new Set());
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen || !track) return null;

  const handleToggleAdd = (pl: Playlist) => {
    const isAlreadyIn = pl.tracks.some((t) => t.id === track.id) || addedPlaylistIds.has(pl.id);
    if (!isAlreadyIn) {
      const success = onAddToPlaylist(pl.id, track);
      if (success) {
        setAddedPlaylistIds((prev) => new Set([...prev, pl.id]));
        setFeedbackMsg(`Added to "${pl.title}"`);
        setTimeout(() => setFeedbackMsg(null), 2500);
      }
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylistWithTrack(newPlaylistName.trim(), track);
    setFeedbackMsg(`Created "${newPlaylistName.trim()}" and added track`);
    setNewPlaylistName('');
    setShowCreateInput(false);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div 
        className="relative w-full max-w-md bg-neutral-900 border border-white/15 rounded-3xl p-6 shadow-2xl z-10 space-y-5 overflow-hidden"
        style={{ boxShadow: `0 20px 50px -15px ${seedColor}20` }}
      >
        {/* Ambient Glow */}
        <div 
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: seedColor }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-black font-bold shadow-md"
              style={{ backgroundColor: seedColor }}
            >
              <FolderPlus className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Add to Playlist</h3>
              <p className="text-xs text-neutral-400">Save to your collections</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Song Preview Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-800/80 border border-white/10 relative z-10">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-700 flex-shrink-0 shadow-md">
            <img 
              src={track.thumbnail} 
              alt={track.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800';
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white truncate">{track.title}</h4>
            <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
          </div>
        </div>

        {/* Feedback Toast */}
        {feedbackMsg && (
          <div className="px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Playlists List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar relative z-10">
          {playlists.length === 0 ? (
            <div className="text-center py-6 text-neutral-400 text-xs">
              No playlists found. Create your first playlist below!
            </div>
          ) : (
            playlists.map((pl) => {
              const isIncluded = pl.tracks.some((t) => t.id === track.id) || addedPlaylistIds.has(pl.id);
              return (
                <div
                  key={pl.id}
                  onClick={() => handleToggleAdd(pl)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isIncluded
                      ? 'bg-white/10 border-white/25 text-white'
                      : 'bg-neutral-800/40 hover:bg-neutral-800 border-white/5 hover:border-white/15 text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-700 flex-shrink-0 flex items-center justify-center">
                      {pl.thumbnail ? (
                        <img 
                          src={pl.thumbnail} 
                          alt={pl.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800';
                          }}
                        />
                      ) : (
                        <ListMusic className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold truncate">{pl.title}</h4>
                      <p className="text-[11px] text-neutral-400">
                        {pl.trackCount || pl.tracks.length} tracks
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 pl-2">
                    {isIncluded ? (
                      <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                        <Check className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="w-7 h-7 rounded-xl bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors">
                        <Plus className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Create New Playlist Inline Section */}
        <div className="relative z-10 pt-2 border-t border-white/10">
          {!showCreateInput ? (
            <button
              onClick={() => setShowCreateInput(true)}
              className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-dashed border-white/15 text-xs font-bold text-neutral-300 hover:text-white flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Playlist & Add</span>
            </button>
          ) : (
            <form onSubmit={handleCreateSubmit} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Playlist name..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/15 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-[#FF5252]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-black transition-all hover:brightness-110"
                  style={{ backgroundColor: seedColor }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateInput(false)}
                  className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-neutral-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
