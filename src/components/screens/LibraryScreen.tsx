import React, { useState } from 'react';
import { 
  Library, 
  Heart, 
  Plus, 
  FolderHeart, 
  Music2, 
  Clock, 
  Play, 
  Shuffle, 
  Trash2, 
  Sparkles, 
  UserCheck,
  Download,
  Youtube,
  RefreshCw,
  FolderSync,
  FolderPlus
} from 'lucide-react';
import { Track, Playlist, Artist, YouTubeUserProfile } from '../../types';
import { getListeningHistory } from '../../services/echoStorage';

interface LibraryScreenProps {
  favoriteTracks: Track[];
  customPlaylists: Playlist[];
  followedArtists: string[];
  onPlayTrack: (track: Track, queue?: Track[]) => void;
  onPlayAll: (tracks: Track[]) => void;
  onShuffleAll: (tracks: Track[]) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
  onCreatePlaylist: () => void;
  onDeletePlaylist: (playlistId: string) => void;
  onToggleFavorite: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  seedColor?: string;
  youtubeUser?: YouTubeUserProfile | null;
  onOpenYouTubeAuth?: () => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  favoriteTracks,
  customPlaylists,
  followedArtists,
  onPlayTrack,
  onPlayAll,
  onShuffleAll,
  onSelectPlaylist,
  onCreatePlaylist,
  onDeletePlaylist,
  onToggleFavorite,
  onAddToPlaylist,
  seedColor = '#FF5252',
  youtubeUser = null,
  onOpenYouTubeAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'liked' | 'playlists' | 'history' | 'artists'>('liked');
  const history = getListeningHistory();
  const importedCount = customPlaylists.filter((p) => p.isYouTubeImported).length;

