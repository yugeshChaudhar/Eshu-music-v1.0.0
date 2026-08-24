import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Link, 
  Check, 
  Trash2, 
  Play, 
  ExternalLink, 
  Sparkles, 
  Radio, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { CustomPlaylist, Station } from '../types';
import { parseYouTubeUrl, saveCustomPlaylist, deleteCustomPlaylist, fetchYouTubeUrlMetadata } from '../services/youtubeService';

interface PlaylistManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customPlaylists: CustomPlaylist[];
  onPlayCustomPlaylist: (playlist: CustomPlaylist) => void;
  onPlaylistsUpdated: () => void;
}

const SAMPLE_COMMUNITY_PLAYLISTS = [
  {
    name: 'Hindi Acoustic & Desi Chill',
    url: 'https://www.youtube.com/playlist?list=PLu_A12cWl1-8h7k7pQZ99bH995bK9qHn3',
    tag: 'Desi Chill',
    desc: 'Soft acoustic Hindi songs and mellow lofi reimaginations.',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Lofi Girl - Relax / Study',
    url: 'https://www.youtube.com/playlist?list=PLofht4PTcKYnaH8w5gkDCzNboKR0srmak',
    tag: 'Lofi Study',
    desc: 'The timeless chillhop and lofi study beats.',
    coverUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
  },
  {
    name: 'Cozy Morning Coffee Jazz',
    url: 'https://www.youtube.com/playlist?list=PL3-sRm8xAzY8V19F_4Xq_E1P9hQ6KjA9y',
    tag: 'Acoustic Coffee',
    desc: 'Gentle morning acoustic guitars and warm cafe rhythm.',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Neo-Soul & Midnight Chill',
    url: 'https://www.youtube.com/playlist?list=PL6NdkXsTSxKMUSzZ46Q8O77KqN7WvQzYx',
    tag: 'Midnight Jazz',
    desc: 'Relaxing Rhodes chords, jazz beats, and mellow late-night groove.',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
  },
];

