import React from 'react';
import { Station, TrackMetadata } from '../types';
import { Video, Sparkles, ExternalLink } from 'lucide-react';

interface VideoViewProps {
  station: Station | null;
  currentTrack: TrackMetadata | null;
  isPlaying: boolean;
}

export const VideoView: React.FC<VideoViewProps> = ({
  station,
  currentTrack,
  isPlaying,
}) => {
  const trackTitle = currentTrack?.title || station?.name || 'Casual Radio Stream';
  const trackArtist = currentTrack?.author || station?.tag || 'Relaxing Vibes';
  const videoId = currentTrack?.videoId || station?.videoId;

  return (
    <div id="video-view-container" className="relative flex flex-col items-center justify-center w-full h-full min-h-[460px] md:min-h-[520px] p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Top bar info */}
        <div className="w-full flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              YouTube Video Stream
            </span>
          </div>

          {videoId && (
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
            >
              <span>Open on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Video Player Frame Placeholder / Container Target */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/60 shadow-2xl border border-white/10 flex items-center justify-center">
          {/* Note: The actual YouTube iframe is mounted into #yt-player-target by the engine */}
          <div id="video-player-display-slot" className="w-full h-full flex items-center justify-center">
            <div className="text-center p-6">
              <Video className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
              <p className="text-sm font-bold text-slate-200">{trackTitle}</p>
              <p className="text-xs text-slate-400 mt-1">{trackArtist}</p>
              <p className="text-[11px] text-indigo-400 mt-3 font-mono font-medium">
                {isPlaying ? '▶ Video streaming in player mode' : '⏸ Video paused'}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 text-center max-w-lg">
          <p className="text-xs text-slate-500 font-medium">
            Enjoy casual visual listening. Switch back to Vinyl or Ambient mode anytime for pure focus.
          </p>
        </div>
      </div>
    </div>
  );
};
