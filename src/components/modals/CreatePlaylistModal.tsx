import React, { useState } from 'react';
import { X, Plus, Music2 } from 'lucide-react';
import { Playlist } from '../../types';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlaylist: (playlist: Playlist) => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  onCreatePlaylist,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newPlaylist: Playlist = {
      id: `custom-pl-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      thumbnail: thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      trackCount: 0,
      tracks: [],
      author: 'You',
    };

    onCreatePlaylist(newPlaylist);
    setTitle('');
    setDescription('');
    setThumbnailUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-neutral-900 border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Music2 className="w-5 h-5 text-[#8ECAE6]" />
            <span>Create New Playlist</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
              Playlist Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chill Synthwave, Workout Vibes"
              className="w-full bg-neutral-800 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8ECAE6]"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your mix..."
              className="w-full bg-neutral-800 border border-white/10 rounded-2xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#8ECAE6]"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
              Cover Image URL (Optional)
            </label>
            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-neutral-800 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#8ECAE6]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 py-2.5 rounded-xl bg-[#8ECAE6] hover:bg-[#72b8d8] text-black font-bold text-xs shadow-lg shadow-[#8ECAE6]/20 transition-transform active:scale-95 disabled:opacity-50"
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
