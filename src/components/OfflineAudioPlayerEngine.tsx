import React, { useEffect, useRef } from 'react';
import { OfflineTrack } from '../services/offlineStorage';
import { TrackMetadata } from '../types';

interface OfflineAudioPlayerEngineProps {
  currentTrack: OfflineTrack | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onTrackEnd: () => void;
  onProgressUpdate: (metadata: TrackMetadata) => void;
  onBufferingChange: (isBuffering: boolean) => void;
  onDurationKnown?: (duration: number) => void;
}

export const OfflineAudioPlayerEngine: React.FC<OfflineAudioPlayerEngineProps> = ({
  currentTrack,
  isPlaying,
  volume,
  isMuted,
  onTrackEnd,
  onProgressUpdate,
  onBufferingChange,
  onDurationKnown,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const currentTrackRef = useRef<OfflineTrack | null>(currentTrack);
  currentTrackRef.current = currentTrack;

  const callbacksRef = useRef({
    onProgressUpdate,
    onBufferingChange,
    onDurationKnown,
    onTrackEnd,
  });
  callbacksRef.current = {
    onProgressUpdate,
    onBufferingChange,
    onDurationKnown,
    onTrackEnd,
  };

  // Setup single persistent audio element once on mount
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = 'auto';

    const handleTimeUpdate = () => {
      const track = currentTrackRef.current;
      if (!track) return;
      callbacksRef.current.onProgressUpdate({
        title: track.title,
        artist: track.artist,
        author: track.artist,
        videoId: track.id,
        duration: track.duration || 0,
        thumbnail: track.coverArtUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
        currentSeconds: Math.floor(audio.currentTime),
        durationSeconds: Math.floor(audio.duration) || track.duration || 0,
        liveStatus: 'VOD',
        isOfflineSource: true,
      });
    };

    const handleLoadedMetadata = () => {
      if (callbacksRef.current.onDurationKnown && audio.duration) {
        callbacksRef.current.onDurationKnown(Math.floor(audio.duration));
      }
      callbacksRef.current.onBufferingChange(false);
    };

    const handleWaiting = () => callbacksRef.current.onBufferingChange(true);
    const handlePlaying = () => callbacksRef.current.onBufferingChange(false);
    const handleEnded = () => callbacksRef.current.onTrackEnd();
    const handleError = (e: any) => {
      console.warn('Offline audio element event error:', e);
      callbacksRef.current.onBufferingChange(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  // Handle Track Source Changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack && currentTrack.blob) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const url = URL.createObjectURL(currentTrack.blob);
      objectUrlRef.current = url;
      audio.src = url;
      audio.currentTime = 0;
      audio.load();

      if (isPlaying) {
        const p = audio.play();
        if (p !== undefined) {
          p.catch((err) => console.warn('Offline audio play error:', err));
        }
      }
    } else {
      audio.pause();
      audio.src = '';
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    }
  }, [currentTrack?.id]);

  // Handle Play/Pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      const p = audio.play();
      if (p !== undefined) {
        p.catch((err) => console.warn('Offline audio play error:', err));
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle Volume & Mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume / 100));
  }, [volume, isMuted]);

  // Expose global seek handler for scrubbers
  useEffect(() => {
    const handleCustomSeek = (event: CustomEvent<{ seconds: number }>) => {
      const audio = audioRef.current;
      if (audio && event.detail && typeof event.detail.seconds === 'number') {
        audio.currentTime = event.detail.seconds;
      }
    };

    window.addEventListener(
      'app:seek_offline_audio' as any,
      handleCustomSeek as EventListener
    );
    return () => {
      window.removeEventListener(
        'app:seek_offline_audio' as any,
        handleCustomSeek as EventListener
      );
    };
  }, []);

  return null;
};

export function seekOfflineAudio(seconds: number) {
  const event = new CustomEvent('app:seek_offline_audio', { detail: { seconds } });
  window.dispatchEvent(event);
}
