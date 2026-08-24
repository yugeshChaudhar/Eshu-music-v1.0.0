import React, { useEffect, useRef, useState, memo } from 'react';
import { Sparkles, Disc, Waves, BarChart2, Zap, Activity } from 'lucide-react';

export type VisualizerMode = 'bars' | 'wave' | 'orbit' | 'particles';
export type BeatIntensity = 'gentle' | 'dynamic' | 'bass_heavy';

interface AudioVisualizerCanvasProps {
  isPlaying: boolean;
  isBuffering?: boolean;
  volume?: number;
  isMuted?: boolean;
  accentColor?: string;
  stationTag?: string;
  mode?: VisualizerMode;
  onModeChange?: (mode: VisualizerMode) => void;
  showModeSelector?: boolean;
  showBeatControls?: boolean;
  height?: number;
  barCount?: number;
  className?: string;
  interactive?: boolean;
}

function getBaseBpmForTag(tag: string): number {
  const t = (tag || '').toLowerCase();
  if (t.includes('synth') || t.includes('cyber') || t.includes('dance') || t.includes('retro') || t.includes('wave')) return 120;
  if (t.includes('lofi') || t.includes('chill') || t.includes('study') || t.includes('hip')) return 80;
  if (t.includes('jazz') || t.includes('night') || t.includes('cozy') || t.includes('coffee')) return 74;
  if (t.includes('piano') || t.includes('sleep') || t.includes('peace') || t.includes('ambient') || t.includes('meditat')) return 64;
  if (t.includes('acoustic') || t.includes('indie') || t.includes('pop')) return 96;
  return 82;
}

