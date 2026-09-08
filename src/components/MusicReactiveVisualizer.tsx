import React, { useEffect, useRef, useState, memo } from 'react';
import { 
  Sparkles, 
  Waves, 
  BarChart2, 
  Disc, 
  Mic, 
  MicOff, 
  Volume2, 
  Music, 
  Flame, 
  Radio 
} from 'lucide-react';
import { Track } from '../types';
import { 
  isLiveAudioActive, 
  getLiveAnalyserNode, 
  toggleLiveAudio, 
  subscribeLiveAudio,
  shouldAutoStartLiveAudio 
} from '../services/realAudioService';
import { 
  getTrackProgression, 
  synthesizeChordBassSpectrum, 
  ChordInfo, 
  SongSection 
} from '../services/chordBassEngine';

export type VisualizerPreset = 'spectrum' | 'wave' | 'orbit' | 'particles';

interface MusicReactiveVisualizerProps {
  currentTrack: Track;
  isPlaying: boolean;
  isBuffering?: boolean;
  volume?: number; // 0 to 1 or 0 to 100
  currentTime?: number;
  duration?: number;
  seedColor?: string;
  className?: string;
  analyserNode?: AnalyserNode | null;
}

export const MusicReactiveVisualizer: React.FC<MusicReactiveVisualizerProps> = memo(({
  currentTrack,
  isPlaying,
  isBuffering = false,
  volume = 1,
  currentTime = 0,
  duration = 200,
  seedColor = '#FF5252',
  className = '',
  analyserNode: externalAnalyser = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [preset, setPreset] = useState<VisualizerPreset>('spectrum');
  const [isLiveMicActive, setIsLiveMicActive] = useState<boolean>(() => isLiveAudioActive());
  const [bassBoostLevel, setBassBoostLevel] = useState<number>(1.4); // 1.0 = normal, 1.4 = punchy, 2.0 = heavy
  const [activeChordName, setActiveChordName] = useState<string>('');
  const [activeSectionName, setActiveSectionName] = useState<string>('Intro');
  const [activeBassNote, setActiveBassNote] = useState<string>('');

  // Zero-overhead state refs for 60FPS animation loop
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const isBufferingRef = useRef(isBuffering);
  isBufferingRef.current = isBuffering;

  const normalizedVol = volume > 1 ? volume / 100 : volume;
  const volumeRef = useRef(normalizedVol);
  volumeRef.current = normalizedVol;

  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;

  const durationRef = useRef(duration);
  durationRef.current = duration;

  const seedColorRef = useRef(seedColor);
  seedColorRef.current = seedColor;

  const presetRef = useRef(preset);
  presetRef.current = preset;

  const bassBoostRef = useRef(bassBoostLevel);
  bassBoostRef.current = bassBoostLevel;

  const externalAnalyserRef = useRef(externalAnalyser);
  externalAnalyserRef.current = externalAnalyser;

  // Shockwave ripples created by clicks/touches
  const shockwavesRef = useRef<Array<{ x: number; y: number; radius: number; maxRadius: number; strength: number; alpha: number }>>([]);
  const prefersReducedMotionRef = useRef(false);

  // Subscribe to live audio activation changes
  useEffect(() => {
    const unsubscribe = subscribeLiveAudio((active) => {
      setIsLiveMicActive(active);
    });

    if (shouldAutoStartLiveAudio() && !isLiveAudioActive()) {
      // Auto-reconnect if user had previously enabled live audio
      toggleLiveAudio().catch(() => {});
    }

    if (typeof window !== 'undefined' && window.matchMedia) {
      prefersReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // Main High-Precision 60FPS Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = true;

    // Buffer allocations (0 GC per frame)
    const numBars = 48;
    const barValues = new Float32Array(numBars);
    const targetBarValues = new Float32Array(numBars);
    const peakValues = new Float32Array(numBars);
    const peakDecay = new Float32Array(numBars);

    // Dynamic audio energy levels
    let bassEnergy = 0;
    let midEnergy = 0;
    let trebleEnergy = 0;
    let overallEnergy = 0;
    let bassPulse = 0;
    let chordGlow = 0;

    // Particles for Starfield
    const numParticles = prefersReducedMotionRef.current ? 16 : 42;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseRadius: number;
      radius: number;
      alpha: number;
      hueOffset: number;
    }> = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.002,
        vy: -0.001 - Math.random() * 0.003,
        baseRadius: 1.2 + Math.random() * 2.2,
        radius: 2,
        alpha: 0.2 + Math.random() * 0.6,
        hueOffset: (Math.random() - 0.5) * 35,
      });
    }

    // Get harmonic musical chord progression for current track
    const { progression, bpm, genre } = getTrackProgression(currentTrack);

    // Live Web Audio frequency data buffer
    let liveFreqBuffer: Uint8Array | null = null;

    // High DPI Retina display scaling
    const updateSize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(rect.width, 280);
      const h = Math.max(rect.height, 240);

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    };

    updateSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateSize());
      resizeObserver.observe(container);
    }

    let lastFrameTime = performance.now();
    let lastHudUpdate = 0;

    const render = (now: number) => {
      if (!isRunning) return;

      const deltaMs = Math.min(now - lastFrameTime, 100);
      const dt = deltaMs / 1000;
      lastFrameTime = now;

      const rect = container.getBoundingClientRect();
      const width = rect.width || 320;
      const height = rect.height || 260;

      const active = isPlayingRef.current && !isBufferingRef.current;
      const currentVol = volumeRef.current;
      const curTime = currentTimeRef.current;
      const dur = durationRef.current;
      const boost = bassBoostRef.current;

      let rawBass = 0;
      let rawMid = 0;
      let rawTreble = 0;

      // Check for Live Audio AnalyserNode (either from realAudioService mic/speakers or external)
      const activeAnalyser = externalAnalyserRef.current || getLiveAnalyserNode();

      if (activeAnalyser && active) {
        // --- 1. REAL LIVE WEB AUDIO REACTION (100% genuine microphone / speaker loopback FFT) ---
        const binCount = activeAnalyser.frequencyBinCount;
        if (!liveFreqBuffer || liveFreqBuffer.length !== binCount) {
          liveFreqBuffer = new Uint8Array(binCount);
        }

        activeAnalyser.getByteFrequencyData(liveFreqBuffer);

        // Analyze frequency spectrum:
        // Sub-bass & Bass: bins 0 to 12 (approx 20Hz - 250Hz)
        // Chords & Vocals: bins 13 to 80 (approx 250Hz - 2000Hz)
        // Treble & Highs: bins 81 to binCount (approx 2000Hz - 16000Hz)
        const bassEnd = Math.min(14, Math.floor(binCount * 0.08));
        const midEnd = Math.min(90, Math.floor(binCount * 0.35));

        let bSum = 0;
        for (let i = 0; i < bassEnd; i++) bSum += liveFreqBuffer[i];
        rawBass = (bSum / (bassEnd * 255)) * boost;

        let mSum = 0;
        for (let i = bassEnd; i < midEnd; i++) mSum += liveFreqBuffer[i];
        rawMid = mSum / ((midEnd - bassEnd) * 255);

        let tSum = 0;
        for (let i = midEnd; i < binCount; i++) tSum += liveFreqBuffer[i];
        rawTreble = tSum / ((binCount - midEnd) * 255);

        // Map live FFT bins across the 48 visualizer bars with logarithmic distribution
        for (let i = 0; i < numBars; i++) {
          const logFraction = Math.pow(i / numBars, 1.6);
          const binIdx = Math.min(binCount - 1, Math.floor(logFraction * (binCount * 0.75)));
          const rawBin = liveFreqBuffer[binIdx] / 255;

          // Bass boost for lower bars
          const isBassBar = i < 12;
          const barMultiplier = isBassBar ? boost : 1.0;
          targetBarValues[i] = Math.max(0.04, Math.min(1.0, rawBin * barMultiplier * currentVol));
        }

        if (rawBass > 0.65) {
          bassPulse = 1.0;
        }

        // Periodic HUD update (throttled to 100ms)
        if (now - lastHudUpdate > 120) {
          lastHudUpdate = now;
          setActiveChordName('Live FFT Spectrum');
          setActiveSectionName('Real-Time Mic / Audio');
          setActiveBassNote(`${Math.round(rawBass * 100)}% Bass Punch`);
        }
      } else if (active) {
        // --- 2. ACOUSTIC CHORD & BASS HARMONIC SYNTHESIS ENGINE ---
        // Dynamically calculates real chord progressions, 808 sub-bass, and transients
        const result = synthesizeChordBassSpectrum(
          curTime,
          dur,
          progression,
          bpm,
          currentVol,
          numBars
        );

        rawBass = result.bassEnergy * boost;
        rawMid = result.chordEnergy;
        rawTreble = result.trebleEnergy;

        for (let i = 0; i < numBars; i++) {
          const isBassBar = i < 12;
          const barVal = result.bars[i] * (isBassBar ? boost : 1.0);
          targetBarValues[i] = Math.max(0.04, Math.min(1.0, barVal));
        }

        if (result.isBassKick) {
          bassPulse = 1.0;
        }
        if (result.isChordStrum) {
          chordGlow = 0.8;
        }

        // Update HUD state with current chord & song structure
        if (now - lastHudUpdate > 120) {
          lastHudUpdate = now;
          setActiveChordName(`${result.currentChord.name} (${result.currentChord.notes.slice(0, 3).join('-')})`);
          setActiveSectionName(result.section.name);
          setActiveBassNote(`${result.currentChord.rootNote}1 (${Math.round(result.currentChord.rootFreq)} Hz)`);
        }
      } else {
        // Paused state: smooth decay to peaceful rest
        rawBass *= 0.86;
        rawMid *= 0.86;
        rawTreble *= 0.86;
        for (let i = 0; i < numBars; i++) {
          targetBarValues[i] = 0.03;
        }
      }

      // Smooth attack and viscous falloff physics
      const attackFactor = 0.65; // Instantaneous attack on transients
      const decayFactor = 0.14; // Smooth, elastic decay

      bassEnergy += (rawBass - bassEnergy) * (rawBass > bassEnergy ? attackFactor : decayFactor);
      midEnergy += (rawMid - midEnergy) * (rawMid > midEnergy ? attackFactor : decayFactor);
      trebleEnergy += (rawTreble - trebleEnergy) * (rawTreble > trebleEnergy ? attackFactor : decayFactor);
      overallEnergy = bassEnergy * 0.5 + midEnergy * 0.35 + trebleEnergy * 0.15;

      bassPulse = Math.max(0, bassPulse - dt * 3.6);
      chordGlow = Math.max(0, chordGlow - dt * 2.8);

      // Smooth bar values with physics-based gravity for floating peak caps
      for (let i = 0; i < numBars; i++) {
        const target = targetBarValues[i];
        if (target > barValues[i]) {
          barValues[i] += (target - barValues[i]) * 0.65;
        } else {
          barValues[i] += (target - barValues[i]) * 0.18;
        }

        if (barValues[i] >= peakValues[i]) {
          peakValues[i] = barValues[i];
          peakDecay[i] = 0;
        } else {
          peakDecay[i] += dt * 1.6;
          peakValues[i] = Math.max(barValues[i], peakValues[i] - peakDecay[i] * dt);
        }
      }

      // --- RENDER VISUALS ---
      ctx.clearRect(0, 0, width, height);

      const color = seedColorRef.current || '#FF5252';
      const currentPreset = presetRef.current;

      // Dynamic Radial Bass & Chord Ambient Glow
      const cx = width / 2;
      const cy = height / 2;
      const glowRadius = Math.max(width, height) * (0.55 + bassPulse * 0.25);
      const bgGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, glowRadius);
      const glowAlpha = Math.min(0.35, 0.08 + bassEnergy * 0.22 + chordGlow * 0.15);
      
      bgGlow.addColorStop(0, `${color}${Math.floor(glowAlpha * 255).toString(16).padStart(2, '0')}`);
      bgGlow.addColorStop(0.7, `${color}15`);
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Render preset mode
      if (currentPreset === 'spectrum') {
        // --- SPECTRUM MODE: Rounded Frequency Bars + Fluid Harmonic Wave ---
        const barWidth = Math.max(3, (width - (numBars - 1) * 2.5) / numBars);
        const maxBarHeight = height * 0.72;
        const baseY = height - 14;

        // Harmonic Mid Wave Ribbon in Background
        ctx.beginPath();
        ctx.moveTo(0, baseY - 20);
        for (let x = 0; x <= width; x += 12) {
          const normX = x / width;
          const waveY = (
            Math.sin(normX * 6 + now * 0.0035) * (20 * midEnergy + 5) +
            Math.sin(normX * 14 - now * 0.006) * (10 * trebleEnergy)
          );
          ctx.lineTo(x, baseY - 28 - waveY);
        }
        ctx.lineTo(width, baseY);
        ctx.lineTo(0, baseY);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, baseY - 70, 0, baseY);
        waveGrad.addColorStop(0, `${color}45`);
        waveGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
        ctx.fillStyle = waveGrad;
        ctx.fill();

        // Frequency Bars (Sub-bass, Chords, Treble)
        for (let i = 0; i < numBars; i++) {
          const x = i * (barWidth + 2.5) + (width - (numBars * (barWidth + 2.5))) / 2;
          const barHeight = Math.max(4, barValues[i] * maxBarHeight);
          const y = baseY - barHeight;

          // Bass bars (0-12) have extra punchy gradient
          const isBass = i < 12;
          const isChord = i >= 12 && i < 34;

          const barGrad = ctx.createLinearGradient(x, baseY, x, y);
          if (isBass) {
            barGrad.addColorStop(0, `${color}80`);
            barGrad.addColorStop(0.6, color);
            barGrad.addColorStop(1, '#FFFFFF');
          } else if (isChord) {
            barGrad.addColorStop(0, `${color}60`);
            barGrad.addColorStop(0.7, color);
            barGrad.addColorStop(1, '#FFE082');
          } else {
            barGrad.addColorStop(0, `${color}40`);
            barGrad.addColorStop(0.8, '#80DEEA');
            barGrad.addColorStop(1, '#FFFFFF');
          }

          ctx.fillStyle = barGrad;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth, barHeight, [barWidth / 2, barWidth / 2, 2, 2]);
          } else {
            ctx.rect(x, y, barWidth, barHeight);
          }
          ctx.fill();

          // Floating Peak Cap
          const peakY = baseY - Math.max(4, peakValues[i] * maxBarHeight) - 3;
          ctx.fillStyle = isBass ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)';
          ctx.fillRect(x, peakY, barWidth, 2);
        }
      } else if (currentPreset === 'wave') {
        // --- WAVE MODE: Multi-Layered Acoustic Harmonic Curves ---
        const layers = 3;
        for (let l = 0; l < layers; l++) {
          ctx.beginPath();
          const layerOffset = l * 1.5;
          const layerSpeed = 0.0025 + l * 0.001;
          const layerAlpha = 0.35 + (layers - l) * 0.2;

          ctx.moveTo(0, height / 2);
          for (let x = 0; x <= width; x += 8) {
            const normX = x / width;
            const yOffset = (
              Math.sin(normX * (3 + l) + now * layerSpeed + layerOffset) * (45 * bassEnergy + 10) +
              Math.cos(normX * 8 - now * 0.003) * (24 * midEnergy) +
              Math.sin(normX * 16 + now * 0.007) * (14 * trebleEnergy)
            );
            ctx.lineTo(x, height / 2 + yOffset);
          }
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, height * 0.2, 0, height);
          grad.addColorStop(0, `${color}${Math.floor(layerAlpha * 255).toString(16).padStart(2, '0')}`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
          ctx.fillStyle = grad;
          ctx.fill();
        }
      } else if (currentPreset === 'orbit') {
        // --- ORBIT MODE: Radial Circular Spectrum around glowing core ---
        const baseRadius = Math.min(width, height) * 0.22 + bassPulse * 12;

        // Central glowing core
        const coreGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, baseRadius * 1.5);
        coreGlow.addColorStop(0, '#FFFFFF');
        coreGlow.addColorStop(0.4, color);
        coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius * 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Radial Bars
        const radialCount = 44;
        for (let i = 0; i < radialCount; i++) {
          const angle = (i / radialCount) * Math.PI * 2 - Math.PI / 2;
          const barIdx = Math.floor((i / radialCount) * numBars);
          const barLen = Math.max(4, barValues[barIdx] * (Math.min(width, height) * 0.28));

          const x1 = cx + Math.cos(angle) * (baseRadius + 4);
          const y1 = cy + Math.sin(angle) * (baseRadius + 4);
          const x2 = cx + Math.cos(angle) * (baseRadius + 4 + barLen);
          const y2 = cy + Math.sin(angle) * (baseRadius + 4 + barLen);

          ctx.strokeStyle = i < 12 ? '#FFFFFF' : color;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      } else if (currentPreset === 'particles') {
        // --- PARTICLES MODE: Dynamic Stardust reacting to Bass & Chords ---
        ctx.strokeStyle = `${color}90`;
        ctx.lineWidth = 2 + bassEnergy * 5;
        ctx.beginPath();
        ctx.arc(cx, cy, 35 + bassPulse * 35, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4. Update & Render Reactive Stardust Particles across all presets
      const particleSpeedMult = (active ? (1 + trebleEnergy * 2.8) : 0.4) * (prefersReducedMotionRef.current ? 0.4 : 1);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * particleSpeedMult;
        p.y += p.vy * particleSpeedMult;

        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;

        p.radius = p.baseRadius * (1 + trebleEnergy * 1.8 + bassPulse * 1.1);

        const px = p.x * width;
        const py = p.y * height;

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * (0.4 + trebleEnergy * 0.6)})`;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Render Touch/Click Shockwave Ripples
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.radius += dt * 190;
        sw.alpha -= dt * 1.4;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwavesRef.current.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${sw.alpha})`;
        ctx.lineWidth = 2.5 * sw.alpha;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [currentTrack.id, externalAnalyser]);

  // Touch & Click Shockwave
  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    shockwavesRef.current.push({
      x,
      y,
      radius: 6,
      maxRadius: Math.max(rect.width, rect.height) * 0.6,
      strength: 1,
      alpha: 0.95,
    });
  };

  const handleToggleMic = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const active = await toggleLiveAudio();
      setIsLiveMicActive(active);
    } catch {
      setIsLiveMicActive(false);
    }
  };

  const cycleBassBoost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bassBoostLevel === 1.0) setBassBoostLevel(1.5);
    else if (bassBoostLevel === 1.5) setBassBoostLevel(2.0);
    else setBassBoostLevel(1.0);
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none ${className}`}
    >
      {/* 60FPS Reactive Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasInteraction}
        onTouchStart={handleCanvasInteraction}
        className="w-full h-full cursor-pointer active:scale-[0.99] transition-transform duration-150"
      />

      {/* Top Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-auto">
        {/* Audio Mode & Bass Boost Button */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-950/80 border border-white/10 backdrop-blur-xl shadow-lg">
          <button
            onClick={handleToggleMic}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isLiveMicActive
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10'
                : 'text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10'
            }`}
            title={isLiveMicActive ? 'Listening to Device Mic/Speakers (100% Real FFT)' : 'Switch to Live Device Audio (Mic/Speakers Capture)'}
          >
            {isLiveMicActive ? (
              <>
                <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Live Audio Sync</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">Acoustic Engine</span>
              </>
            )}
          </button>

          <button
            onClick={cycleBassBoost}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            title="Cycle Sub-Bass Boost (1x, 1.5x, 2x)"
          >
            <Flame className={`w-3.5 h-3.5 ${bassBoostLevel > 1.0 ? 'text-amber-400' : 'text-neutral-400'}`} />
            <span>{bassBoostLevel === 1.0 ? 'Bass 1x' : bassBoostLevel === 1.5 ? 'Bass 1.5x' : 'Bass 2x'}</span>
          </button>
        </div>

        {/* Preset Switcher Pills */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-neutral-950/80 border border-white/10 backdrop-blur-xl shadow-lg">
          {[
            { id: 'spectrum' as VisualizerPreset, label: 'Bars', icon: BarChart2 },
            { id: 'wave' as VisualizerPreset, label: 'Wave', icon: Waves },
            { id: 'orbit' as VisualizerPreset, label: 'Orbit', icon: Disc },
            { id: 'particles' as VisualizerPreset, label: 'Stars', icon: Sparkles },
          ].map((p) => {
            const Icon = p.icon;
            const isSelected = preset === p.id;
            return (
              <button
                key={p.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setPreset(p.id);
                }}
                className={`p-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title={`${p.label} visualizer`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? seedColor : undefined }} />
                <span className="hidden sm:inline">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Active Chord & Bass HUD Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2 p-1.5 px-3 rounded-2xl bg-neutral-950/85 border border-white/10 backdrop-blur-xl shadow-lg text-[11px] font-medium text-neutral-300">
          <div className="flex items-center gap-1.5">
            <div 
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: seedColor }}
            />
            <span className="font-bold text-white uppercase tracking-wider text-[10px]">
              {isLiveMicActive ? 'Real FFT' : activeSectionName}
            </span>
          </div>

          <span className="text-white/20">•</span>

          <div className="flex items-center gap-1 text-white font-semibold">
            <Music className="w-3 h-3 text-amber-400" />
            <span>{activeChordName || 'Acoustic Harmonics'}</span>
          </div>

          {activeBassNote && (
            <>
              <span className="text-white/20 hidden sm:inline">•</span>
              <span className="text-neutral-400 hidden sm:inline">
                Bass: <span className="text-neutral-200 font-semibold">{activeBassNote}</span>
              </span>
            </>
          )}
        </div>

        <div className="p-1.5 px-2.5 rounded-2xl bg-neutral-950/85 border border-white/10 backdrop-blur-xl shadow-lg text-[10px] font-bold uppercase tracking-wider text-neutral-400 hidden sm:flex items-center gap-1">
          <span>{isPlaying ? 'Playing' : 'Paused'}</span>
        </div>
      </div>
    </div>
  );
});

MusicReactiveVisualizer.displayName = 'MusicReactiveVisualizer';
