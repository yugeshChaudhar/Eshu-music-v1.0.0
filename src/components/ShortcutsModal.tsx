import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Space', desc: 'Play / Pause stream' },
  { key: '← / →', desc: 'Seek 5 seconds backward / forward' },
  { key: 'Shift + N', desc: 'Next track in playlist' },
  { key: 'Shift + P', desc: 'Previous track in playlist' },
  { key: 'M', desc: 'Toggle Mute / Unmute' },
  { key: 'S', desc: 'Toggle Shuffle mode' },
  { key: 'L', desc: 'Toggle Repeat / Loop mode' },
  { key: 'F', desc: 'Toggle Fullscreen focus' },
  { key: '1, 2, 3, 4', desc: 'Switch View (Vinyl / Ambient / Zen / Video)' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div id="shortcuts-modal-backdrop" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        id="shortcuts-modal-dialog"
        className="relative w-full max-w-md max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#0E0F14] border-t sm:border border-white/10 shadow-2xl overflow-hidden pb-[env(safe-area-inset-bottom,16px)]"
      >
        {/* Mobile Swipe Handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-5 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)] shrink-0">
              <Keyboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight">Keyboard Shortcuts</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Quick keys for desktop control</p>
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
        <div className="p-4 sm:p-6 space-y-1.5 sm:space-y-2 overflow-y-auto touch-pan-y">
          {SHORTCUTS.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/5"
            >
              <span className="text-xs text-slate-300 font-medium">{sc.desc}</span>
              <kbd className="px-2 sm:px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-indigo-300 font-mono text-[10px] sm:text-[11px] font-bold shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
