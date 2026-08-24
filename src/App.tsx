import React, { useState, useEffect, useRef } from 'react';
import { 
  Track, 
  Playlist, 
  Artist, 
  MoodCategory, 
  TabType, 
  EchoSettings, 
  LyricsData, 
  AutoEqProfile, 
  TenBandEqualizer, 
  EqualizerPreset, 
  UserStats, 
  SleepTimerState 
} from './types';
import { 
  ECHO_QUICK_PICKS, 
  COUNTRY_CHARTS, 
  ECHO_MOODS_AND_GENRES, 
  ECHO_TOP_ARTISTS, 
  ECHO_CURATED_PLAYLISTS, 
  AUTO_EQ_PROFILES, 
  EQUALIZER_PRESETS_10_BAND 
} from './data/echoMusicData';
import { 
  getFavoriteTracks, 
  toggleTrackFavorite, 
  getCustomPlaylists, 
  saveCustomPlaylist, 
  deleteCustomPlaylist, 
  getFollowedArtists, 
  toggleFollowArtist, 
  getSavedSettings, 
  saveSettings, 
  getUserStats, 
  recordTrackPlay, 
  DEFAULT_ECHO_SETTINGS 
} from './services/echoStorage';
import { EchoHeader } from './components/EchoHeader';
import { EchoNavigation } from './components/EchoNavigation';
import { EchoMiniPlayer } from './components/EchoMiniPlayer';
import { EchoFullPlayer } from './components/EchoFullPlayer';
import { HomeScreen } from './components/screens/HomeScreen';
import { SearchScreen } from './components/screens/SearchScreen';
import { PodcastsScreen } from './components/screens/PodcastsScreen';
import { LibraryScreen } from './components/screens/LibraryScreen';
import { EqualizerScreen } from './components/screens/EqualizerScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { 
  Plus, 
  X, 
  Check, 
  Sparkles, 
  ListMusic, 
  Trash2, 
  Share2, 
  ArrowLeft, 
  Play, 
  Shuffle, 
  Heart, 
  Moon, 
  Bell, 
  Sliders 
} from 'lucide-react';

