import React, { useState } from 'react';
import { X, Timer, Moon, Check, Play, Square } from 'lucide-react';
import { SleepTimerState } from '../types';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sleepTimer: SleepTimerState;
  onStartTimer: (minutes: number, fadeOut: boolean) => void;
  onCancelTimer: () => void;
}

const PRESET_MINUTES = [15, 30, 45, 60, 90, 120];

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  sleepTimer,
  onStartTimer,
  onCancelTimer,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
  const [customInput, setCustomInput] = useState<string>('');
  const [fadeOut, setFadeOut] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleStart = () => {
    const mins = customInput ? parseInt(customInput, 10) : selectedMinutes;
    if (mins && mins > 0) {
      onStartTimer(mins, fadeOut);
      onClose();
    }
  };

  const handleStop = () => {
    onCancelTimer();
    onClose();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div id="sleep-timer-backdrop" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        id="sleep-timer-dialog"
        className="relative w-full max-w-md flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#0E0F14] border-t sm:border border-white/10 shadow-2xl overflow-hidden pb-[env(safe-area-inset-bottom,16px)]"
      >
        {/* Mobile Swipe Handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-5 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)] shrink-0">
              <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight">Sleep Timer</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Auto-pause playback when you fall asleep</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Active Timer Status */}
          {sleepTimer.active ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center space-y-2">
              <span className="text-[11px] text-indigo-300 font-semibold uppercase tracking-wider">Timer is running</span>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-slate-100 tracking-wider">
                {formatTimer(sleepTimer.remainingSeconds)}
              </div>
              <p className="text-[11px] text-slate-400">
                Playback will automatically pause at 0:00
              </p>

              <button
                onClick={handleStop}
                className="mt-3 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 mx-auto transition-colors active:scale-95 min-h-[40px]"
              >
                <Square className="w-3.5 h-3.5 fill-rose-300" />
                <span>Cancel Timer</span>
              </button>
            </div>
          ) : (
            <>
              {/* Presets Grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_MINUTES.map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        setSelectedMinutes(mins);
                        setCustomInput('');
                      }}
                      className={`p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-mono font-bold transition-all min-h-[44px] ${
                        selectedMinutes === mins && !customInput
                          ? 'bg-indigo-500/25 border-indigo-500/50 text-indigo-200 shadow-sm'
                          : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5 text-slate-300'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Or Custom Minutes
                </label>
                <input
                  type="number"
                  placeholder="e.g. 20"
                  min={1}
                  max={480}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 min-h-[40px]"
                />
              </div>

              {/* Smooth Fade Out Toggle */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={fadeOut}
                  onChange={(e) => setFadeOut(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Gentle Volume Fade Out
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Slowly lower volume during the final 60 seconds
                  </span>
                </div>
              </label>

              {/* Start Button */}
              <button
                onClick={handleStart}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Sleep Timer ({customInput ? `${customInput}m` : `${selectedMinutes}m`})</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
