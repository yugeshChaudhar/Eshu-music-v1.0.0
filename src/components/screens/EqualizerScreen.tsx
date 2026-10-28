import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Volume2, 
  RotateCcw, 
  Layers, 
  Zap 
} from 'lucide-react';
import { 
  EqualizerPreset, 
  TenBandEqualizer 
} from '../../types';
import { 
  EQUALIZER_PRESETS_10_BAND 
} from '../../data/echoMusicData';

interface EqualizerScreenProps {
  currentPreset: EqualizerPreset;
  tenBandEq: TenBandEqualizer;
  onUpdatePreset: (preset: EqualizerPreset) => void;
  onUpdateTenBandEq: (eq: TenBandEqualizer) => void;
  seedColor?: string;
}

export const EqualizerScreen: React.FC<EqualizerScreenProps> = ({
  currentPreset,
  tenBandEq,
  onUpdatePreset,
  onUpdateTenBandEq,
  seedColor = '#FF5252',
}) => {
  const [bassBoostAmount, setBassBoostAmount] = useState<number>(35);
  const [virtualizerAmount, setVirtualizerAmount] = useState<number>(20);

  const bands: { key: keyof TenBandEqualizer; label: string; freq: string }[] = [
    { key: 'b31', label: '31 Hz', freq: 'Sub-Bass' },
    { key: 'b62', label: '62 Hz', freq: 'Bass' },
    { key: 'b125', label: '125 Hz', freq: 'Upper Bass' },
    { key: 'b250', label: '250 Hz', freq: 'Warmth' },
    { key: 'b500', label: '500 Hz', freq: 'Body' },
    { key: 'b1k', label: '1 kHz', freq: 'Midrange' },
    { key: 'b2k', label: '2 kHz', freq: 'Presence' },
    { key: 'b4k', label: '4 kHz', freq: 'Clarity' },
    { key: 'b8k', label: '8 kHz', freq: 'Brightness' },
    { key: 'b16k', label: '16 kHz', freq: 'Air' },
  ];

  const presetsList: EqualizerPreset[] = [
    'flat',
    'bass-boost',
    'treble-boost',
    'vocal',
    'acoustic',
    'rock',
    'electronic',
    'chill',
    'hip-hop',
    'jazz',
    'dance',
    'pop',
  ];

  const handleBandChange = (key: keyof TenBandEqualizer, value: number) => {
    const updated = { ...tenBandEq, [key]: value };
    onUpdateTenBandEq(updated);
  };

  const handleResetFlat = () => {
    onUpdatePreset('flat');
    onUpdateTenBandEq(EQUALIZER_PRESETS_10_BAND.flat);
  };

  return (
    <div className="space-y-8 pb-32 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-white/10 shadow-2xl">
        <div 
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ backgroundColor: seedColor }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-neutral-200 mb-3">
              <Sliders className="w-3.5 h-3.5" style={{ color: seedColor }} />
              <span>Eshu Audio Engine • 10-Band Graphic DSP</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Equalizer
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-xl">
              Sculpt your sound with our 10-band studio parametric equalizer and audio presets.
            </p>
          </div>

          <button
            onClick={handleResetFlat}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition-all self-start md:self-auto"
          >
            <RotateCcw className="w-4 h-4 text-neutral-300" />
            <span>Reset to Flat</span>
          </button>
        </div>
      </div>

      {/* Presets Horizontal Row */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
          Presets
        </h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {presetsList.map((preset) => {
            const isSelected = currentPreset === preset;
            return (
              <button
                key={preset}
                onClick={() => {
                  onUpdatePreset(preset);
                  onUpdateTenBandEq(EQUALIZER_PRESETS_10_BAND[preset]);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold capitalize whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'text-black border-transparent shadow-lg scale-105'
                    : 'bg-neutral-900/80 text-neutral-300 border-white/10 hover:bg-neutral-800 hover:text-white'
                }`}
                style={{
                  backgroundColor: isSelected ? seedColor : undefined,
                }}
              >
                {preset.replace('-', ' ')}
              </button>
            );
          })}
        </div>
      </section>

      {/* 10-Band Graphic Equalizer DSP Visualizer */}
      <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border border-white/15 shadow-2xl space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-neutral-400" />
            <h3 className="text-sm font-bold text-white">
              10-Band Sliders (-12 dB to +12 dB)
            </h3>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            Output: 48kHz / 24-bit Floating Point
          </span>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 sm:gap-4 items-end justify-items-center h-64 sm:h-72 pt-4">
          {bands.map((band) => {
            const val = tenBandEq[band.key] ?? 0;
            return (
              <div key={band.key} className="flex flex-col items-center justify-between h-full w-full">
                {/* dB Value readout */}
                <span className="text-[11px] font-mono font-bold text-neutral-300">
                  {val > 0 ? `+${val}` : val} dB
                </span>

                {/* Vertical Range Slider */}
                <div className="relative flex items-center justify-center h-44 sm:h-48 my-2">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={val}
                    onChange={(e) => handleBandChange(band.key, parseInt(e.target.value))}
                    className="w-40 sm:w-44 -rotate-90 origin-center accent-[#FF5252] cursor-pointer"
                    style={{ accentColor: seedColor }}
                  />
                </div>

                {/* Frequency & Label */}
                <div className="text-center mt-2">
                  <div className="text-[11px] font-bold text-white whitespace-nowrap">
                    {band.label}
                  </div>
                  <div className="text-[9px] text-neutral-400 font-medium hidden sm:block">
                    {band.freq}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rotary Knobs (Bass Boost & Spatial Virtualizer) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-xs font-bold text-white">Dynamic Bass Boost</h4>
                <p className="text-[11px] text-neutral-400">Sub-bass harmonic synthesizer</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={bassBoostAmount}
                onChange={(e) => setBassBoostAmount(parseInt(e.target.value))}
                className="w-24 sm:w-32 cursor-pointer"
                style={{ accentColor: seedColor }}
              />
              <span className="text-xs font-mono font-bold text-white w-8 text-right">
                {bassBoostAmount}%
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="text-xs font-bold text-white">Soundstage Virtualizer</h4>
                <p className="text-[11px] text-neutral-400">3D Binaural spatial wideness</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={virtualizerAmount}
                onChange={(e) => setVirtualizerAmount(parseInt(e.target.value))}
                className="w-24 sm:w-32 cursor-pointer"
                style={{ accentColor: seedColor }}
              />
              <span className="text-xs font-mono font-bold text-white w-8 text-right">
                {virtualizerAmount}%
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