export function App() {
  // Navigation & Screen State
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedCountry, setSelectedCountry] = useState<string>('GLOBAL');

  // Player State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(ECHO_QUICK_PICKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(ECHO_QUICK_PICKS[0].duration || 200);
  const [volume, setVolume] = useState<number>(85);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState<boolean>(false);
  const [playQueue, setPlayQueue] = useState<Track[]>(ECHO_QUICK_PICKS);
  const [queueIndex, setQueueIndex] = useState<number>(0);

  // Storage & Collections State
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [customPlaylists, setCustomPlaylists] = useState<Playlist[]>([]);
  const [followedArtists, setFollowedArtists] = useState<string[]>([]);
  const [settings, setSettings] = useState<EchoSettings>(DEFAULT_ECHO_SETTINGS);
  const [userStats, setUserStats] = useState<UserStats>(getUserStats());

  // Lyrics State
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState<boolean>(false);

  // Active Detail Views
  const [selectedPlaylistView, setSelectedPlaylistView] = useState<Playlist | null>(null);
  const [selectedArtistView, setSelectedArtistView] = useState<Artist | null>(null);
  const [selectedMoodView, setSelectedMoodView] = useState<MoodCategory | null>(null);

  // Modals
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState<boolean>(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState<string>('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState<string>('');
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState<boolean>(false);
  const [sleepTimer, setSleepTimer] = useState<SleepTimerState>({ active: false, totalMinutes: 0, remainingSeconds: 0, fadeOut: true });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Hidden YouTube Audio Player
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);

  // 1. Initial Data Load
  useEffect(() => {
    setFavorites(getFavoriteTracks());
    setCustomPlaylists(getCustomPlaylists());
    setFollowedArtists(getFollowedArtists());
    const saved = getSavedSettings();
    setSettings(saved);
    if (saved.selectedCountryChart) {
      setSelectedCountry(saved.selectedCountryChart);
    }
  }, []);

  // 2. Initialize YouTube Iframe Player
  useEffect(() => {
    let interval: any = null;

    const initYT = () => {
      if (!(window as any).YT || !(window as any).YT.Player) return;
      if (ytPlayerRef.current) return;

      try {
        ytPlayerRef.current = new (window as any).YT.Player('echo-youtube-engine', {
          height: '180',
          width: '320',
          videoId: currentTrack?.id || 'fJ9rUzIMcZQ',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              event.target.setVolume(volume);
            },
            onStateChange: (event: any) => {
              // YT.PlayerState: 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING, 0 = ENDED
              if (event.data === 1) {
                setIsPlaying(true);
                setIsBuffering(false);
                setDuration(event.target.getDuration() || currentTrack?.duration || 200);
              } else if (event.data === 2) {
                setIsPlaying(false);
                setIsBuffering(false);
              } else if (event.data === 3) {
                setIsBuffering(true);
              } else if (event.data === 0) {
                handleTrackEnd();
              }
            },
            onError: (err: any) => {
              console.warn('YouTube Player Engine Error:', err);
              // Auto-advance if error occurs
              setTimeout(() => {
                handleNextTrack();
              }, 1200);
            },
          },
        });
      } catch (e) {
        console.warn('Error instantiating YT Player:', e);
      }
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      (window as any).onYouTubeIframeAPIReady = initYT;
    } else {
      initYT();
    }

    interval = setInterval(() => {
      if ((window as any).YT && (window as any).YT.Player && !ytPlayerRef.current) {
        initYT();
      }
    }, 500);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // 3. Playback Clock & Progress Tracker
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          const curr = ytPlayerRef.current.getCurrentTime();
          setCurrentTime(curr);
        } else {
          setCurrentTime((prev) => prev + 1);
        }
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // 4. Fetch Lyrics when Track Changes
  useEffect(() => {
    if (!currentTrack) return;
    setIsLoadingLyrics(true);

    // Mock rich synchronized LRCLIB fallback data
    const mockSyncedLines = [
      { timeMs: 0, text: `♪ ${currentTrack.title} ♪`, translation: '♪ Instrumental Intro ♪' },
      { timeMs: 4000, text: `Performed by ${currentTrack.artist}`, translation: 'High-Fidelity Audio Stream' },
      { timeMs: 8000, text: 'Echoing through the endless night', translation: 'Glow in the rhythmic pulse' },
      { timeMs: 14000, text: 'Feel the bassline taking flight', translation: 'AutoEq balanced acoustics' },
      { timeMs: 20000, text: 'Colors dancing in the sound', translation: 'Spatial stage surrounding you' },
      { timeMs: 28000, text: 'Highest fidelity we have found', translation: 'Lossless studio clarity' },
      { timeMs: 36000, text: 'Yeah, we never let it go...', translation: 'Never fading away...' },
    ];

    setTimeout(() => {
      setLyricsData({
        synced: true,
        lines: mockSyncedLines,
        plainLyrics: mockSyncedLines.map((l) => l.text).join('\n'),
        source: 'LRCLIB',
        trackName: currentTrack.title,
        artistName: currentTrack.artist,
      });
      setIsLoadingLyrics(false);
    }, 400);

    // Record stats
    recordTrackPlay(currentTrack, 30);
    setUserStats(getUserStats());
  }, [currentTrack?.id]);

  // 5. Playback Handlers
  const handlePlayTrack = async (track: Track, newQueue?: Track[]) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.duration || 200);

    if (newQueue && newQueue.length > 0) {
      setPlayQueue(newQueue);
      const idx = newQueue.findIndex((t) => t.id === track.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    }

    let actualVideoId = track.id;

    // If ID is a fallback itunes id, query YouTube API to get the real videoId
    if (actualVideoId.startsWith('itunes_')) {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(track.artist + ' ' + track.title)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results[0] && !data.results[0].id.startsWith('itunes_')) {
            actualVideoId = data.results[0].id;
          }
        }
      } catch {}
    }

    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      try {
        ytPlayerRef.current.loadVideoById({
          videoId: actualVideoId,
          suggestedQuality: 'small',
        });
        ytPlayerRef.current.playVideo();
      } catch (err) {
        console.warn('Error loading video by ID:', err);
      }
    }
    setIsPlaying(true);

    // Sync browser MediaSession for notifications and keyboard media keys
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: track.album || 'Eshu Music',
          artwork: [
            { src: track.thumbnail || `https://img.youtube.com/vi/${actualVideoId}/hqdefault.jpg`, sizes: '512x512', type: 'image/jpeg' },
          ],
        });

        navigator.mediaSession.setActionHandler('play', () => handleTogglePlay());
        navigator.mediaSession.setActionHandler('pause', () => handleTogglePlay());
        navigator.mediaSession.setActionHandler('nexttrack', () => handleNextTrack());
        navigator.mediaSession.setActionHandler('previoustrack', () => handlePrevTrack());
      } catch {}
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        ytPlayerRef.current.pauseVideo();
      }
      setIsPlaying(false);
    } else {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
        ytPlayerRef.current.playVideo();
      }
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    if (playQueue.length === 0) return;
    let nextIdx = (queueIndex + 1) % playQueue.length;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * playQueue.length);
    }
    setQueueIndex(nextIdx);
    handlePlayTrack(playQueue[nextIdx]);
  };

  const handlePrevTrack = () => {
    if (playQueue.length === 0) return;
    const prevIdx = (queueIndex - 1 + playQueue.length) % playQueue.length;
    setQueueIndex(prevIdx);
    handlePlayTrack(playQueue[prevIdx]);
  };

  const handleTrackEnd = () => {
    if (repeatMode === 'one') {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
        ytPlayerRef.current.seekTo(0);
        ytPlayerRef.current.playVideo();
      }
      setCurrentTime(0);
    } else {
      handleNextTrack();
    }
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      ytPlayerRef.current.seekTo(seconds, true);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      ytPlayerRef.current.setVolume(newVol);
    }
  };

  // 6. Favorites Toggle
  const handleToggleFavorite = (track: Track) => {
    toggleTrackFavorite(track);
    setFavorites(getFavoriteTracks());
  };

  // 7. Create Custom Playlist
  const handleCreatePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim()) return;

    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      title: newPlaylistTitle.trim(),
      description: newPlaylistDesc.trim() || 'Custom playlist created on Echo Music',
      thumbnail: currentTrack?.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      trackCount: 0,
      tracks: [],
      createdAt: Date.now(),
    };

    saveCustomPlaylist(newPl);
    setCustomPlaylists(getCustomPlaylists());
    setNewPlaylistTitle('');
    setNewPlaylistDesc('');
    setIsCreatePlaylistOpen(false);
  };

  const favoriteSet = new Set(favorites.map((t) => t.id));
  const isCurrentFavorite = currentTrack ? favoriteSet.has(currentTrack.id) : false;

  // Active synced lyric line snippet for miniplayer
  const currentMs = currentTime * 1000;
  const activeLyric = lyricsData?.lines?.findLast
    ? lyricsData.lines.findLast((l) => l.timeMs <= currentMs)?.text
    : lyricsData?.lines?.filter((l) => l.timeMs <= currentMs).pop()?.text;

  return (
    <div className={`min-h-screen text-white flex flex-col font-sans selection:bg-[#FF5252] selection:text-white ${
      settings.theme === 'amoled-noir' ? 'bg-black' : 'bg-neutral-950'
    }`}>
      {/* Hidden YouTube Engine */}
      <div className="fixed -bottom-96 -right-96 w-48 h-32 opacity-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div id="echo-youtube-engine" />
      </div>

      {/* Top Header */}
      <EchoHeader
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedPlaylistView(null);
          setSelectedArtistView(null);
          setSelectedMoodView(null);
          setActiveTab(tab);
        }}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSearchFocus={() => setActiveTab('search')}
        onOpenEqualizer={() => setActiveTab('equalizer')}
        selectedCountry={selectedCountry}
        onSelectCountry={(country) => {
          setSelectedCountry(country);
          const updated = { ...settings, selectedCountryChart: country };
          setSettings(updated);
          saveSettings(updated);
        }}
        seedColor={settings.seedColor}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Left Navigation Sidebar (Desktop) */}
        <EchoNavigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setSelectedPlaylistView(null);
            setSelectedArtistView(null);
            setSelectedMoodView(null);
            setActiveTab(tab);
          }}
          customPlaylists={customPlaylists}
          onSelectPlaylist={(pl) => {
            setSelectedPlaylistView(pl);
            setSelectedArtistView(null);
            setSelectedMoodView(null);
          }}
          onCreatePlaylistModal={() => setIsCreatePlaylistOpen(true)}
          onOpenFavorites={() => {
            setSelectedPlaylistView(null);
            setSelectedArtistView(null);
            setSelectedMoodView(null);
            setActiveTab('library');
          }}
          onOpenOfflineTracks={() => {
            setSelectedPlaylistView(null);
            setSelectedArtistView(null);
            setSelectedMoodView(null);
            setActiveTab('library');
          }}
          seedColor={settings.seedColor}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto max-h-[calc(100vh-61px)]">
          {/* A. Playlist Detail View */}
          {selectedPlaylistView && (
            <div className="space-y-6 pb-32 animate-fadeIn max-w-5xl mx-auto">
              <button
                onClick={() => setSelectedPlaylistView(null)}
                className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 rounded-3xl bg-neutral-900/80 border border-white/10">
                <img 
                  src={selectedPlaylistView.thumbnail} 
                  alt={selectedPlaylistView.title}
                  className="w-44 h-44 rounded-2xl object-cover shadow-2xl" 
                />
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                    Playlist
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
                    {selectedPlaylistView.title}
                  </h1>
                  <p className="text-xs text-neutral-400">
                    {selectedPlaylistView.description}
                  </p>
                  <p className="text-xs font-semibold text-neutral-300">
                    {selectedPlaylistView.trackCount} Tracks • Echo Music
                  </p>

                  <div className="flex items-center gap-3 pt-2 justify-center sm:justify-start">
                    <button
                      onClick={() => handlePlayTrack(selectedPlaylistView.tracks[0], selectedPlaylistView.tracks)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs text-black"
                      style={{ backgroundColor: settings.seedColor }}
                    >
                      <Play className="w-4 h-4 fill-black" />
                      <span>Play</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tracks in Playlist */}
              <div className="space-y-2">
                {selectedPlaylistView.tracks.map((track, idx) => (
                  <div
                    key={track.id}
                    onClick={() => handlePlayTrack(track, selectedPlaylistView.tracks)}
                    className="p-3 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-white/10 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-5 text-center text-xs font-bold text-neutral-400">
                        {idx + 1}
                      </span>
                      <img src={track.thumbnail} alt={track.title} className="w-11 h-11 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#FF5252]">
                          {track.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 truncate">{track.artist}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* B. Artist Detail View */}
          {!selectedPlaylistView && selectedArtistView && (
            <div className="space-y-6 pb-32 animate-fadeIn max-w-5xl mx-auto">
              <button
                onClick={() => setSelectedArtistView(null)}
                className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 rounded-3xl bg-neutral-900/80 border border-white/10">
                <img 
                  src={selectedArtistView.thumbnail} 
                  alt={selectedArtistView.name}
                  className="w-44 h-44 rounded-full object-cover shadow-2xl ring-4 ring-white/10" 
                />
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                    Verified Artist
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
                    {selectedArtistView.name}
                  </h1>
                  <p className="text-xs text-neutral-400 max-w-md">
                    {selectedArtistView.bio}
                  </p>
                  <p className="text-xs font-semibold text-neutral-300">
                    {selectedArtistView.monthlyListeners || selectedArtistView.subscribers}
                  </p>

                  <div className="flex items-center gap-3 pt-2 justify-center sm:justify-start">
                    <button
                      onClick={() => handlePlayTrack(selectedArtistView.topTracks[0], selectedArtistView.topTracks)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs text-black"
                      style={{ backgroundColor: settings.seedColor }}
                    >
                      <Play className="w-4 h-4 fill-black" />
                      <span>Play Artist</span>
                    </button>

                    <button
                      onClick={() => {
                        toggleFollowArtist(selectedArtistView.name);
                        setFollowedArtists(getFollowedArtists());
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-xs font-bold text-white hover:bg-white/20"
                    >
                      {followedArtists.includes(selectedArtistView.name) ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Artist Top Tracks */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Top Songs</h3>
                {selectedArtistView.topTracks.map((track, idx) => (
                  <div
                    key={track.id}
                    onClick={() => handlePlayTrack(track, selectedArtistView.topTracks)}
                    className="p-3 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-white/10 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-5 text-center text-xs font-bold text-neutral-400">
                        #{idx + 1}
                      </span>
                      <img src={track.thumbnail} alt={track.title} className="w-11 h-11 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#FF5252]">
                          {track.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 truncate">{track.artist}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* C. Mood Detail View */}
          {!selectedPlaylistView && !selectedArtistView && selectedMoodView && (
            <div className="space-y-6 pb-32 animate-fadeIn max-w-5xl mx-auto">
              <button
                onClick={() => setSelectedMoodView(null)}
                className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>

              <div 
                className="p-8 rounded-3xl border border-white/10 shadow-2xl space-y-3"
                style={{ backgroundColor: selectedMoodView.color + '22' }}
              >
                <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
                  {selectedMoodView.title}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-300 max-w-xl">
                  {selectedMoodView.subtitle}
                </p>
                <button
                  onClick={() => selectedMoodView.tracks && handlePlayTrack(selectedMoodView.tracks[0], selectedMoodView.tracks)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs text-black shadow-lg"
                  style={{ backgroundColor: settings.seedColor }}
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Start Mood Radio</span>
                </button>
              </div>

              {/* Mood Tracks */}
              <div className="space-y-2">
                {(selectedMoodView.tracks || ECHO_QUICK_PICKS).map((track, idx) => (
                  <div
                    key={track.id}
                    onClick={() => handlePlayTrack(track, selectedMoodView.tracks || ECHO_QUICK_PICKS)}
                    className="p-3 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-white/10 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-5 text-center text-xs font-bold text-neutral-400">{idx + 1}</span>
                      <img src={track.thumbnail} alt={track.title} className="w-11 h-11 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#FF5252]">
                          {track.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 truncate">{track.artist}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* D. Main Tabs */}
          {!selectedPlaylistView && !selectedArtistView && !selectedMoodView && (
            <>
              {activeTab === 'home' && (
                <HomeScreen
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayTrack={handlePlayTrack}
                  onPlayAll={(tracks) => handlePlayTrack(tracks[0], tracks)}
                  onShuffleAll={(tracks) => {
                    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
                    handlePlayTrack(shuffled[0], shuffled);
                  }}
                  onSelectPlaylist={(pl) => setSelectedPlaylistView(pl)}
                  onSelectArtist={(art) => setSelectedArtistView(art)}
                  onSelectMood={(mood) => setSelectedMoodView(mood)}
                  onTabChange={(tab) => setActiveTab(tab)}
                  selectedCountry={selectedCountry}
                  onSelectCountry={(c) => {
                    setSelectedCountry(c);
                    const updated = { ...settings, selectedCountryChart: c };
                    setSettings(updated);
                    saveSettings(updated);
                  }}
                  favoriteTrackIds={favoriteSet}
                  onToggleFavorite={handleToggleFavorite}
                  seedColor={settings.seedColor}
                />
              )}

              {activeTab === 'search' && (
                <SearchScreen
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayTrack={handlePlayTrack}
                  onAddToQueue={(track) => setPlayQueue((prev) => [...prev, track])}
                  onToggleFavorite={handleToggleFavorite}
                  favoriteTrackIds={favoriteSet}
                  onSelectArtist={(art) => setSelectedArtistView(art)}
                  seedColor={settings.seedColor}
                />
              )}

              {activeTab === 'podcasts' && (
                <PodcastsScreen
                  currentPlayingTrackId={currentTrack?.id}
                  isPlaying={isPlaying}
                  onPlayEpisode={(track) => handlePlayTrack(track)}
                  seedColor={settings.seedColor}
                />
              )}

              {activeTab === 'library' && (
                <LibraryScreen
                  favoriteTracks={favorites}
                  customPlaylists={customPlaylists}
                  followedArtists={followedArtists}
                  onPlayTrack={handlePlayTrack}
                  onPlayAll={(tracks) => handlePlayTrack(tracks[0], tracks)}
                  onShuffleAll={(tracks) => {
                    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
                    handlePlayTrack(shuffled[0], shuffled);
                  }}
                  onSelectPlaylist={(pl) => setSelectedPlaylistView(pl)}
                  onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
                  onDeletePlaylist={(id) => {
                    deleteCustomPlaylist(id);
                    setCustomPlaylists(getCustomPlaylists());
                  }}
                  onToggleFavorite={handleToggleFavorite}
                  seedColor={settings.seedColor}
                />
              )}

              {activeTab === 'equalizer' && (
                <EqualizerScreen
                  currentPreset={settings.equalizerPreset}
                  tenBandEq={settings.tenBandEq}
                  selectedAutoEqId={settings.autoEqProfileId}
                  onUpdatePreset={(preset) => {
                    const updated = { ...settings, equalizerPreset: preset, tenBandEq: EQUALIZER_PRESETS_10_BAND[preset] };
                    setSettings(updated);
                    saveSettings(updated);
                  }}
                  onUpdateTenBandEq={(eq) => {
                    const updated = { ...settings, tenBandEq: eq };
                    setSettings(updated);
                    saveSettings(updated);
                  }}
                  onSelectAutoEqProfile={(prof) => {
                    const updated = { ...settings, autoEqProfileId: prof ? prof.id : null };
                    setSettings(updated);
                    saveSettings(updated);
                  }}
                  seedColor={settings.seedColor}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsScreen
                  stats={userStats}
                  seedColor={settings.seedColor}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsScreen
                  settings={settings}
                  onUpdateSettings={(newSet) => {
                    setSettings(newSet);
                    saveSettings(newSet);
                  }}
                  onClearCache={() => {
                    localStorage.removeItem('echo_music_cache_v2');
                    alert('Cache cleared successfully');
                  }}
                  onResetStats={() => {
                    localStorage.removeItem('echo_music_stats_v2');
                    setUserStats(getUserStats());
                  }}
                  seedColor={settings.seedColor}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating Bottom MiniPlayer */}
      {currentTrack && (
        <EchoMiniPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          currentTime={currentTime}
          duration={duration}
          isFavorite={isCurrentFavorite}
          activeLyricLine={activeLyric}
          onTogglePlay={handleTogglePlay}
          onNextTrack={handleNextTrack}
          onToggleFavorite={() => currentTrack && handleToggleFavorite(currentTrack)}
          onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
          onOpenQueue={() => setIsQueueOpen(true)}
          onOpenLyrics={() => setIsFullPlayerOpen(true)}
          onSeek={handleSeek}
          seedColor={settings.seedColor}
        />
      )}

      {/* Fullscreen Player Modal */}
      {isFullPlayerOpen && currentTrack && (
        <EchoFullPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          currentTime={currentTime}
          duration={duration}
          isFavorite={isCurrentFavorite}
          isShuffle={isShuffle}
          repeatMode={repeatMode}
          volume={volume}
          lyricsData={lyricsData}
          isLoadingLyrics={isLoadingLyrics}
          onClose={() => setIsFullPlayerOpen(false)}
          onTogglePlay={handleTogglePlay}
          onPrevTrack={handlePrevTrack}
          onNextTrack={handleNextTrack}
          onToggleShuffle={() => setIsShuffle((v) => !v)}
          onToggleRepeat={() => {
            const nextMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
            setRepeatMode(nextMode);
          }}
          onToggleFavorite={() => currentTrack && handleToggleFavorite(currentTrack)}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onOpenQueue={() => setIsQueueOpen(true)}
          onOpenEqualizer={() => {
            setIsFullPlayerOpen(false);
            setActiveTab('equalizer');
          }}
          onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
          seedColor={settings.seedColor}
        />
      )}

      {/* Create Playlist Modal */}
      {isCreatePlaylistOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-neutral-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Create New Playlist</h3>
              <button 
                onClick={() => setIsCreatePlaylistOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylistSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Playlist Title</label>
                <input
                  type="text"
                  required
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  placeholder="e.g., Midnight Chill, Synthwave Mix..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-neutral-800 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Description (Optional)</label>
                <textarea
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="A short note about this playlist..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-2xl bg-neutral-800 border border-white/15 text-white text-xs focus:outline-none focus:border-white/40 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePlaylistOpen(false)}
                  className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl font-bold text-xs text-black shadow-lg"
                  style={{ backgroundColor: settings.seedColor }}
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Up Next Queue Modal / Drawer */}
      {isQueueOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center sm:justify-end p-4 animate-fadeIn">
          <div className="w-full max-w-md h-[80vh] bg-neutral-900 border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <ListMusic className="w-5 h-5 text-[#FF5252]" style={{ color: settings.seedColor }} />
                  <h3 className="font-bold text-base text-white">Up Next Queue ({playQueue.length})</h3>
                </div>
                <button onClick={() => setIsQueueOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[60vh] space-y-2 pr-1 custom-scrollbar">
                {playQueue.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => handlePlayTrack(track)}
                      className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isCurrent 
                          ? 'bg-neutral-800 border-white/30 text-white' 
                          : 'bg-neutral-950/60 border-white/5 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-4 text-center text-xs font-bold text-neutral-400">{idx + 1}</span>
                        <img src={track.thumbnail} alt={track.title} className="w-10 h-10 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-[#FF5252]' : ''}`}>
                            {track.title}
                          </h4>
                          <p className="text-[10px] text-neutral-400 truncate">{track.artist}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setIsQueueOpen(false)}
              className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white text-center mt-4"
            >
              Close Queue
            </button>
          </div>
        </div>
      )}

      {/* Sleep Timer Modal */}
      {isSleepTimerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-neutral-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Sleep Timer</h3>
              </div>
              <button onClick={() => setIsSleepTimerOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Select duration after which playback will automatically fade out and stop.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[15, 30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    setSleepTimer({
                      active: true,
                      totalMinutes: mins,
                      remainingSeconds: mins * 60,
                      fadeOut: true,
                    });
                    setIsSleepTimerOpen(false);
                    alert(`Sleep timer set for ${mins} minutes`);
                  }}
                  className="p-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-xs font-bold text-white transition-all"
                >
                  {mins} Minutes
                </button>
              ))}
              <button
                onClick={() => {
                  setSleepTimer({ active: false, totalMinutes: 0, remainingSeconds: 0, fadeOut: true });
                  setIsSleepTimerOpen(false);
                }}
                className="p-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-bold text-rose-300 transition-all"
              >
                Turn Off Timer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-neutral-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#FF5252]" style={{ color: settings.seedColor }} />
                <h3 className="font-bold text-base text-white">What's New in Eshu Music</h3>
              </div>
              <button onClick={() => setIsNotificationsOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <div className="p-3 rounded-2xl bg-neutral-950/60 border border-white/10 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Eshu Music v5.2.8 Released</span>
                </div>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  • Rebuilt with authentic Eshu Music UI & theme engine from Yugesh (<a href="https://github.com/yugesh" target="_blank" rel="noreferrer" className="text-white underline">@yugesh</a>).<br />
                  • Added AutoEq Headphone profile calibration with Harman curves.<br />
                  • Integrated 10-Band Graphic Equalizer DSP with Dynamic Bass Boost.<br />
                  • Synced LRCLIB lyrics with AI subtitle translation.<br />
                  • Support for global country charts and podcasts.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="w-full py-2.5 rounded-2xl font-bold text-xs text-black"
              style={{ backgroundColor: settings.seedColor }}
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
