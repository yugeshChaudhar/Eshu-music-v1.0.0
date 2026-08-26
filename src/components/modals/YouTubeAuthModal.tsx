import React, { useState } from 'react';
import { 
  Youtube, 
  LogIn, 
  LogOut, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FolderSync, 
  ShieldCheck, 
  Sparkles,
  Music,
  ExternalLink,
  Loader2,
  X,
  Link2,
  Plus,
  Radio
} from 'lucide-react';
import { YouTubeUserProfile, Playlist, Track } from '../../types';

interface YouTubeAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: YouTubeUserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
  onSyncPlaylists: () => void;
  onDirectImportPlaylist?: (playlistUrlOrId: string) => Promise<boolean>;
  isSyncing: boolean;
  syncStatus: string | null;
  seedColor?: string;
  importedPlaylistsCount?: number;
}

export const YouTubeAuthModal: React.FC<YouTubeAuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  onLogout,
  onSyncPlaylists,
  onDirectImportPlaylist,
  isSyncing,
  syncStatus,
  seedColor = '#FF5252',
  importedPlaylistsCount = 0,
}) => {
  const [playlistInput, setPlaylistInput] = useState('');
  const [isImportingUrl, setIsImportingUrl] = useState(false);
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'direct' | 'oauth'>('direct');

  if (!isOpen) return null;

  const handleDirectImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistInput.trim() || !onDirectImportPlaylist) return;
    setIsImportingUrl(true);
    setImportFeedback(null);
    try {
      const ok = await onDirectImportPlaylist(playlistInput.trim());
      if (ok) {
        setImportFeedback({ type: 'success', text: 'Playlist imported successfully to your Library!' });
        setPlaylistInput('');
      } else {
        setImportFeedback({ type: 'error', text: 'Could not fetch songs from this playlist URL. Ensure it is public or unlisted.' });
      }
    } catch (err: any) {
      setImportFeedback({ type: 'error', text: err.message || 'Import failed. Check link and try again.' });
    } finally {
      setIsImportingUrl(false);
    }
  };

  const handleQuickImport = async (urlOrId: string, name: string) => {
    if (!onDirectImportPlaylist) return;
    setIsImportingUrl(true);
    setImportFeedback(null);
    try {
      const ok = await onDirectImportPlaylist(urlOrId);
      if (ok) {
        setImportFeedback({ type: 'success', text: `Imported "${name}" to your Library!` });
      }
    } catch {
      setImportFeedback({ type: 'error', text: 'Failed to import.' });
    } finally {
      setIsImportingUrl(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn select-none">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div 
        className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-white/15 p-6 sm:p-8 shadow-2xl z-10 overflow-hidden space-y-5"
        style={{
          boxShadow: `0 20px 60px -15px ${seedColor}25`
        }}
      >
        {/* Ambient Glow */}
        <div 
          className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: seedColor }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-[#FF0000]"
          >
            <Youtube className="w-7 h-7 text-white fill-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>YouTube Playlists</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                Sync Engine
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              Import and play any YouTube or YouTube Music playlist
            </p>
          </div>
        </div>

        {/* Tab switchers: Direct URL Import vs Google Account Login */}
        <div className="flex p-1 rounded-2xl bg-neutral-800 border border-white/10">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'direct'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Direct Link / URL (No Login)</span>
          </button>
          <button
            onClick={() => setActiveTab('oauth')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'oauth'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Youtube className="w-3.5 h-3.5" />
            <span>Google / YouTube Sign-in</span>
          </button>
        </div>

        {/* TAB 1: Direct YouTube Playlist Import (Zero friction, no origin_mismatch errors) */}
        {activeTab === 'direct' && (
          <div className="space-y-4">
            <form onSubmit={handleDirectImport} className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">
                Paste YouTube or YouTube Music Playlist URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="https://youtube.com/playlist?list=PL..."
                  value={playlistInput}
                  onChange={(e) => setPlaylistInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-800 border border-white/15 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-[#FF5252]"
                />
                <button
                  type="submit"
                  disabled={isImportingUrl || !playlistInput.trim()}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-black transition-all hover:brightness-110 disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                  style={{ backgroundColor: seedColor }}
                >
                  {isImportingUrl ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <Plus className="w-4 h-4 text-black" />
                  )}
                  <span>Import</span>
                </button>
              </div>
              <p className="text-[11px] text-neutral-400">
                Supports public and unlisted playlists from YouTube & YouTube Music.
              </p>
            </form>

            {/* Quick Import Preset Suggestions */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-xs font-bold text-neutral-300">Quick Demo YouTube Playlists:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Queen - Greatest Hits', id: 'PL2214304DC15781E7' },
                  { name: 'Global Top Hits 2025', id: 'PL4fGSIFgk530XWd47Y8XJ_oP3t3n6Zz1a' },
                  { name: 'Synthwave / Retro Vibes', id: 'PL3-sRm8xAzY-vPh30Duq9_kGjV8y_v0-s' },
                  { name: 'Chill Acoustic & Lofi', id: 'PL8yX4p_Wv2w_k_9zXzY9V4j_vV1zX_9Y0' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleQuickImport(preset.id, preset.name)}
                    disabled={isImportingUrl}
                    className="p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-white/5 hover:border-white/15 text-left text-xs text-neutral-200 transition-all flex items-center justify-between"
                  >
                    <span className="truncate font-medium">{preset.name}</span>
                    <Plus className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback message */}
            {importFeedback && (
              <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                importFeedback.type === 'success'
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/30 text-rose-300'
              }`}>
                {importFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                )}
                <span>{importFeedback.text}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Google Identity Services / OAuth Login */}
        {activeTab === 'oauth' && (
          <div>
            {user ? (
              <div className="space-y-4">
                {/* User Profile Card */}
                <div className="p-4 rounded-2xl bg-neutral-800/80 border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      className="w-12 h-12 rounded-full border-2 border-white/20 object-cover shadow-md"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-white truncate">{user.name}</h3>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                      <span className="text-[10px] text-emerald-400 font-semibold">● Connected</span>
                    </div>
                  </div>

                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-300 border border-white/10 text-xs font-semibold transition-colors flex-shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>

                {/* Sync Action */}
                <button
                  onClick={onSyncPlaylists}
                  disabled={isSyncing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-black transition-all active:scale-95 shadow-xl disabled:opacity-50"
                  style={{ backgroundColor: seedColor }}
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Syncing YouTube Library...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Sync My YouTube Playlists</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>OAuth Origin Notice</span>
                  </div>
                  <p className="text-[11px] text-neutral-300">
                    If Google shows <em>&quot;Authorization Error / origin_mismatch&quot;</em> when clicking below, use the <strong>Direct Link / URL (No Login)</strong> tab above to import any playlist without needing OAuth permissions.
                  </p>
                </div>

                <button
                  onClick={onLogin}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-extrabold text-sm text-white bg-[#FF0000] hover:bg-[#E60000] transition-all active:scale-95 shadow-xl shadow-red-900/30"
                >
                  <Youtube className="w-5 h-5 fill-white" />
                  <span>Sign in with Google Account</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
