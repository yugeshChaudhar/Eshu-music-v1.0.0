import React, { useEffect, useState, memo } from 'react';
import { Station, TrackMetadata } from '../types';
import { Music, RotateCcw, Clock, Wind, Flame } from 'lucide-react';
import { AudioVisualizerCanvas } from './AudioVisualizerCanvas';
import { CoverColorPalette } from '../services/colorSyncService';

interface ZenViewProps {
  station: Station | null;
  currentTrack: TrackMetadata | null;
  isPlaying: boolean;
  volume?: number;
  isMuted?: boolean;
  palette?: CoverColorPalette;
}

export const ZenView: React.FC<ZenViewProps> = memo(({
  station,
  currentTrack,
  isPlaying,
  volume = 0.8,
  isMuted = false,
  palette,
}) => {
  const [mode, setMode] = useState<'breathe' | 'pomodoro' | 'clock'>('breathe');
  const [time, setTime] = useState<Date>(new Date());
  const [breathState, setBreathState] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  // Pomodoro timer states
  const [pomoMinutes, setPomoMinutes] = useState<number>(25);
  const [pomoSecondsLeft, setPomoSecondsLeft] = useState<number>(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Breathing cycle
  useEffect(() => {
    if (mode !== 'breathe') return;
    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % 3;
      if (step === 0) setBreathState('Inhale');
      else if (step === 1) setBreathState('Hold');
      else setBreathState('Exhale');
    }, 4000);

    return () => clearInterval(interval);
  }, [mode]);

  // Pomodoro countdown
  useEffect(() => {
    if (!isPomoRunning || pomoSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setPomoSecondsLeft(prev => {
        if (prev <= 1) {
          setIsPomoRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPomoRunning, pomoSecondsLeft]);

  const handleSetPomo = (mins: number) => {
    setPomoMinutes(mins);
    setPomoSecondsLeft(mins * 60);
    setIsPomoRunning(false);
  };

  const formatPomoTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const hours = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = time.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  const trackTitle = currentTrack?.title || station?.name || 'ESHU MUSIC';
  const trackArtist = currentTrack?.author || station?.tag || 'Relaxing Vibes';

  return (
    <div id="zen-view-container" className="relative flex flex-col items-center justify-center w-full h-full p-2 sm:p-4 text-center select-none overflow-hidden max-h-full my-auto">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/[0.04] border border-white/5 mb-2 sm:mb-4">
        <button
          onClick={() => setMode('breathe')}
          className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
            mode === 'breathe' ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Breathe</span>
        </button>
        <button
          onClick={() => setMode('pomodoro')}
          className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
            mode === 'pomodoro' ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Focus</span>
        </button>
        <button
          onClick={() => setMode('clock')}
          className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
            mode === 'clock' ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Clock</span>
        </button>
      </div>

      {/* Responsive Zen Atmosphere Ring */}
      <div className="relative mb-2 sm:mb-4 flex items-center justify-center shrink-0">
        <div 
          className="absolute w-[min(55vh,360px)] h-[min(55vh,360px)] rounded-full blur-[70px] pointer-events-none -z-10 transition-all duration-1000"
          style={{
            background: palette ? palette.ambientGlow : 'rgba(99, 102, 241, 0.15)',
          }}
        />

        <div
          onClick={() => {
            if (mode === 'pomodoro') setIsPomoRunning(!isPomoRunning);
          }}
          className={`w-[min(34vh,230px)] h-[min(34vh,230px)] xs:w-[min(38vh,260px)] xs:h-[min(38vh,260px)] sm:w-[min(42vh,290px)] sm:h-[min(42vh,290px)] rounded-full border flex items-center justify-center transition-all duration-[2000ms] ease-in-out bg-slate-900/50 backdrop-blur-xl shadow-2xl ${
            mode === 'pomodoro' ? 'cursor-pointer hover:border-indigo-500/40 active:scale-95' : ''
          }`}
          style={{
            transform: mode === 'breathe' 
              ? (breathState === 'Inhale' || breathState === 'Hold' ? 'scale(1.06)' : 'scale(0.94)')
              : 'scale(1)',
            borderColor: mode === 'breathe' && breathState === 'Inhale' 
              ? (palette ? palette.primary : '#6366F1') 
              : 'rgba(255,255,255,0.1)',
            boxShadow: mode === 'breathe' && breathState === 'Inhale' 
              ? (palette ? `0 0 40px ${palette.ambientGlow}` : '0 0 40px rgba(99,102,241,0.3)') 
              : 'none',
          }}
        >
          <div className="flex flex-col items-center p-2">
            {mode === 'breathe' && (
              <>
                <span className="text-xl xs:text-2xl sm:text-3xl font-black tracking-tight text-slate-100 font-mono">
                  {breathState}
                </span>
                <span className="text-[10px] sm:text-xs text-indigo-300 tracking-widest uppercase font-mono mt-1 font-semibold">
                  4s Rhythm Loop
                </span>
              </>
            )}

            {mode === 'pomodoro' && (
              <>
                <span className="font-mono text-2xl xs:text-3xl sm:text-4xl font-black tracking-tight text-slate-100 drop-shadow-md">
                  {formatPomoTime(pomoSecondsLeft)}
                </span>
                <span className="text-[10px] text-slate-400 tracking-widest uppercase font-mono mt-1 font-medium flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isPomoRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {isPomoRunning ? 'Focusing' : 'Tap to Start'}
                </span>
              </>
            )}

            {mode === 'clock' && (
              <>
                <span className="font-mono text-xl xs:text-2xl sm:text-3xl font-black tracking-tight text-slate-100 drop-shadow-md">
                  {hours}
                </span>
                <span className="text-[10px] text-slate-400 tracking-widest uppercase font-mono mt-1 font-medium">
                  {dateStr}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pomodoro Interactive Controls */}
      {mode === 'pomodoro' && (
        <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
          {[15, 25, 45, 5].map((mins) => (
            <button
              key={mins}
              onClick={() => handleSetPomo(mins)}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                pomoMinutes === mins
                  ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40 shadow-sm'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
              }`}
            >
              {mins === 5 ? '5m Break' : `${mins}m`}
            </button>
          ))}

          <button
            onClick={() => handleSetPomo(pomoMinutes)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 flex items-center justify-center cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Minimal Track Details */}
      <div className="w-full max-w-sm px-2 flex flex-col items-center">
        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
          <Music className="w-3 h-3 text-indigo-400" />
          <span className="truncate max-w-[200px]">{station?.name}</span>
        </div>
        <h3 className="text-xs sm:text-sm md:text-base font-semibold text-slate-100 line-clamp-1">
          {trackTitle}
        </h3>

        {/* Fluid Waveform Visualizer */}
        <div className="w-full mt-1.5">
          <AudioVisualizerCanvas
            isPlaying={isPlaying}
            volume={volume}
            isMuted={isMuted}
            stationTag={station?.tag || ''}
            accentColor={palette?.primary || station?.color || '#6366F1'}
            mode="wave"
            showModeSelector={false}
            height={30}
            barCount={28}
            interactive={true}
          />
        </div>
      </div>
    </div>
  );
});

ZenView.displayName = 'ZenView';
