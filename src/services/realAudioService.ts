/**
 * RealAudioService: Manages live Web Audio API capture and frequency analysis.
 * Supports capturing live audio from device microphone / speaker loopback
 * and provides real-time 2048-point FFT AnalyserNode data.
 */

let audioCtx: AudioContext | null = null;
let analyserNode: AnalyserNode | null = null;
let mediaStream: MediaStream | null = null;
let sourceNode: MediaStreamAudioSourceNode | null = null;
let isListening = false;
let listeners: Array<(active: boolean) => void> = [];

const STORAGE_KEY_AUTO_LISTEN = 'echo_visualizer_live_audio';

export function isLiveAudioActive(): boolean {
  return isListening && analyserNode !== null;
}

export function getLiveAnalyserNode(): AnalyserNode | null {
  return analyserNode;
}

export function subscribeLiveAudio(callback: (active: boolean) => void): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

function notifyListeners(active: boolean) {
  listeners.forEach((cb) => {
    try {
      cb(active);
    } catch (e) {
      console.warn('Error in live audio subscriber:', e);
    }
  });
}

/**
 * Starts listening to live audio via device microphone / speaker loopback.
 * Captures real acoustic bass, chord fundamentals, and treble in real-time.
 */
export async function startLiveAudio(): Promise<AnalyserNode | null> {
  if (isListening && analyserNode) {
    return analyserNode;
  }

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('Web Audio API is not supported in this browser');
    }

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone / audio capture is not supported in this browser');
    }

    // Capture device audio (speakers / mic) with raw uncompressed settings for maximum dynamic range
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    mediaStream = stream;

    // Create Audio Source from stream
    sourceNode = audioCtx.createMediaStreamSource(stream);

    // Create high-resolution Analyser
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 1024; // 512 frequency bins with high responsiveness
    analyserNode.smoothingTimeConstant = 0.75; // Smooth yet punchy transitions
    analyserNode.minDecibels = -90;
    analyserNode.maxDecibels = -10;

    // Connect source to analyser (do NOT connect to destination to avoid feedback loop)
    sourceNode.connect(analyserNode);

    isListening = true;
    try {
      localStorage.setItem(STORAGE_KEY_AUTO_LISTEN, 'true');
    } catch {}

    notifyListeners(true);
    return analyserNode;
  } catch (err) {
    console.warn('Could not start live audio capture:', err);
    stopLiveAudio();
    throw err;
  }
}

/**
 * Stops live audio capture and releases the microphone / audio stream.
 */
export function stopLiveAudio(): void {
  if (sourceNode) {
    try {
      sourceNode.disconnect();
    } catch {}
    sourceNode = null;
  }

  if (mediaStream) {
    try {
      mediaStream.getTracks().forEach((t) => t.stop());
    } catch {}
    mediaStream = null;
  }

  analyserNode = null;
  isListening = false;

  try {
    localStorage.setItem(STORAGE_KEY_AUTO_LISTEN, 'false');
  } catch {}

  notifyListeners(false);
}

export function toggleLiveAudio(): Promise<boolean> {
  if (isListening) {
    stopLiveAudio();
    return Promise.resolve(false);
  } else {
    return startLiveAudio()
      .then(() => true)
      .catch(() => false);
  }
}

export function shouldAutoStartLiveAudio(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_AUTO_LISTEN) === 'true';
  } catch {
    return false;
  }
}
