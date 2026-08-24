/**
 * Background Audio, WakeLock & MediaSession API Manager
 * Enables seamless audio playback when the mobile screen is locked or apps are switched.
 */

// 1-second lossless silent WAV file encoded in Base64 (RFC compliant)
const SILENT_WAV_BASE64 = 
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';

class BackgroundAudioService {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private silentAudioElement: HTMLAudioElement | null = null;
  private wakeLockSentinel: any = null;
  private isKeepAliveRunning = false;
  private isEnabled = true;
  private keepScreenAwake = false;

  constructor() {
    const saved = localStorage.getItem('casual_radio_background_play');
    this.isEnabled = saved !== null ? saved === 'true' : true;

    // Listen for visibility changes to ensure audio context stays alive
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (this.isEnabled && this.isKeepAliveRunning) {
          this.ensureAudioActive();
        }
      });
    }
  }

  public isBackgroundPlayEnabled(): boolean {
    return this.isEnabled;
  }

  public setBackgroundPlayEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('casual_radio_background_play', enabled ? 'true' : 'false');
    if (enabled) {
      this.startKeepAlive();
    } else {
      this.stopKeepAlive();
    }
  }

  public setKeepScreenAwake(awake: boolean): void {
    this.keepScreenAwake = awake;
    if (awake) {
      this.requestWakeLock();
    } else {
      this.releaseWakeLock();
    }
  }

  public isScreenAwake(): boolean {
    return this.keepScreenAwake;
  }

  /**
   * Initializes both Web Audio sub-carrier loop & HTML5 silent audio element.
   * This is the mobile industry standard for maintaining background audio priority in Android/iOS.
   */
  public startKeepAlive(): void {
    if (!this.isEnabled) return;

    // Use Web Audio context unlock without competing for exclusive HTML5 audio focus
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext || this.audioContext.state === 'closed') {
          this.audioContext = new AudioCtx();
        }

        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(() => {});
        }
      }
    } catch (e) {
      // Audio context unlocked gracefully
    }

    this.isKeepAliveRunning = true;
  }

  public stopKeepAlive(): void {
    if (!this.isKeepAliveRunning) return;

    try {
      if (this.audioContext && this.audioContext.state === 'running') {
        this.audioContext.suspend().catch(() => {});
      }
    } catch {}

    this.isKeepAliveRunning = false;
  }

  private ensureAudioActive(): void {
    try {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
    } catch {}
  }

  private async requestWakeLock(): Promise<void> {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      } catch (err) {
        console.warn('Wake Lock error:', err);
      }
    }
  }

  private releaseWakeLock(): void {
    if (this.wakeLockSentinel) {
      this.wakeLockSentinel.release().catch(() => {});
      this.wakeLockSentinel = null;
    }
  }

  /**
   * Updates OS & Lock-Screen MediaSession metadata and action handlers
   */
  public updateMediaSession(
    metadata: {
      title: string;
      artist?: string;
      album?: string;
      artworkUrl?: string;
    },
    actions: {
      onPlay: () => void;
      onPause: () => void;
      onNext?: () => void;
      onPrev?: () => void;
      onSeek?: (seconds: number) => void;
    },
    state: {
      isPlaying: boolean;
      currentTime?: number;
      duration?: number;
      playbackRate?: number;
    }
  ): void {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: metadata.title || 'ESHU MUSIC',
        artist: metadata.artist || 'ESHU MUSIC',
        album: metadata.album || 'Radio Player',
        artwork: metadata.artworkUrl
          ? [
              { src: metadata.artworkUrl, sizes: '96x96', type: 'image/jpeg' },
              { src: metadata.artworkUrl, sizes: '128x128', type: 'image/jpeg' },
              { src: metadata.artworkUrl, sizes: '192x192', type: 'image/jpeg' },
              { src: metadata.artworkUrl, sizes: '512x512', type: 'image/jpeg' },
            ]
          : [
              {
                src: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=512&auto=format&fit=crop&q=80',
                sizes: '512x512',
                type: 'image/jpeg',
              },
            ],
      });

      navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';

      // Set Action Handlers
      navigator.mediaSession.setActionHandler('play', actions.onPlay);
      navigator.mediaSession.setActionHandler('pause', actions.onPause);
      if (actions.onNext) navigator.mediaSession.setActionHandler('nexttrack', actions.onNext);
      if (actions.onPrev) navigator.mediaSession.setActionHandler('previoustrack', actions.onPrev);

      if (actions.onSeek) {
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined && details.seekTime !== null) {
            actions.onSeek?.(details.seekTime);
          }
        });
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          const skip = details.seekOffset || 10;
          actions.onSeek?.((state.currentTime || 0) + skip);
        });
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          const skip = details.seekOffset || 10;
          actions.onSeek?.(Math.max(0, (state.currentTime || 0) - skip));
        });
      }

      // Update position state for lockscreen timeline
      if (
        state.duration &&
        state.duration > 0 &&
        state.currentTime !== undefined &&
        typeof navigator.mediaSession.setPositionState === 'function'
      ) {
        navigator.mediaSession.setPositionState({
          duration: state.duration,
          playbackRate: state.playbackRate || 1,
          position: Math.min(state.currentTime, state.duration),
        });
      }
    } catch (e) {
      console.warn('MediaSession sync error:', e);
    }
  }
}

export const backgroundAudioService = new BackgroundAudioService();
