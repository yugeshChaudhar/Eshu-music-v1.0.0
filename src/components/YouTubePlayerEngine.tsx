import React, { useEffect, useRef, useState } from 'react';
import { Station, TrackMetadata } from '../types';
import { cacheTrackMetadata } from '../services/youtubeService';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  station: Station | null;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number; // 0 - 100
  playbackRate: number;
  isShuffle: boolean;
  isRepeat: boolean;
  seekToTime: number | null;
  jumpToTrackIndex?: { index: number; timestamp: number } | null;
  onTrackChange: (track: TrackMetadata) => void;
  onPlayerStateChange: (state: { isPlaying: boolean; isBuffering: boolean; duration: number; currentTime: number }) => void;
  onPlaylistLoaded?: (videoIds: string[]) => void;
  onNextTriggered?: () => void;
  showVideoPlayer?: boolean;
}

export const YouTubePlayerEngine: React.FC<YouTubePlayerProps> = ({
  station,
  isPlaying,
  isMuted,
  volume,
  playbackRate,
  isShuffle,
  isRepeat,
  seekToTime,
  jumpToTrackIndex,
  onTrackChange,
  onPlayerStateChange,
  onPlaylistLoaded,
  showVideoPlayer = false,
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const stationRef = useRef<Station | null>(station);
  stationRef.current = station;
  const loadedStationKeyRef = useRef<string>('');
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const lastVideoIdRef = useRef<string>('');
  const lastTitleRef = useRef<string>('');
  const lastAuthorRef = useRef<string>('');
  const lastReportedStateRef = useRef<{ isPlaying: boolean; isBuffering: boolean; duration: number; currentTime: number }>({
    isPlaying: false,
    isBuffering: false,
    duration: 0,
    currentTime: 0,
  });

  const onTrackChangeRef = useRef(onTrackChange);
  onTrackChangeRef.current = onTrackChange;

  const onPlayerStateChangeRef = useRef(onPlayerStateChange);
  onPlayerStateChangeRef.current = onPlayerStateChange;

  const onPlaylistLoadedRef = useRef(onPlaylistLoaded);
  onPlaylistLoadedRef.current = onPlaylistLoaded;

  // Initialize YT API
  useEffect(() => {
    let checkInterval: any = null;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      if (playerRef.current) return;

      const playerElement = document.getElementById('yt-player-target');
      if (!playerElement) return;

      playerRef.current = new window.YT.Player('yt-player-target', {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            event.target.setVolume(volume);
            if (isMuted) {
              event.target.mute();
            } else {
              event.target.unMute();
            }
            event.target.setPlaybackRate(playbackRate);
            event.target.setShuffle(isShuffle);
            event.target.setLoop(isRepeat);
            if (isPlayingRef.current) {
              try {
                event.target.playVideo();
              } catch {}
            }
          },
          onStateChange: (event: any) => {
            const state = event.data;
            const target = event.target;

            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
            const isVideoBuffering = state === 3 || state === -1;
            const isVideoPlaying = state === 1;

            try {
              const videoData = target.getVideoData();
              const dur = target.getDuration() || 0;
              const cur = target.getCurrentTime() || 0;

              if (videoData && videoData.video_id) {
                const vid = videoData.video_id;
                const title = videoData.title || (station?.name || 'Now Playing');
                const author = videoData.author || (station?.tag || 'Casual Stream');

                if (vid !== lastVideoIdRef.current || title !== lastTitleRef.current) {
                  lastVideoIdRef.current = vid;
                  lastTitleRef.current = title;
                  lastAuthorRef.current = author;

                  const trackInfo: TrackMetadata = {
                    title,
                    author,
                    videoId: vid,
                    duration: dur,
                    thumbnail: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
                    playlistIndex: typeof target.getPlaylistIndex === 'function' ? target.getPlaylistIndex() : 0,
                  };
                  cacheTrackMetadata(vid, trackInfo.title, trackInfo.author, trackInfo.thumbnail);
                  onTrackChangeRef.current(trackInfo);

                  // Update OS Lock-screen / Background Media Session
                  if ('mediaSession' in navigator) {
                    try {
                      navigator.mediaSession.metadata = new MediaMetadata({
                        title: trackInfo.title,
                        artist: trackInfo.author,
                        album: station?.name || 'Lofi Stream',
                        artwork: [
                          { src: trackInfo.thumbnail, sizes: '480x360', type: 'image/jpeg' },
                        ],
                      });

                      navigator.mediaSession.setActionHandler('play', () => {
                        if (playerRef.current) playerRef.current.playVideo();
                      });
                      navigator.mediaSession.setActionHandler('pause', () => {
                        if (playerRef.current) playerRef.current.pauseVideo();
                      });
                      navigator.mediaSession.setActionHandler('nexttrack', () => {
                        if (playerRef.current) playerRef.current.nextVideo();
                      });
                      navigator.mediaSession.setActionHandler('previoustrack', () => {
                        if (playerRef.current) playerRef.current.previousVideo();
                      });
                    } catch {
                      // Ignore unsupported action handler errors
                    }
                  }
                }
              }

              lastReportedStateRef.current = {
                isPlaying: isPlayingRef.current,
                isBuffering: isVideoBuffering,
                duration: dur,
                currentTime: cur,
              };

              onPlayerStateChangeRef.current({
                isPlaying: isPlayingRef.current,
                isBuffering: isVideoBuffering,
                duration: dur,
                currentTime: cur,
              });

              if (typeof target.getPlaylist === 'function') {
                const list = target.getPlaylist();
                if (list && Array.isArray(list)) {
                  onPlaylistLoadedRef.current?.(list);
                }
              }
            } catch {
              // Ignore cross-origin safely
            }

            // Auto-advance if video ends
            if (state === 0) {
              if (isRepeat) {
                target.playVideo();
              } else {
                target.nextVideo();
              }
            }
          },
          onError: (event: any) => {
            console.warn('YouTube Player Event Error:', event.data);
            // Error codes:
            // 2: Invalid parameter (e.g. malformed playlist id)
            // 5: HTML5 player error
            // 100: Video requested not found / deleted / private
            // 101 / 150: Video owner does not allow embedded playback
            setTimeout(() => {
              try {
                if (playerRef.current && typeof playerRef.current.nextVideo === 'function') {
                  playerRef.current.nextVideo();
                } else if (stationRef.current?.videoId && playerRef.current) {
                  playerRef.current.loadVideoById({
                    videoId: stationRef.current.videoId,
                    suggestedQuality: 'small',
                  });
                }
              } catch (e) {
                console.warn('Fallback after player error failed', e);
              }
            }, 400);
          },
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else if (window.YT.loaded) {
      initPlayer();
    } else {
      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          initPlayer();
        }
      }, 100);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, []);

  // Station Change handling
  useEffect(() => {
    if (!isReady || !playerRef.current || !station) return;
    const stationKey = `${station.id}_${station.videoId || ''}_${station.playlistId || ''}`;
    if (loadedStationKeyRef.current === stationKey) {
      return;
    }

    loadedStationKeyRef.current = stationKey;

    try {
      // Stop and clear previous playback
      if (typeof playerRef.current.stopVideo === 'function') {
        playerRef.current.stopVideo();
      }

      if (station.playlistId) {
        playerRef.current.loadPlaylist({
          list: station.playlistId,
          listType: 'playlist',
          index: 0,
          suggestedQuality: 'small',
        });
      } else if (station.videoId) {
        playerRef.current.loadVideoById({
          videoId: station.videoId,
          suggestedQuality: 'small',
        });
      }

      if (isShuffle) {
        playerRef.current.setShuffle(true);
      }
      if (isRepeat) {
        playerRef.current.setLoop(true);
      }

      // Ensure playback starts for the newly switched playlist
      setTimeout(() => {
        try {
          if (playerRef.current && isPlayingRef.current) {
            playerRef.current.playVideo();
          }
        } catch {}
      }, 150);
    } catch (err) {
      console.error('Error loading station:', err);
    }
  }, [station, isReady, isShuffle, isRepeat]);

  const prevIsPlayingRef = useRef<boolean>(isPlaying);

  // Play / Pause Sync (Only triggers on explicit user state transitions, preventing infinite loops)
  useEffect(() => {
    if (!isReady || !playerRef.current) return;
    if (prevIsPlayingRef.current === isPlaying) return;
    prevIsPlayingRef.current = isPlaying;

    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (err) {
      console.warn('Playback transition error:', err);
    }
  }, [isPlaying, isReady]);

  // Volume & Mute Sync
  useEffect(() => {
    if (!isReady || !playerRef.current) return;
    try {
      playerRef.current.setVolume(volume);
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
      }
    } catch {}
  }, [volume, isMuted, isReady]);

  // Playback Rate Sync
  useEffect(() => {
    if (!isReady || !playerRef.current) return;
    try {
      playerRef.current.setPlaybackRate(playbackRate);
    } catch {}
  }, [playbackRate, isReady]);

  // Shuffle & Repeat Sync
  useEffect(() => {
    if (!isReady || !playerRef.current) return;
    try {
      playerRef.current.setShuffle(isShuffle);
      playerRef.current.setLoop(isRepeat);
    } catch {}
  }, [isShuffle, isRepeat, isReady]);

  // Seek Sync
  useEffect(() => {
    if (!isReady || !playerRef.current || seekToTime === null) return;
    try {
      playerRef.current.seekTo(seekToTime, true);
      const dur = playerRef.current.getDuration?.() || 0;
      onPlayerStateChange({
        isPlaying: isPlaying,
        isBuffering: false,
        duration: dur,
        currentTime: seekToTime,
      });
    } catch {}
  }, [seekToTime, isReady]);

  // Jump to specific track index in playlist
  useEffect(() => {
    if (!isReady || !playerRef.current || !jumpToTrackIndex) return;
    try {
      if (typeof playerRef.current.playVideoAt === 'function') {
        playerRef.current.playVideoAt(jumpToTrackIndex.index);
      }
    } catch (err) {
      console.warn('Error jumping to track index:', err);
    }
  }, [jumpToTrackIndex, isReady]);

  // High-precision Progress & Track Sync Polling
  useEffect(() => {
    if (!isReady || !playerRef.current) return;

    const interval = setInterval(() => {
      try {
        if (!playerRef.current) return;
        const cur = playerRef.current.getCurrentTime?.() || 0;
        const dur = playerRef.current.getDuration?.() || 0;
        const state = playerRef.current.getPlayerState?.();

        const isVideoBuffering = state === 3 || state === -1;
        const currentActivePlaying = isPlayingRef.current;

        const last = lastReportedStateRef.current;
        const stateChanged =
          last.isPlaying !== currentActivePlaying ||
          last.isBuffering !== isVideoBuffering ||
          Math.abs(last.duration - dur) > 0.5 ||
          Math.abs(last.currentTime - cur) >= 0.45;

        if (stateChanged) {
          lastReportedStateRef.current = {
            isPlaying: currentActivePlaying,
            isBuffering: isVideoBuffering,
            duration: dur,
            currentTime: cur,
          };

          onPlayerStateChangeRef.current({
            isPlaying: currentActivePlaying,
            isBuffering: isVideoBuffering,
            duration: dur,
            currentTime: cur,
          });
        }

        // Refresh metadata ONLY if track title or video ID actually changed
        const data = playerRef.current.getVideoData?.();
        if (data && data.video_id) {
          const vid = data.video_id;
          const title = data.title || (station?.name || 'Now Playing');
          const author = data.author || (station?.tag || 'Casual Stream');

          if (vid !== lastVideoIdRef.current || title !== lastTitleRef.current) {
            lastVideoIdRef.current = vid;
            lastTitleRef.current = title;

            const trackInfo: TrackMetadata = {
              title,
              author,
              videoId: vid,
              duration: dur,
              thumbnail: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
              playlistIndex: playerRef.current.getPlaylistIndex?.() || 0,
            };
            cacheTrackMetadata(vid, trackInfo.title, trackInfo.author, trackInfo.thumbnail);
            onTrackChangeRef.current(trackInfo);
          }
        }
      } catch {}
    }, 250);

    return () => clearInterval(interval);
  }, [isReady, station]);

  return (
    <div
      ref={containerRef}
      id="yt-player-container"
      className={`transition-all duration-300 ${
        showVideoPlayer
          ? 'w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video'
          : 'fixed bottom-2 right-2 w-64 h-36 opacity-[0.001] pointer-events-none z-0 overflow-hidden'
      }`}
    >
      <div id="yt-player-target" className="w-full h-full" />
    </div>
  );
};
