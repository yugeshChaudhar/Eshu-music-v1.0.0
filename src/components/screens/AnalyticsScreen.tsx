import React from 'react';
import { 
  BarChart3, 
  Clock, 
  Flame, 
  Headphones, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Music, 
  Zap 
} from 'lucide-react';
import { UserStats } from '../../types';

interface AnalyticsScreenProps {
  stats: UserStats;
  seedColor?: string;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  stats,
  seedColor = '#FF5252',
}) => {
  const totalMinutes = Math.floor(stats.totalListeningSeconds / 60);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-8 pb-32 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-white/10 shadow-2xl">
        <div 
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ backgroundColor: seedColor }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-neutral-200 mb-3">
            <BarChart3 className="w-3.5 h-3.5" style={{ color: seedColor }} />
            <span>Eshu Music Analytics & Insights</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Your Listening DNA
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
            Real-time playback telemetry, top streamed artists, auto-saved sponsor time, and acoustic stats.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-neutral-900/70 border border-white/10 shadow-xl space-y-1">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Time Streamed</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {totalHours} <span className="text-sm font-normal text-neutral-400">hrs</span>
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-neutral-900/70 border border-white/10 shadow-xl space-y-1">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase">
            <Music className="w-4 h-4 text-[#FF5252]" style={{ color: seedColor }} />
            <span>Songs Played</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.totalPlays} <span className="text-sm font-normal text-neutral-400">plays</span>
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-neutral-900/70 border border-white/10 shadow-xl space-y-1">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sponsor Saved</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            18 <span className="text-sm font-normal text-neutral-400">mins</span>
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-neutral-900/70 border border-white/10 shadow-xl space-y-1">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>AutoEq Active</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            100% <span className="text-sm font-normal text-neutral-400">DSP</span>
          </p>
        </div>
      </div>

      {/* Top Artists & Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Artists */}
        <section className="p-6 rounded-3xl bg-neutral-900/70 border border-white/10 shadow-xl space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#FF5252]" style={{ color: seedColor }} />
            <span>Most Streamed Artists</span>
          </h2>

          <div className="space-y-3">
            {stats.topArtists.slice(0, 5).map((a, idx) => (
              <div key={a.artist} className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-950/60 border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="w-4 text-center font-bold text-xs text-neutral-400">
                    #{idx + 1}
                  </span>
                  {a.thumbnail && (
                    <img src={a.thumbnail} alt={a.artist} className="w-9 h-9 rounded-full object-cover" />
                  )}
                  <span className="text-xs sm:text-sm font-bold text-white">{a.artist}</span>
                </div>
                <span className="text-xs font-bold text-neutral-400 px-2 py-0.5 rounded-md bg-white/5">
                  {a.playCount} plays
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Audio Fidelity Breakdown */}
        <section className="p-6 rounded-3xl bg-neutral-900/70 border border-white/10 shadow-xl space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Headphones className="w-4 h-4 text-cyan-400" />
            <span>Audio Pipeline Breakdown</span>
          </h2>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-neutral-300 mb-1.5">
                <span>High-Fidelity Streams (256 kbps Opus/AAC)</span>
                <span className="text-emerald-400">92%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-neutral-300 mb-1.5">
                <span>AutoEq & Harman DSP Processed</span>
                <span style={{ color: seedColor }}>100%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: '100%', backgroundColor: seedColor }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-neutral-300 mb-1.5">
                <span>Sponsor & Ad-Free Time Saved</span>
                <span className="text-amber-400">100%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
