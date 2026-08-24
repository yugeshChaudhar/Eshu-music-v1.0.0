import React from 'react';
import { X, Sparkles, ShieldCheck, Mic2, Disc, Github, Check } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const updates = [
    {
      title: 'SimpMusic v1.2.0 Web Released',
      desc: 'Complete high-fidelity port with LRCLIB synchronized lyrics, SponsorBlock auto-skipping, and YouTube Music streams.',
      date: 'Today',
      icon: Sparkles,
      color: 'text-[#8ECAE6] bg-[#8ECAE6]/15',
    },
    {
      title: 'Real-time Karaoke Lyrics',
      desc: 'Timestamped synchronized lyrics powered by LRCLIB and SimpMusic lyrics engine with multi-source fallback.',
      date: 'New Feature',
      icon: Mic2,
      color: 'text-[#FFFF00] bg-[#FFFF00]/15',
    },
    {
      title: 'SponsorBlock Auto-Skip Enabled',
      desc: 'Automatically skips intros, video sponsors, and silent portions of official music video audio.',
      date: 'Active',
      icon: ShieldCheck,
      color: 'text-[#06D6A0] bg-[#06D6A0]/15',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-neutral-900 border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8ECAE6]" />
            <span>Updates & Release Notes</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {updates.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-neutral-800/60 border border-white/10 flex items-start gap-3"
              >
                <div className={`p-2 rounded-xl shrink-0 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <span className="text-[10px] font-semibold text-neutral-400">{item.date}</span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