  return (
    <div className="space-y-8 pb-32 animate-fadeIn max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-white/10 shadow-2xl">
        <div 
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ backgroundColor: seedColor }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-neutral-200 mb-3">
              <Library className="w-3.5 h-3.5" style={{ color: seedColor }} />
              <span>Your Personal Music Library</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Music Collections
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
              {favoriteTracks.length} Liked songs • {customPlaylists.length} Playlists ({importedCount} YouTube synced) • {followedArtists.length} Followed artists
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {/* YouTube Account Sync Trigger */}
            <button
              onClick={onOpenYouTubeAuth}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-xl border ${
                youtubeUser
                  ? 'bg-neutral-900/90 hover:bg-neutral-800 text-white border-white/15'
                  : 'bg-[#FF0000] hover:bg-[#E60000] text-white border-transparent'
              }`}
            >
              <Youtube className="w-4 h-4 fill-white" />
              <span>{youtubeUser ? 'YouTube Connected' : 'Sync YouTube'}</span>
            </button>

            <button
              onClick={onCreatePlaylist}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm text-black transition-all active:scale-95 shadow-xl"
              style={{ backgroundColor: seedColor }}
            >
              <Plus className="w-4 h-4" />
              <span>New Playlist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {[
          { id: 'liked' as const, label: `Liked Songs (${favoriteTracks.length})`, icon: Heart },
          { id: 'playlists' as const, label: `Playlists (${customPlaylists.length})`, icon: FolderHeart },
          { id: 'history' as const, label: `History (${history.length})`, icon: Clock },
          { id: 'artists' as const, label: `Artists (${followedArtists.length})`, icon: UserCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              style={{
                color: isSelected ? seedColor : undefined,
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Liked Songs View */}
      {activeTab === 'liked' && (
        <div className="space-y-4 animate-fadeIn">
          {favoriteTracks.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onPlayAll(favoriteTracks)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs text-black"
                style={{ backgroundColor: seedColor }}
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Play Liked Songs</span>
              </button>

              <button
                onClick={() => onShuffleAll(favoriteTracks)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-900 border border-white/10 text-xs font-bold text-white hover:bg-neutral-800"
              >
                <Shuffle className="w-4 h-4" />
                <span>Shuffle</span>
              </button>
            </div>
          )}

          {favoriteTracks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-neutral-900/40 border border-dashed border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-neutral-400">
                <Heart className="w-6 h-6 text-[#FF4081]" />
              </div>
              <h3 className="font-bold text-white text-sm">No Liked Songs Yet</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Tap the heart icon on any song while listening to add it to your personal favorites.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {favoriteTracks.map((track, idx) => (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track, favoriteTracks)}
                  className="p-3 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-5 text-center text-xs font-bold text-neutral-400">
                      {idx + 1}
                    </span>
                    <img src={track.thumbnail} alt={track.title} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#FF5252] transition-colors">
                        {track.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {onAddToPlaylist && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToPlaylist(track);
                        }}
                        className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Add to Playlist"
                      >
                        <FolderPlus className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(track);
                      }}
                      className="p-2 rounded-xl text-[#FF4081] hover:bg-white/10 transition-colors"
                    >
                      <Heart className="w-4 h-4 fill-[#FF4081]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Custom Playlists View */}
      {activeTab === 'playlists' && (
        <div className="space-y-4 animate-fadeIn">
          {/* YouTube Sync Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-neutral-900/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-2xl bg-[#FF0000] flex items-center justify-center flex-shrink-0 shadow-lg">
                <Youtube className="w-6 h-6 fill-white text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Import YouTube Playlists</span>
                  {youtubeUser && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                      Connected ({youtubeUser.name})
                    </span>
                  )}
                </h4>
                <p className="text-xs text-neutral-400">
                  {youtubeUser 
                    ? 'Sync and auto-refresh your personal YouTube playlists directly into your library.'
                    : 'Sign in with your YouTube account to automatically import all your created playlists.'}
                </p>
              </div>
            </div>

            <button
              onClick={onOpenYouTubeAuth}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex-shrink-0 w-full sm:w-auto justify-center"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{youtubeUser ? 'Sync Playlists' : 'Connect Account'}</span>
            </button>
          </div>

          {customPlaylists.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-neutral-900/40 border border-dashed border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-neutral-400">
                <FolderHeart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-sm">No Playlists Yet</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Create custom playlists or connect your YouTube account to import all your personal mixes automatically.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={onOpenYouTubeAuth}
                  className="px-4 py-2 rounded-2xl font-bold text-xs text-white bg-[#FF0000] hover:bg-[#E60000] flex items-center gap-1.5"
                >
                  <Youtube className="w-4 h-4 fill-white" />
                  <span>Import from YouTube</span>
                </button>
                <button
                  onClick={onCreatePlaylist}
                  className="px-4 py-2 rounded-2xl font-bold text-xs text-black"
                  style={{ backgroundColor: seedColor }}
                >
                  Create New
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {customPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => onSelectPlaylist(pl)}
                  className="p-4 rounded-3xl bg-neutral-900/70 border border-white/10 hover:border-white/20 hover:bg-neutral-900 transition-all cursor-pointer group"
                >
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 bg-neutral-800 shadow-md">
                    <img 
                      src={pl.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80'} 
                      alt={pl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white">
                      {pl.trackCount} Tracks
                    </span>
                    {pl.isYouTubeImported && (
                      <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FF0000]/90 backdrop-blur-md text-[10px] font-bold text-white shadow-lg">
                        <Youtube className="w-3 h-3 fill-white" />
                        <span>YouTube</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 pr-2">
                      <h3 className="font-bold text-sm text-white truncate group-hover:text-[#FF5252] transition-colors">
                        {pl.title}
                      </h3>
                      <p className="text-xs text-neutral-400 truncate">
                        {pl.description || (pl.isYouTubeImported ? 'Imported from YouTube' : 'Custom playlist')}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlaylist(pl.id);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-white/10 transition-colors flex-shrink-0"
                      title="Delete Playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. History View */}
      {activeTab === 'history' && (
        <div className="space-y-2 animate-fadeIn">
          {history.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">
              No recent listening history yet.
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={`${item.track.id}-${idx}`}
                onClick={() => onPlayTrack(item.track)}
                className="p-3 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-white/10 transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img src={item.track.thumbnail} alt={item.track.title} className="w-11 h-11 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#FF5252] transition-colors">
                      {item.track.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {item.track.artist}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-neutral-400">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. Followed Artists View */}
      {activeTab === 'artists' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fadeIn">
          {followedArtists.map((artistName) => (
            <div
              key={artistName}
              className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white">
                {artistName[0]}
              </div>
              <span className="text-xs font-bold text-white truncate">{artistName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