export const AudioVisualizerCanvas: React.FC<AudioVisualizerCanvasProps> = memo(({
  isPlaying,
  isBuffering = false,
  volume = 0.8,
  isMuted = false,
  accentColor = '#818CF8',
  stationTag = '',
  mode = 'bars',
  onModeChange,
  showModeSelector = false,
  showBeatControls = false,
  height = 54,
  barCount = 32,
  className = '',
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const beatDotsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const bpmDisplayRef = useRef<HTMLSpanElement | null>(null);

  const [currentMode, setCurrentMode] = useState<VisualizerMode>(mode);
  const [beatIntensity, setBeatIntensity] = useState<BeatIntensity>('dynamic');

  // State refs for zero-overhead 60fps canvas loop
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const isBufferingRef = useRef(isBuffering);
  isBufferingRef.current = isBuffering;

  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const accentColorRef = useRef(accentColor);
  accentColorRef.current = accentColor;

  const currentModeRef = useRef(currentMode);
  currentModeRef.current = currentMode;

  const beatIntensityRef = useRef(beatIntensity);
  beatIntensityRef.current = beatIntensity;

  const interactiveRef = useRef(interactive);
  interactiveRef.current = interactive;

  const stationTagRef = useRef(stationTag);
  stationTagRef.current = stationTag;

  // Real-time Automatic Beat & BPM Tracker
  const currentBpmRef = useRef<number>(getBaseBpmForTag(stationTag));
  const targetBpmRef = useRef<number>(getBaseBpmForTag(stationTag));
  const lastBpmTextUpdateRef = useRef<number>(0);

  // Auto-adapt target BPM whenever stationTag changes without causing React re-renders
  useEffect(() => {
    const newBase = getBaseBpmForTag(stationTag);
    targetBpmRef.current = newBase;
  }, [stationTag]);

  const mouseRef = useRef<{ x: number; y: number; isHovering: boolean }>({
    x: -100,
    y: -100,
    isHovering: false,
  });
  const shockwavesRef = useRef<Array<{ x: number; y: number; radius: number; maxRadius: number; strength: number }>>([]);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const handleModeToggle = (newMode: VisualizerMode) => {
    setCurrentMode(newMode);
    if (onModeChange) onModeChange(newMode);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    const numBars = barCount;
    const barValues = new Float32Array(numBars);
    const barTargetValues = new Float32Array(numBars);
    const peakValues = new Float32Array(numBars);
    const peakDecay = new Float32Array(numBars);

    const numParticles = 35;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      baseSpeed: number;
    }> = [];

    let width = container.clientWidth || 300;
    let canvasHeight = height || 54;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setupCanvasSize = (newWidth: number, newHeight: number) => {
      width = Math.max(newWidth, 100);
      canvasHeight = Math.max(newHeight, 30);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(canvasHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particles.length === 0) {
        for (let i = 0; i < numParticles; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * canvasHeight,
            vx: (Math.random() - 0.5) * 1.2,
            vy: (Math.random() - 0.5) * 1.2,
            radius: Math.random() * 2.0 + 1,
            alpha: Math.random() * 0.6 + 0.2,
            baseSpeed: Math.random() * 0.5 + 0.8,
          });
        }
      }
    };

    setupCanvasSize(container.clientWidth || 300, height);

    // Use ResizeObserver for seamless zero-overhead responsive resizing (NO getBoundingClientRect in render loop)
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const cr = entry.contentRect;
          if (cr.width > 0 && cr.height > 0) {
            setupCanvasSize(cr.width, height || cr.height);
          }
        }
      });
      resizeObserver.observe(container);
    }

    const startTime = performance.now() / 1000;
    let lastTime = startTime;
    let lastBeatIndex = -1;

    // Energy tracking for automatic real-time BPM detection
    let lastTransientTime = startTime;
    let prevBassEnergy = 0;
    const transientIntervals: number[] = [];

    const render = (nowMs: number) => {
      const now = nowMs / 1000;
      const dt = Math.min(now - lastTime, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, canvasHeight);

      const isPlayingVal = isPlayingRef.current;
      const isBufferingVal = isBufferingRef.current;
      const isMutedVal = isMutedRef.current;
      const volumeVal = volumeRef.current;
      const effectiveVolume = isMutedVal ? 0 : Math.max(0, Math.min(1, volumeVal));
      const modeVal = currentModeRef.current;
      const intensityVal = beatIntensityRef.current;
      const intensityMultiplier = intensityVal === 'bass_heavy' ? 1.5 : (intensityVal === 'gentle' ? 0.7 : 1.15);

      // Real audio frequency capture
      // Smoothly converge currentBpm to targetBpm
      currentBpmRef.current += (targetBpmRef.current - currentBpmRef.current) * (dt * 1.5);
      const bpm = Math.max(50, Math.min(180, currentBpmRef.current));
      const beatInterval = 60 / bpm;

      // Update DOM BPM badge at ~4Hz max to avoid layout costs while showing live auto tempo
      if (now - lastBpmTextUpdateRef.current > 0.25) {
        lastBpmTextUpdateRef.current = now;
        if (bpmDisplayRef.current) {
          bpmDisplayRef.current.textContent = `${Math.round(bpm)} BPM`;
        }
      }

      const songTime = now - startTime;
      const rawBeatNumber = songTime / beatInterval;
      const currentBeatInt = Math.floor(rawBeatNumber);
      const beatFraction = rawBeatNumber - currentBeatInt;
      const currentMeasureBeat = currentBeatInt % 4;

      // Direct DOM beat step indicator update without triggering React re-renders
      if (currentBeatInt !== lastBeatIndex) {
        lastBeatIndex = currentBeatInt;
        beatDotsRef.current.forEach((dot, idx) => {
          if (!dot) return;
          if (isPlayingVal && !isBufferingVal && idx === currentMeasureBeat) {
            dot.style.opacity = '1';
            dot.style.transform = idx === 0 ? 'scale(1.5)' : 'scale(1.25)';
            dot.style.backgroundColor = '#818CF8';
            dot.style.boxShadow = idx === 0 ? '0 0 8px #818CF8' : 'none';
          } else {
            dot.style.opacity = '0.2';
            dot.style.transform = 'scale(1)';
            dot.style.backgroundColor = '#FFFFFF';
            dot.style.boxShadow = 'none';
          }
        });
      }

      // Drum envelopes
      let kickEnvelope = 0;
      if (currentMeasureBeat === 0 || currentMeasureBeat === 2) {
        kickEnvelope = Math.max(0, Math.exp(-beatFraction * 8.5));
      } else if (currentMeasureBeat === 3 && beatFraction > 0.5) {
        kickEnvelope = Math.max(0, Math.exp(-(beatFraction - 0.5) * 12.0) * 0.7);
      }

      let snareEnvelope = 0;
      if (currentMeasureBeat === 1 || currentMeasureBeat === 3) {
        snareEnvelope = Math.max(0, Math.exp(-beatFraction * 6.5) * 0.85);
      }

      const sixteenthFraction = (rawBeatNumber * 4) % 1;
      const hiHatEnvelope = Math.max(0, Math.exp(-sixteenthFraction * 14.0) * 0.4);
      const subBassProgression = Math.sin(now * 1.8 + currentBeatInt * 0.35) * 0.3 + 0.4;
      const isAudible = isPlayingVal && !isBufferingVal && effectiveVolume > 0.01;

      // Update shockwaves
      for (let s = shockwavesRef.current.length - 1; s >= 0; s--) {
        const sw = shockwavesRef.current[s];
        sw.radius += dt * 180;
        sw.strength *= 0.93;
        if (sw.strength < 0.02 || sw.radius > sw.maxRadius) {
          shockwavesRef.current.splice(s, 1);
        }
      }

      // Frequency Bin Spectrum computation
      for (let i = 0; i < numBars; i++) {
        let energy = 0;
        const freqNorm = i / numBars;

        if (isAudible) {
          let bassBand = 0;
          if (freqNorm < 0.35) {
            const bassWeight = 1.0 - (freqNorm / 0.35);
            bassBand = (kickEnvelope * 0.85 * intensityMultiplier + subBassProgression * 0.4) * bassWeight;
            bassBand += Math.sin(now * 6.0 + i * 0.5) * 0.15 * bassWeight;
          }

          let midBand = 0;
          if (freqNorm >= 0.2 && freqNorm <= 0.75) {
            const midCenter = 1.0 - Math.abs(freqNorm - 0.45) / 0.3;
            midBand = (snareEnvelope * 0.75 * intensityMultiplier + Math.sin(now * 4.2 + i * 0.6) * 0.22) * midCenter;
          }

          let trebleBand = 0;
          if (freqNorm > 0.6) {
            const trebleWeight = (freqNorm - 0.6) / 0.4;
            trebleBand = (hiHatEnvelope * 0.85 * intensityMultiplier + Math.sin(now * 15.0 + i * 1.5) * 0.2) * trebleWeight;
          }

          const ambientFlow = (Math.sin(now * 2.5 + i * 0.35) * 0.12 + 0.18);
          energy = (bassBand + midBand + trebleBand + ambientFlow) * effectiveVolume;
          energy = Math.max(0.06, Math.min(1.0, energy));
        } else {
          energy = 0.08 + Math.sin(now * 1.5 + i * 0.4) * 0.035;
        }

        if (mouseRef.current.isHovering && interactiveRef.current) {
          const barX = (i / numBars) * width;
          const dist = Math.abs(mouseRef.current.x - barX);
          if (dist < 80) {
            const proximity = (1 - dist / 80) * 0.45;
            energy = Math.min(1.0, energy + proximity);
          }
        }

        shockwavesRef.current.forEach((sw) => {
          const barX = (i / numBars) * width;
          const dist = Math.abs(sw.x - barX);
          if (Math.abs(dist - sw.radius) < 30) {
            energy = Math.min(1.0, energy + sw.strength * 0.7);
          }
        });

        barTargetValues[i] = energy;

        const attackRate = 0.65;
        const decayRate = 0.82;
        if (barTargetValues[i] > barValues[i]) {
          barValues[i] = barValues[i] + (barTargetValues[i] - barValues[i]) * attackRate;
        } else {
          barValues[i] = barValues[i] * decayRate;
        }

        if (barValues[i] >= peakValues[i]) {
          peakValues[i] = barValues[i];
          peakDecay[i] = 0;
        } else {
          peakDecay[i] += dt * 2.2;
          peakValues[i] = Math.max(barValues[i], peakValues[i] - peakDecay[i] * dt);
        }
      }

      // 1. Spectrum Bars Mode
      if (modeVal === 'bars') {
        const gap = Math.max(2, Math.floor(width / (numBars * 4)));
        const totalGap = gap * (numBars - 1);
        const barWidth = Math.max(3, (width - totalGap) / numBars);

        for (let i = 0; i < numBars; i++) {
          const x = i * (barWidth + gap);
          const barH = Math.max(4, barValues[i] * (canvasHeight - 6));
          const y = canvasHeight - barH;

          const isBassBin = i < numBars * 0.35;
          const isGlowing = isAudible && ((isBassBin && kickEnvelope > 0.3) || (!isBassBin && snareEnvelope > 0.4));

          const grad = ctx.createLinearGradient(0, y, 0, canvasHeight);
          if (isAudible) {
            if (isGlowing) {
              grad.addColorStop(0, '#C7D2FE');
              grad.addColorStop(0.3, '#818CF8');
              grad.addColorStop(1, 'rgba(99, 102, 241, 0.4)');
            } else {
              grad.addColorStop(0, '#A5B4FC');
              grad.addColorStop(0.5, '#6366F1');
              grad.addColorStop(1, 'rgba(99, 102, 241, 0.15)');
            }
          } else {
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
          }

          ctx.fillStyle = grad;
          const radius = Math.min(barWidth / 2, 4);

          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth, barH, [radius, radius, 1, 1]);
          } else {
            ctx.rect(x, y, barWidth, barH);
          }
          ctx.fill();

          if (isAudible && peakValues[i] > 0.12) {
            const peakY = canvasHeight - Math.max(4, peakValues[i] * (canvasHeight - 6)) - 2;
            ctx.fillStyle = isGlowing ? '#FFFFFF' : '#E0E7FF';
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(x, peakY, barWidth, 1.5, 1);
            } else {
              ctx.rect(x, peakY, barWidth, 1.5);
            }
            ctx.fill();
          }
        }
      }

      // 2. Fluid Waveform Mode
      else if (modeVal === 'wave') {
        const midY = canvasHeight / 2;

        ctx.beginPath();
        ctx.moveTo(0, midY);
        for (let i = 0; i < numBars; i++) {
          const x = (i / (numBars - 1)) * width;
          const amp = barValues[i] * (canvasHeight * 0.44);
          const y = midY + Math.sin(now * 4 + (i / numBars) * Math.PI * 3) * amp;
          if (i === 0) ctx.moveTo(x, y);
          else {
            const prevX = ((i - 1) / (numBars - 1)) * width;
            const prevAmp = barValues[i - 1] * (canvasHeight * 0.44);
            const prevY = midY + Math.sin(now * 4 + ((i - 1) / numBars) * Math.PI * 3) * prevAmp;
            const cx = (prevX + x) / 2;
            const cy = (prevY + y) / 2;
            ctx.quadraticCurveTo(prevX, prevY, cx, cy);
          }
        }
        ctx.lineTo(width, canvasHeight);
        ctx.lineTo(0, canvasHeight);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        const waveAlpha = isAudible ? (0.2 + kickEnvelope * 0.25) : 0.05;
        waveGrad.addColorStop(0, `rgba(99, 102, 241, ${waveAlpha})`);
        waveGrad.addColorStop(1, 'rgba(99, 102, 241, 0.01)');
        ctx.fillStyle = waveGrad;
        ctx.fill();

        ctx.beginPath();
        for (let i = 0; i < numBars; i++) {
          const x = (i / (numBars - 1)) * width;
          const amp = barValues[i] * (canvasHeight * 0.44);
          const y = midY + Math.sin(now * 4 + (i / numBars) * Math.PI * 3) * amp;
          if (i === 0) ctx.moveTo(x, y);
          else {
            const prevX = ((i - 1) / (numBars - 1)) * width;
            const prevAmp = barValues[i - 1] * (canvasHeight * 0.44);
            const prevY = midY + Math.sin(now * 4 + ((i - 1) / numBars) * Math.PI * 3) * prevAmp;
            const cx = (prevX + x) / 2;
            const cy = (prevY + y) / 2;
            ctx.quadraticCurveTo(prevX, prevY, cx, cy);
          }
        }
        ctx.strokeStyle = isAudible ? (kickEnvelope > 0.3 ? '#C7D2FE' : '#818CF8') : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = isAudible && kickEnvelope > 0.3 ? 3.0 : 2.0;
        ctx.stroke();
      }

      // 3. Orbit Mode
      else if (modeVal === 'orbit') {
        const centerX = width / 2;
        const centerY = canvasHeight / 2;
        const baseRadius = Math.min(centerX, centerY) * 0.55;

        ctx.beginPath();
        const coreRadius = baseRadius * (0.6 + kickEnvelope * 0.4);
        ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
        ctx.fillStyle = isAudible 
          ? (kickEnvelope > 0.3 ? 'rgba(129, 140, 248, 0.35)' : 'rgba(99, 102, 241, 0.18)') 
          : 'rgba(255, 255, 255, 0.05)';
        ctx.fill();

        for (let i = 0; i < numBars; i++) {
          const angle = (i / numBars) * Math.PI * 2 - Math.PI / 2 + now * 0.2;
          const val = barValues[i];
          const spikeLen = val * (baseRadius * 1.1);

          const x1 = centerX + Math.cos(angle) * baseRadius;
          const y1 = centerY + Math.sin(angle) * baseRadius;
          const x2 = centerX + Math.cos(angle) * (baseRadius + spikeLen);
          const y2 = centerY + Math.sin(angle) * (baseRadius + spikeLen);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = isAudible 
            ? `rgba(129, 140, 248, ${0.4 + val * 0.6})` 
            : 'rgba(255,255,255,0.15)';
          ctx.lineWidth = i < numBars * 0.35 && kickEnvelope > 0.3 ? 3 : 2;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      // 4. Particles Mode
      else if (modeVal === 'particles') {
        particles.forEach((p, idx) => {
          const barIdx = idx % numBars;
          const energy = barValues[barIdx];
          const speedMultiplier = isAudible 
            ? (1 + energy * 2.5 + kickEnvelope * 3.0) 
            : 0.4;

          p.x += p.vx * speedMultiplier * p.baseSpeed;
          p.y += p.vy * speedMultiplier * p.baseSpeed;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > canvasHeight) p.vy *= -1;

          const radius = p.radius * (1 + energy * 1.4 + kickEnvelope * 0.8);
          const alpha = Math.min(1, p.alpha * (0.5 + energy * 0.8 + kickEnvelope * 0.4));

          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = isAudible 
            ? (kickEnvelope > 0.4 ? `rgba(224, 231, 255, ${alpha})` : `rgba(165, 180, 252, ${alpha})`) 
            : `rgba(255, 255, 255, ${alpha * 0.4})`;
          ctx.fill();
        });
      }

      shockwavesRef.current.forEach((sw) => {
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(129, 140, 248, ${sw.strength * 0.85})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [barCount, height]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    shockwavesRef.current.push({
      x,
      y,
      radius: 4,
      maxRadius: 180,
      strength: 1.0,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovering: true,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.isHovering = false;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center w-full select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`w-full ${interactive ? 'cursor-pointer' : ''}`}
        style={{ height: `${height}px` }}
        title={interactive ? 'Interactive Beat Visualizer — Click to send a sound wave ripple' : undefined}
      />

      {showModeSelector && (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-3 w-full px-1">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/5 backdrop-blur-sm">
            <button
              onClick={() => handleModeToggle('bars')}
              className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                currentMode === 'bars' ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Frequency Spectrum Bars"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">Spectrum</span>
            </button>
            <button
              onClick={() => handleModeToggle('wave')}
              className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                currentMode === 'wave' ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Fluid Waveform"
            >
              <Waves className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">Waveform</span>
            </button>
            <button
              onClick={() => handleModeToggle('orbit')}
              className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                currentMode === 'orbit' ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Orbit Radial Spectrum"
            >
              <Disc className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">Orbit</span>
            </button>
            <button
              onClick={() => handleModeToggle('particles')}
              className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                currentMode === 'particles' ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Beat Particle Flow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">Particles</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-1 px-2 py-1" title="Live 4/4 Beat Rhythm">
              {[0, 1, 2, 3].map((step) => (
                <span
                  key={step}
                  ref={(el) => (beatDotsRef.current[step] = el)}
                  className="w-1.5 h-1.5 rounded-full bg-white/20 transition-transform duration-75"
                />
              ))}
            </div>

            <button
              onClick={() => {
                const next: BeatIntensity = beatIntensity === 'gentle' ? 'dynamic' : beatIntensity === 'dynamic' ? 'bass_heavy' : 'gentle';
                setBeatIntensity(next);
              }}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all ${
                beatIntensity === 'bass_heavy'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                  : beatIntensity === 'dynamic'
                  ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30'
                  : 'bg-white/5 text-slate-300'
              }`}
              title="Click to toggle Beat Sensitivity (Gentle / Dynamic / Bass Heavy)"
            >
              <Zap className="w-3 h-3 text-indigo-400" />
              <span>{beatIntensity === 'bass_heavy' ? 'Bass Punch' : beatIntensity === 'dynamic' ? 'Dynamic Beat' : 'Chill Beat'}</span>
            </button>

            {/* Auto BPM Detection Indicator (Replaces manual Tap button) */}
            <div
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-1.5 shadow-sm"
              title="Real-time automatic tempo & rhythm detection"
            >
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span ref={bpmDisplayRef} className="font-semibold text-slate-200">
                {Math.round(currentBpmRef.current)} BPM
              </span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider">
                AUTO
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

AudioVisualizerCanvas.displayName = 'AudioVisualizerCanvas';