export const PlaylistManagerModal: React.FC<PlaylistManagerModalProps> = ({
  isOpen,
  onClose,
  customPlaylists,
  onPlayCustomPlaylist,
  onPlaylistsUpdated,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [tag, setTag] = useState('My Vibe');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{ id: string; type: string; title?: string } | null>(null);

  if (!isOpen) return null;

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputUrl(val);
    setErrorMsg('');
    setSuccessMsg('');

    if (val.trim()) {
      const parsed = parseYouTubeUrl(val);
      if (parsed.type !== 'invalid') {
        setPreviewData({ id: parsed.id, type: parsed.type });
        if (parsed.videoId) {
          setPreviewThumbnail(`https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`);
        }

        // Fetch oEmbed title & thumbnail
        try {
          const meta = await fetchYouTubeUrlMetadata(val);
          if (meta.title && !playlistName) {
            setPlaylistName(meta.title);
          }
          if (meta.thumbnail) {
            setPreviewThumbnail(meta.thumbnail);
          }
        } catch {}
      } else {
        setPreviewData(null);
        setPreviewThumbnail(null);
      }
    } else {
      setPreviewData(null);
      setPreviewThumbnail(null);
    }
  };

  const handleSavePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      setErrorMsg('Please enter a YouTube playlist or video URL');
      return;
    }

    const parsed = parseYouTubeUrl(inputUrl);
    if (parsed.type === 'invalid') {
      setErrorMsg('Could not detect a valid YouTube playlist or video URL. Please check the link.');
      return;
    }

    setIsVerifying(true);
    try {
      let finalCover = previewThumbnail;
      let metaTitle = '';

      try {
        const meta = await fetchYouTubeUrlMetadata(inputUrl.trim());
        if (meta.thumbnail) finalCover = meta.thumbnail;
        if (meta.title) metaTitle = meta.title;
      } catch {}

      if (!finalCover) {
        if (parsed.videoId) {
          finalCover = `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`;
        } else {
          finalCover = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80';
        }
      }

      const nameToSave = playlistName.trim() || metaTitle || (parsed.type === 'playlist' ? 'Custom YouTube Playlist' : 'Custom YouTube Stream');
      
      const newPl = saveCustomPlaylist({
        name: nameToSave,
        playlistId: parsed.listId || (parsed.type === 'playlist' ? parsed.id : undefined),
        videoId: parsed.videoId || (parsed.type === 'video' ? parsed.id : undefined),
        url: inputUrl.trim(),
        description: `Custom YouTube ${parsed.type}`,
        coverUrl: finalCover,
      });

      setSuccessMsg(`"${nameToSave}" added successfully!`);
      setInputUrl('');
      setPlaylistName('');
      setPreviewData(null);
      setPreviewThumbnail(null);
      onPlaylistsUpdated();

      // Automatically play the newly added playlist
      setTimeout(() => {
        onPlayCustomPlaylist(newPl);
        onClose();
      }, 600);
    } catch (err) {
      setErrorMsg('Failed to save playlist. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCustomPlaylist(id);
    onPlaylistsUpdated();
  };

  const handleQuickAdd = (sample: typeof SAMPLE_COMMUNITY_PLAYLISTS[0]) => {
    setInputUrl(sample.url);
    setPlaylistName(sample.name);
    setTag(sample.tag);
    const parsed = parseYouTubeUrl(sample.url);
    if (parsed.type !== 'invalid') {
      setPreviewData(parsed);
    }
  };

  return (
    <div id="playlist-manager-backdrop" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        id="playlist-manager-dialog"
        className="relative w-full max-w-xl max-h-[88vh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#0E0F14] border-t sm:border border-white/10 shadow-2xl overflow-hidden pb-[env(safe-area-inset-bottom,16px)]"
      >
        {/* Mobile Swipe Handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-5 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)] shrink-0">
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight">Add YouTube Playlist</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Stream any YouTube playlist or video directly</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 touch-pan-y">
          {/* Add Form */}
          <form onSubmit={handleSavePlaylist} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-indigo-400" />
                <span>YouTube Playlist or Video Link</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://www.youtube.com/playlist?list=... or Video URL"
                  value={inputUrl}
                  onChange={handleUrlChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60 transition-colors min-h-[42px]"
                />
                {previewData && (
                  <span className="absolute right-2.5 top-2 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30 font-bold">
                    {previewData.type}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Playlist Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., My Study Session"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60 min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Vibe Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g., Chill Beats"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60 min-h-[40px]"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 rounded-xl bg-white text-black hover:bg-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>{isVerifying ? 'Adding...' : 'Add & Play Playlist'}</span>
            </button>
          </form>

          {/* Quick Suggestions */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sample Casual Playlists</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_COMMUNITY_PLAYLISTS.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickAdd(sample)}
                  className="text-left p-2.5 sm:p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-indigo-500/30 transition-all group flex flex-col justify-between min-h-[44px]"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                      {sample.name}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {sample.desc}
                    </div>
                  </div>
                  <div className="mt-1.5 text-[10px] font-mono text-indigo-400 font-medium">
                    + Load link
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Saved Custom Playlists */}
          {customPlaylists.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Your Saved Playlists ({customPlaylists.length})</span>
              </div>
              <div className="space-y-2">
                {customPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 relative">
                        <img
                          src={pl.coverUrl || (pl.videoId ? `https://img.youtube.com/vi/${pl.videoId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80')}
                          alt={pl.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-0 right-0 px-1 py-0.2 bg-red-600/90 text-[8px] font-black text-white rounded-tl-sm tracking-tighter">
                          YT
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-slate-200 truncate">
                          {pl.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate font-mono">
                          {pl.playlistId ? `Playlist: ${pl.playlistId.slice(0, 14)}...` : `Video: ${pl.videoId}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          onPlayCustomPlaylist(pl);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-100 text-xs font-medium flex items-center gap-1 transition-colors min-h-[36px]"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Play</span>
                      </button>
                      <button
                        onClick={(e) => handleDelete(pl.id, e)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Delete Playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
