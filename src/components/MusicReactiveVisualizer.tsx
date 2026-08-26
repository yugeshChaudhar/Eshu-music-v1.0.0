import React, { useEffect, useRef, useState, memo } from 'react';
import { Sparkles, Waves, BarChart2, Disc, Zap } from 'lucide-react';
import { Track } from '../types';

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

// Derive a musically coherent BPM based on track metadata
function estimateTrackBpm(track: Track): number {
  const text = `${track.title} ${track.artist} ${track.category || ''}`.toLowerCase();
  if (text.includes('synth') || text.includes('cyber') || text.includes('dance') || text.includes('electronic') || text.includes('house')) return 126;
  if (text.includes('hip hop') || text.includes('rap') || text.includes('trap')) return 140;
  if (text.includes('rock') || text.includes('metal') || text.includes('punk')) return 132;
  if (text.includes('lofi') || text.includes('chill') || text.includes('study') || text.includes('relax')) return 82;
  if (text.includes('acoustic') || text.includes('folk') || text.includes('indie')) return 98;
  if (text.includes('ambient') || text.includes('sleep') || text.includes('meditat') || text.includes('piano')) return 68;
  if (text.includes('pop') || text.includes('r&b')) return 105;
  return 116;
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
  analyserNode = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [preset, setPreset] = useState<VisualizerPreset>('spectrum');

  // References for zero-overhead 60FPS animation loop
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const isBufferingRef = useRef(isBuffering);
  isBufferingRef.current = isBuffering;

  // Normalized volume (0.0 to 1.0)
  const normalizedVol = volume > 1 ? volume / 100 : volume;
  const volumeRef = useRef(normalizedVol);
  volumeRef.current = normalizedVol;

  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;

  const seedColorRef = useRef(seedColor);
  seedColorRef.current = seedColor;

  const presetRef = useRef(preset);
  presetRef.current = preset;

  const currentTrackIdRef = useRef(currentTrack.id);

  // Shockwave ripples created by clicks/touches
  const shockwavesRef = useRef<Array<{ x: number; y: number; radius: number; maxRadius: number; strength: number; alpha: number }>>([]);

  // Check for reduced motion preference
  const prefersReducedMotionRef = useRef(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      prefersReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // Main Canvas & Audio Reactive Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = true;

    // Buffer allocations (Fixed allocations, 0 GC per frame)
    const numBars = 48;
    const barValues = new Float32Array(numBars);
    const targetBarValues = new Float32Array(numBars);
    const peakValues = new Float32Array(numBars);
    const peakDecay = new Float32Array(numBars);

    // Audio frequency bands
    let bassEnergy = 0;
    let midEnergy = 0;
    let trebleEnergy = 0;
    let overallEnergy = 0;

    let bassPulse = 0;
    let lastBeatTime = 0;

    // Particle field
    const numParticles = prefersReducedMotionRef.current ? 16 : 40;
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
        baseRadius: 1 + Math.random() * 2.5,
        radius: 2,
        alpha: 0.2 + Math.random() * 0.6,
        hueOffset: (Math.random() - 0.5) * 40,
      });
    }

    // Web Audio Analyser buffer if available
    let realFreqData: Uint8Array | null = null;
    if (analyserNode) {
      try {
        realFreqData = new Uint8Array(analyserNode.frequencyBinCount);
      } catch {}
    }

    const trackBpm = estimateTrackBpm(currentTrack);
    const beatInterval = 60 / trackBpm; // seconds per beat

    // Track ID tracking to reset on song changes
    currentTrackIdRef.current = currentTrack.id;

    // Handle high DPI display scaling
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

    const render = (now: number) => {
      if (!isRunning) return;

      const deltaMs = Math.min(now - lastFrameTime, 100);
      const dt = deltaMs / 1000;
      lastFrameTime = now;

      const rect = container.getBoundingClientRect();
      const width = rect.width || 320;
      const height = rect.height || 260;

      // 1. Audio Analysis & Frequency Synthesis
      const active = isPlayingRef.current && !isBufferingRef.current;
      const currentVol = volumeRef.current;
      const curTime = currentTimeRef.current;

      let rawBass = 0;
      let rawMid = 0;
      let rawTreble = 0;

      if (analyserNode && realFreqData) {
        try {
          analyserNode.getByteFrequencyData(realFreqData);
          const binCount = realFreqData.length;
          
          // Split into Low (0 - 15%), Mid (15% - 50%), High (50% - 100%)
          const bassEnd = Math.floor(binCount * 0.15);
          const midEnd = Math.floor(binCount * 0.5);

          let bSum = 0;
          for (let i = 0; i < bassEnd; i++) bSum += realFreqData[i];
          rawBass = bSum / (bassEnd * 255);

          let mSum = 0;
          for (let i = bassEnd; i < midEnd; i++) mSum += realFreqData[i];
          rawMid = mSum / ((midEnd - bassEnd) * 255);

          let tSum = 0;
          for (let i = midEnd; i < binCount; i++) tSum += realFreqData[i];
          rawTreble = tSum / ((binCount - midEnd) * 255);

          // Populate bar targets
          const step = Math.floor(binCount / numBars);
          for (let i = 0; i < numBars; i++) {
            const idx = Math.min(i * step, binCount - 1);
            targetBarValues[i] = (realFreqData[idx] / 255) * currentVol;
          }
        } catch {
          realFreqData = null;
        }
      }

      // If no direct Web Audio stream, synthesize dynamic audio response using acoustic physics model
      if (!realFreqData) {
        if (active) {
          const t = now * 0.001;
          const beatPhase = (curTime % beatInterval) / beatInterval; // 0 to 1
          
          // Sub-bass kick & 808 transient
          const kickEnvelope = Math.pow(Math.max(0, 1 - (beatPhase * 3.2)), 3.5);
          const snarePhase = ((curTime + beatInterval * 0.5) % (beatInterval * 2)) / (beatInterval * 2);
          const snareEnvelope = Math.pow(Math.max(0, 1 - (snarePhase * 4)), 2.8);

          // Rhythmic harmonic waves
          const bassMod = Math.sin(t * 3.8) * 0.25 + Math.cos(t * 7.1) * 0.15;
          const midMod = Math.sin(t * 6.2 + 1.2) * 0.3 + Math.cos(t * 11.4) * 0.2;
          const trebleMod = Math.sin(t * 14.5) * 0.35 + Math.cos(t * 22.1) * 0.25;

          rawBass = Math.min(1, (kickEnvelope * 0.75 + 0.25 + bassMod) * currentVol);
          rawMid = Math.min(1, (snareEnvelope * 0.5 + 0.35 + midMod) * currentVol);
          rawTreble = Math.min(1, (0.3 + trebleMod) * currentVol);

          // Synthesize bar targets with distinct frequency bands
          for (let i = 0; i < numBars; i++) {
            const normIdx = i / numBars; // 0 (lows) to 1 (highs)
            let val = 0;

            if (normIdx < 0.25) {
              // Bass region
              const barWeight = 1 - (normIdx / 0.25) * 0.4;
              val = (rawBass * 0.95 + Math.sin(t * 8 + i * 0.6) * 0.15) * barWeight;
            } else if (normIdx < 0.65) {
              // Mid region
              const midFactor = (normIdx - 0.25) / 0.4;
              val = rawMid * 0.8 + Math.sin(t * 10 + i * 0.8 + curTime * 4) * 0.2 * (1 - Math.abs(midFactor - 0.5));
            } else {
              // Treble region
              val = rawTreble * 0.7 + Math.cos(t * 16 + i * 1.2) * 0.2;
            }

            // Add organic flutter
            val += (Math.sin(now * 0.015 + i * 1.7) * 0.08);
            targetBarValues[i] = Math.max(0.04, Math.min(1, val * currentVol));
          }

          // Beat pulse detection
          if (kickEnvelope > 0.65 && now - lastBeatTime > 220) {
            bassPulse = 1.0;
            lastBeatTime = now;
          }
        } else {
          // Smoothly decay to calm rest state when paused
          rawBass *= 0.88;
          rawMid *= 0.88;
          rawTreble *= 0.88;
          for (let i = 0; i < numBars; i++) {
            targetBarValues[i] = 0.02;
          }
        }
      }

      // Smooth energy bands with attack/decay filters
      const attackFactor = 0.45;
      const decayFactor = 0.12;

      bassEnergy += (rawBass - bassEnergy) * (rawBass > bassEnergy ? attackFactor : decayFactor);
      midEnergy += (rawMid - midEnergy) * (rawMid > midEnergy ? attackFactor : decayFactor);
      trebleEnergy += (rawTreble - trebleEnergy) * (rawTreble > trebleEnergy ? attackFactor : decayFactor);
      overallEnergy = (bassEnergy * 0.5 + midEnergy * 0.3 + trebleEnergy * 0.2);

      // Bass pulse decay
      bassPulse = Math.max(0, bassPulse - dt * 3.8);

      // Update Bar smoothing and Peak indicators
      for (let i = 0; i < numBars; i++) {
        const target = targetBarValues[i];
        if (target > barValues[i]) {
          barValues[i] += (target - barValues[i]) * 0.5; // Fast attack
        } else {
          barValues[i] += (target - barValues[i]) * 0.15; // Smooth falloff
        }

        // Peak tracking
        if (barValues[i] >= peakValues[i]) {
          peakValues[i] = barValues[i];
          peakDecay[i] = 0;
        } else {
          peakDecay[i] += dt * 1.8;
          peakValues[i] = Math.max(barValues[i], peakValues[i] - peakDecay[i] * dt);
        }
      }

      // 2. Clear Canvas & Draw Visualizer
      ctx.clearRect(0, 0, width, height);

      const color = seedColorRef.current || '#FF5252';
      const currentPreset = presetRef.current;

      // Draw Background Glow
      const bgGlow = ctx.createRadialGradient(
        width / 2, height / 2, 10,
        width / 2, height / 2, Math.max(width, height) * 0.7
      );
      const glowAlpha = Math.min(0.28, 0.08 + overallEnergy * 0.24 + bassPulse * 0.1);
      bgGlow.addColorStop(0, `${color}${Math.floor(glowAlpha * 255).toString(16).padStart(2, '0')}`);
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // 3. Render Mode Specific Visuals
      if (currentPreset === 'spectrum') {
        // --- SPECTRUM MODE: Rounded Frequency Bars + Fluid Wave + Floating Peak Caps ---
        const barWidth = Math.max(3, (width - (numBars - 1) * 2.5) / numBars);
        const maxBarHeight = height * 0.75;
        const baseY = height - 12;

        // Draw Fluid Mid/Harmonic Wave Ribbon in the background
        ctx.beginPath();
        ctx.moveTo(0, baseY - 20);
        for (let x = 0; x <= width; x += 15) {
          const normX = x / width;
          const waveY = (
            Math.sin(normX * 5 + now * 0.003) * 18 * midEnergy +
            Math.sin(normX * 12 - now * 0.005) * 10 * trebleEnergy
          );
          ctx.lineTo(x, baseY - 35 - waveY);
        }
        ctx.lineTo(width, baseY);
        ctx.lineTo(0, baseY);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, baseY - 60, 0, baseY);
        waveGrad.addColorStop(0, `${color}40`);
        waveGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
        ctx.fillStyle = waveGrad;
        ctx.fill();

        // Draw Frequency Bars
        for (let i = 0; i < numBars; i++) {
          const x = i * (barWidth + 2.5) + (width - (numBars * (barWidth + 2.5))) / 2;
          const barHeight = Math.max(4, barValues[i] * maxBarHeight);
          const y = baseY - barHeight;

          // Bar Gradient Fill
          const barGrad = ctx.createLinearGradient(x, baseY, x, y);
          barGrad.addColorStop(0, `${color}60`);
          barGrad.addColorStop(0.7, color);
          barGrad.addColorStop(1, '#FFFFFF');

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
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillRect(x, peakY, barWidth, 2);
        }
      } else if (currentPreset === 'wave') {
        // --- WAVE MODE: Multi-layered Organic Fluid Curves ---
        const layers = 3;
        for (let l = 0; l < layers; l++) {
          ctx.beginPath();
          const layerOffset = l * 1.4;
          const layerSpeed = 0.002 + l * 0.001;
          const layerAlpha = 0.35 + (layers - l) * 0.2;

          ctx.moveTo(0, height / 2);
          for (let x = 0; x <= width; x += 8) {
            const normX = x / width;
            const yOffset = (
              Math.sin(normX * (4 + l) + now * layerSpeed + layerOffset) * (40 * bassEnergy + 10) +
              Math.cos(normX * 8 - now * 0.003) * (20 * midEnergy) +
              Math.sin(normX * 16 + now * 0.006) * (12 * trebleEnergy)
            );
            ctx.lineTo(x, height / 2 + yOffset);
          }
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, height * 0.2, 0, height);
          grad.addColorStop(0, `${color}${Math.floor(layerAlpha * 255).toString(16).padStart(2, '0')}`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
          ctx.fillStyle = grad;
          ctx.fill();
        }
      } else if (currentPreset === 'orbit') {
        // --- ORBIT MODE: Radial Circular Spectrum around glowing core ---
        const cx = width / 2;
        const cy = height / 2;
        const baseRadius = Math.min(width, height) * 0.22 + bassPulse * 8;

        // Central glowing orb
        const coreGlow = ctx.createRadialGradient(cx, cy, 5, cx, cy, baseRadius * 1.5);
        coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        coreGlow.addColorStop(0.4, color);
        coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius * 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Radial Bars
        const radialCount = 42;
        for (let i = 0; i < radialCount; i++) {
          const angle = (i / radialCount) * Math.PI * 2 - Math.PI / 2;
          const barIdx = Math.floor((i / radialCount) * numBars);
          const barLen = Math.max(4, barValues[barIdx] * (Math.min(width, height) * 0.25));

          const x1 = cx + Math.cos(angle) * (baseRadius + 4);
          const y1 = cy + Math.sin(angle) * (baseRadius + 4);
          const x2 = cx + Math.cos(angle) * (baseRadius + 4 + barLen);
          const y2 = cy + Math.sin(angle) * (baseRadius + 4 + barLen);

          ctx.strokeStyle = i % 2 === 0 ? color : '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      } else if (currentPreset === 'particles') {
        // --- PARTICLES MODE: Dynamic Stardust reacting to Bass & Treble ---
        const cx = width / 2;
        const cy = height / 2;

        // Central pulse ring
        ctx.strokeStyle = `${color}80`;
        ctx.lineWidth = 2 + bassEnergy * 4;
        ctx.beginPath();
        ctx.arc(cx, cy, 35 + bassPulse * 30, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4. Update & Render Reactive Stardust Particles across all modes
      const particleSpeedMult = (active ? (1 + trebleEnergy * 2.5) : 0.4) * (prefersReducedMotionRef.current ? 0.4 : 1);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx * particleSpeedMult;
        p.y += p.vy * particleSpeedMult;

        // Wrap around
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;

        // Treble sparkle size modulation
        p.radius = p.baseRadius * (1 + trebleEnergy * 1.5 + bassPulse * 0.8);

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
        sw.radius += dt * 180;
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
  }, [currentTrack.id, analyserNode]);

  // Interactive Touch & Click Shockwave
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
      radius: 5,
      maxRadius: Math.max(rect.width, rect.height) * 0.6,
      strength: 1,
      alpha: 0.9,
    });
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

      {/* Preset Switcher Pills */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 p-1 rounded-2xl bg-neutral-950/70 border border-white/10 backdrop-blur-xl shadow-lg">
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
              className={`p-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
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

      {/* Subtle Bottom Track Meta in Visualizer */}
      <div className="absolute bottom-3 left-4 z-20 pointer-events-none flex items-center gap-2">
        <div 
          className="w-2 h-2 rounded-full animate-ping"
          style={{ backgroundColor: seedColor }}
        />
        <span className="text-[11px] font-bold tracking-wider uppercase text-white/70 backdrop-blur-sm">
          Reactive Engine {isPlaying ? '• Active' : '• Paused'}
        </span>
      </div>
    </div>
  );
});

MusicReactiveVisualizer.displayName = 'MusicReactiveVisualizer';
