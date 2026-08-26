import { Track } from '../types';

let audioCtx: AudioContext | null = null;
let silentSource: AudioBufferSourceNode | null = null;
let isKeepAliveActive = false;

/**
 * Initializes an ultra-low-power silent audio loop using Web Audio API.
 * This guarantees browser media threads (on mobile browsers like Chrome for Android,
 * Safari on iOS, and background desktop tabs) retain continuous background execution
 * permissions without cutting audio off when screen locks or tabs switch.
 */
export function ensureBackgroundAudioKeepAlive(): void {
  if (isKeepAliveActive && audioCtx && audioCtx.state === 'running') {
    return;
  }

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Create a 1-second silent buffer
    const sampleRate = audioCtx.sampleRate || 44100;
    const buffer = audioCtx.createBuffer(1, sampleRate, sampleRate);
    // Data is zero-filled by default (silence)

    if (silentSource) {
      try {
        silentSource.stop();
        silentSource.disconnect();
      } catch {}
    }

    silentSource = audioCtx.createBufferSource();
    silentSource.buffer = buffer;
    silentSource.loop = true;

    // Connect to gain with minimal volume to prevent any audible glitch
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.001; // Virtually silent, keeps OS audio pipeline hot

    silentSource.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    silentSource.start(0);

    isKeepAliveActive = true;
  } catch (err) {
    console.warn('Background audio keepalive initialization:', err);
  }
}

/**
 * Synchronizes the system MediaSession API metadata and system action handlers.
 */
export function updateMediaSessionMetadata({
  track,
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onSeek,
}: {
  track: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (seconds: number) => void;
}): void {
  if (!('mediaSession' in navigator)) return;

  try {
    ensureBackgroundAudioKeepAlive();

    const artworkUrl = track.thumbnail || `https://img.youtube.com/vi/${track.id}/hqdefault.jpg`;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album || 'Eshu Music',
      artwork: [
        { src: artworkUrl, sizes: '96x96', type: 'image/jpeg' },
        { src: artworkUrl, sizes: '128x128', type: 'image/jpeg' },
        { src: artworkUrl, sizes: '192x192', type: 'image/jpeg' },
        { src: artworkUrl, sizes: '256x256', type: 'image/jpeg' },
        { src: artworkUrl, sizes: '384x384', type: 'image/jpeg' },
        { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' },
      ],
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    navigator.mediaSession.setActionHandler('play', onPlay);
    navigator.mediaSession.setActionHandler('pause', onPause);
    navigator.mediaSession.setActionHandler('previoustrack', onPrev);
    navigator.mediaSession.setActionHandler('nexttrack', onNext);

    try {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && details.seekTime !== null) {
          onSeek(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10;
        onSeek(Math.max(0, currentTime - offset));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 10;
        onSeek(Math.min(duration || 300, currentTime + offset));
      });
    } catch {}

    // Position state
    if ('setPositionState' in navigator.mediaSession && duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(duration, 1),
          playbackRate: 1.0,
          position: Math.max(0, Math.min(currentTime, duration)),
        });
      } catch {}
    }
  } catch (err) {
    console.warn('MediaSession sync error:', err);
  }
}
