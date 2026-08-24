import React, { useEffect, useRef, useState } from 'react';
import { Track, SponsorSegment } from '../types';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface SimpYouTubePlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  playbackRate: number;
  isShuffle: boolean;
  isRepeat: boolean;
  seekToTime: number | null;
  sponsorBlockEnabled: boolean;
  onPlayerStateChange: (state: {
    isPlaying: boolean;
    isBuffering: boolean;
    duration: number;
    currentTime: number;
  }) => void;
  onTrackEnded: () => void;
  onSponsorSkipped?: (segment: SponsorSegment) => void;
}

export const SimpYouTubePlayer: React.FC<SimpYouTubePlayerProps> = ({
  currentTrack,
  isPlaying,
  isMuted,
  volume,
  playbackRate,
  isShuffle,
  isRepeat,
  seekToTime,
  sponsorBlockEnabled,
  onPlayerStateChange,
  onTrackEnded,
  onSponsorSkipped,
}) => {
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentTrackRef = useRef(currentTrack);
  currentTrackRef.current = currentTrack;

  const sponsorSegmentsRef = useRef<SponsorSegment[]>([]);
  const lastSkippedSegmentRef = useRef<number>(-1);
  const loadedVideoIdRef = useRef<string>('');
  const prevIsPlayingRef = useRef<boolean>(isPlaying);

  // 1. Fetch SponsorBlock segments when track changes
  useEffect(() => {
    if (!currentTrack?.id || !sponsorBlockEnabled) {
      sponsorSegmentsRef.current = [];
      return;
    }
    const fetchSponsorSegments = async () => {
      try {
        const res = await fetch(`/api/sponsorblock?videoId=${encodeURIComponent(currentTrack.id)}`);
        if (res.ok) {
          const data = await res.json();
          sponsorSegmentsRef.current = data.segments || [];
        }
      } catch {
        sponsorSegmentsRef.current = [];
      }
    };
    fetchSponsorSegments();
  }, [currentTrack?.id, sponsorBlockEnabled]);

  // 2. Initialize YouTube Iframe Player
  useEffect(() => {
    let checkInterval: any = null;

    const initPlayer = () => {
      if (playerRef.current || !window.YT || !window.YT.Player) return;
      const target = document.getElementById('simp-yt-player-target');
      if (!target) return;

      playerRef.current = new window.YT.Player('simp-yt-player-target', {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 0,
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
            if (isMuted) event.target.mute();
            else event.target.unMute();
            event.target.setPlaybackRate(playbackRate);
          },
          onStateChange: (event: any) => {
            const state = event.data;
            const target = event.target;
            const dur = target.getDuration() || 0;
            const cur = target.getCurrentTime() || 0;

            const isBuffering = state === 3 || state === -1;
            const isPlayingNow = state === 1;

            onPlayerStateChange({
              isPlaying: isPlayingRef.current,
              isBuffering,
              duration: dur,
              currentTime: cur,
            });

            // Auto-advance if video ends
            if (state === 0) {
              if (isRepeat) {
                target.seekTo(0, true);
                target.playVideo();
              } else {
                onTrackEnded();
              }
            }
          },
          onError: (event: any) => {
            console.warn('YouTube Player Error:', event.data);
            // On embed error (e.g. video blocked), advance track
            setTimeout(() => {
              onTrackEnded();
            }, 1000);
          },
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript?.parentNode?.insertBefore(tag, firstScript);
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else if (window.YT.loaded) {
      initPlayer();
    } else {
      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          initPlayer();
          clearInterval(checkInterval);
        }
      }, 100);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, []);

  // 3. Load or Cue Video when currentTrack changes
  useEffect(() => {
    if (!isReady || !playerRef.current || !currentTrack?.id) return;
    if (loadedVideoIdRef.current === currentTrack.id) return;

    loadedVideoIdRef.current = currentTrack.id;
    lastSkippedSegmentRef.current = -1;

    try {
      if (isPlayingRef.current) {
        playerRef.current.loadVideoById({
          videoId: currentTrack.id,
          suggestedQuality: 'small',
        });
      } else {
        playerRef.current.cueVideoById({
          videoId: currentTrack.id,
          suggestedQuality: 'small',
        });
      }
    } catch (e) {
      console.warn('Error loading video by id:', e);
    }
  }, [currentTrack?.id, isReady]);

  // 4. Play / Pause Transition Sync
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
    } catch (e) {
      console.warn('Playback state sync error:', e);
    }
  }, [isPlaying, isReady]);

  // 5. Volume & Mute Sync
  useEffect(() => {
    if (!isReady || !playerRef.current) return;
    try {
      playerRef.current.setVolume(volume);
      if (isMuted) playerRef.current.mute();
      else playerRef.current.unMute();
    } catch {}
  }, [volume, isMuted, isReady]);

  // 6. Playback Rate
  useEffect(() => {
    if (!isReady || !playerRef.current) return;
    try {
      playerRef.current.setPlaybackRate(playbackRate);
    } catch {}
  }, [playbackRate, isReady]);

  // 7. Seek to specific time
  useEffect(() => {
    if (!isReady || !playerRef.current || seekToTime === null) return;
    try {
      playerRef.current.seekTo(seekToTime, true);
    } catch {}
  }, [seekToTime, isReady]);

  // 8. Time ticker for real-time progress and SponsorBlock auto-skipping
  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(() => {
      if (!playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') return;
      try {
        const cur = playerRef.current.getCurrentTime() || 0;
        const dur = playerRef.current.getDuration() || 0;
        const state = playerRef.current.getPlayerState?.() ?? -1;

        onPlayerStateChange({
          isPlaying: isPlayingRef.current,
          isBuffering: state === 3,
          duration: dur,
          currentTime: cur,
        });

        // SponsorBlock check
        if (sponsorBlockEnabled && sponsorSegmentsRef.current.length > 0) {
          for (let i = 0; i < sponsorSegmentsRef.current.length; i++) {
            const seg = sponsorSegmentsRef.current[i];
            const [start, end] = seg.segment;
            if (cur >= start && cur < end && lastSkippedSegmentRef.current !== start) {
              lastSkippedSegmentRef.current = start;
              playerRef.current.seekTo(end, true);
              onSponsorSkipped?.(seg);
              break;
            }
          }
        }
      } catch {}
    }, 250);

    return () => clearInterval(interval);
  }, [isReady, sponsorBlockEnabled, onSponsorSkipped, onPlayerStateChange]);

  // 9. OS MediaSession Integration (Lock screen controls)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || 'SimpMusic',
        artwork: [
          { src: currentTrack.thumbnail, sizes: '512x512', type: 'image/jpeg' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (playerRef.current) playerRef.current.playVideo();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (playerRef.current) playerRef.current.pauseVideo();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        onTrackEnded();
      });
    } catch {}
  }, [currentTrack, onTrackEnded]);

  return (
    <div className="fixed -top-[9999px] -left-[9999px] w-64 h-36 opacity-0 pointer-events-none overflow-hidden">
      <div id="simp-yt-player-target" />
    </div>
  );
};
