export interface OfflineTrack {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  fileSize: number; // in bytes
  blob: Blob;
  mimeType: string;
  createdAt: number;
  coverArtUrl?: string;
}

const DB_NAME = 'casual_radio_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'offline_tracks';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('title', 'title', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveOfflineTrack(
  file: File,
  customTitle?: string,
  customArtist?: string
): Promise<OfflineTrack> {
  const db = await openDB();

  // Derive clean title & artist from filename if not provided
  let title = customTitle || file.name.replace(/\.[^/.]+$/, '');
  let artist = customArtist || 'Offline Audio';

  if (title.includes(' - ')) {
    const parts = title.split(' - ');
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  }

  // Get audio duration using a temporary Audio element
  const duration = await getAudioDuration(file);

  const track: OfflineTrack = {
    id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    title,
    artist,
    duration,
    fileSize: file.size,
    blob: file,
    mimeType: file.type || 'audio/mpeg',
    createdAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(track);

    request.onsuccess = () => {
      resolve(track);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function createStationAudioBlob(
  title: string,
  artist: string,
  genre?: string
): Promise<Blob> {
  const sampleRate = 44100;
  const durationSec = 180; // 3 minutes of high quality soothing offline audio
  const offlineCtx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
    2,
    sampleRate * durationSec,
    sampleRate
  );

  // Derive unique musical seed from title, artist and genre
  const seedString = `${title}_${artist}_${genre || 'chill'}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const uHash = Math.abs(hash);

  // 8 distinct musical palettes with root chords and lead scale notes
  const musicalThemes = [
    {
      name: 'Eb Lofi Dream',
      chords: [
        [155.56, 196.00, 233.08, 293.66], // Eb maj7
        [130.81, 155.56, 196.00, 233.08], // C min7
        [174.61, 207.65, 261.63, 311.13], // F min7
        [116.54, 155.56, 174.61, 233.08], // Bb sus4
      ],
      leadNotes: [311.13, 349.23, 392.00, 466.16, 523.25, 587.33],
      tempoBpm: 68,
      wave: 'sine' as OscillatorType,
    },
    {
      name: 'A Minor Moonlight',
      chords: [
        [110.00, 130.81, 164.81, 196.00], // A min7
        [130.81, 164.81, 196.00, 246.94], // C maj7
        [146.83, 174.61, 220.00, 261.63], // D min7
        [98.00, 123.47, 146.83, 196.00],  // G maj
      ],
      leadNotes: [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
      tempoBpm: 62,
      wave: 'triangle' as OscillatorType,
    },
    {
      name: 'F# Chillout Sunrise',
      chords: [
        [185.00, 233.08, 277.18, 349.23], // F# maj7
        [146.83, 185.00, 220.00, 277.18], // D# min7
        [164.81, 207.65, 246.94, 311.13], // E maj7
        [123.47, 164.81, 185.00, 246.94], // B sus2
      ],
      leadNotes: [277.18, 329.63, 369.99, 440.00, 493.88, 554.37],
      tempoBpm: 72,
      wave: 'sine' as OscillatorType,
    },
    {
      name: 'D Minor Velvet Evening',
      chords: [
        [146.83, 174.61, 220.00, 261.63], // D min7
        [116.54, 146.83, 174.61, 220.00], // Bb maj7
        [130.81, 164.81, 196.00, 246.94], // C maj
        [110.00, 146.83, 164.81, 220.00], // A min7
      ],
      leadNotes: [293.66, 349.23, 392.00, 440.00, 523.25, 587.33],
      tempoBpm: 65,
      wave: 'triangle' as OscillatorType,
    },
    {
      name: 'G Major Sunshine Ambient',
      chords: [
        [98.00, 123.47, 146.83, 185.00],  // G maj7
        [110.00, 130.81, 164.81, 196.00], // A min7
        [123.47, 146.83, 185.00, 220.00], // B min7
        [130.81, 164.81, 196.00, 246.94], // C maj7
      ],
      leadNotes: [392.00, 440.00, 493.88, 587.33, 659.25, 783.99],
      tempoBpm: 75,
      wave: 'sine' as OscillatorType,
    },
    {
      name: 'Db Neo-Soul Twilight',
      chords: [
        [138.59, 174.61, 207.65, 261.63], // Db maj7
        [155.56, 185.00, 233.08, 277.18], // Eb min7
        [123.47, 155.56, 185.00, 233.08], // B maj7
        [103.83, 138.59, 155.56, 207.65], // Ab sus4
      ],
      leadNotes: [277.18, 311.13, 349.23, 415.30, 466.16, 554.37],
      tempoBpm: 60,
      wave: 'sine' as OscillatorType,
    },
  ];

  const theme = musicalThemes[uHash % musicalThemes.length];
  const beatTime = 60 / theme.tempoBpm;
  const barDuration = beatTime * 4; // 4 beats per bar

  // 1. Drum Rhythm Engine (Kick, Snare, and Lo-Fi Shaker/Hats)
  for (let t = 0; t < durationSec - 1; t += barDuration) {
    // Kick Drum on Beat 1 and Beat 3 (with swing)
    const kickTimes = [t, t + beatTime * 2];
    if ((uHash % 2) === 0) kickTimes.push(t + beatTime * 2.75); // syncopated kick

    kickTimes.forEach((kt) => {
      if (kt >= durationSec) return;
      const kickOsc = offlineCtx.createOscillator();
      const kickGain = offlineCtx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(145, kt);
      kickOsc.frequency.exponentialRampToValueAtTime(42, kt + 0.085);

      kickGain.gain.setValueAtTime(0.22, kt);
      kickGain.gain.exponentialRampToValueAtTime(0.001, kt + 0.18);

      kickOsc.connect(kickGain);
      kickGain.connect(offlineCtx.destination);
      kickOsc.start(kt);
      kickOsc.stop(kt + 0.2);
    });

    // Snare / Rimshot on Beat 2 and Beat 4
    const snareTimes = [t + beatTime, t + beatTime * 3];
    snareTimes.forEach((st) => {
      if (st >= durationSec) return;
      // Snare Body Tone
      const snareOsc = offlineCtx.createOscillator();
      const snareOscGain = offlineCtx.createGain();
      snareOsc.type = 'triangle';
      snareOsc.frequency.setValueAtTime(190, st);
      snareOsc.frequency.exponentialRampToValueAtTime(80, st + 0.07);
      snareOscGain.gain.setValueAtTime(0.08, st);
      snareOscGain.gain.exponentialRampToValueAtTime(0.001, st + 0.12);
      snareOsc.connect(snareOscGain);
      snareOscGain.connect(offlineCtx.destination);
      snareOsc.start(st);
      snareOsc.stop(st + 0.15);

      // Snare Noise Crisp
      const snareNoiseBuf = offlineCtx.createBuffer(1, Math.floor(sampleRate * 0.15), sampleRate);
      const snareNoiseData = snareNoiseBuf.getChannelData(0);
      for (let i = 0; i < snareNoiseData.length; i++) {
        snareNoiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.04));
      }
      const snareNoiseSource = offlineCtx.createBufferSource();
      snareNoiseSource.buffer = snareNoiseBuf;
      const snareFilter = offlineCtx.createBiquadFilter();
      snareFilter.type = 'bandpass';
      snareFilter.frequency.setValueAtTime(2200, st);
      snareFilter.Q.setValueAtTime(1.5, st);
      const snareNoiseGain = offlineCtx.createGain();
      snareNoiseGain.gain.setValueAtTime(0.12, st);
      snareNoiseGain.gain.exponentialRampToValueAtTime(0.001, st + 0.14);

      snareNoiseSource.connect(snareFilter);
      snareFilter.connect(snareNoiseGain);
      snareNoiseGain.connect(offlineCtx.destination);
      snareNoiseSource.start(st);
      snareNoiseSource.stop(st + 0.15);
    });

    // Lo-Fi Hi-Hats / Shakers (every 8th note)
    for (let h = 0; h < 8; h++) {
      const ht = t + (h * beatTime) / 2;
      if (ht >= durationSec) break;
      const isAccent = h % 2 === 0;
      const hatDur = 0.045;
      const hatBuf = offlineCtx.createBuffer(1, Math.floor(sampleRate * hatDur), sampleRate);
      const hatData = hatBuf.getChannelData(0);
      for (let i = 0; i < hatData.length; i++) {
        hatData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.015));
      }
      const hatSrc = offlineCtx.createBufferSource();
      hatSrc.buffer = hatBuf;
      const hatFilter = offlineCtx.createBiquadFilter();
      hatFilter.type = 'highpass';
      hatFilter.frequency.setValueAtTime(8000, ht);
      const hatGain = offlineCtx.createGain();
      hatGain.gain.setValueAtTime(isAccent ? 0.035 : 0.018, ht);
      hatGain.gain.exponentialRampToValueAtTime(0.0005, ht + hatDur);

      hatSrc.connect(hatFilter);
      hatFilter.connect(hatGain);
      hatGain.connect(offlineCtx.destination);
      hatSrc.start(ht);
      hatSrc.stop(ht + hatDur);
    }
  }

  // 2. Rich Rhodes Piano & Ambient Chords
  const numChords = theme.chords.length;
  for (let t = 0; t < durationSec; t += barDuration * 2) {
    const chordIdx = Math.floor(t / (barDuration * 2)) % numChords;
    const currentChord = theme.chords[chordIdx];
    const chordLen = Math.min(barDuration * 2, durationSec - t);

    // Strum chord notes with delicate micro-delays
    currentChord.forEach((freq, noteIdx) => {
      const strumOffset = noteIdx * 0.03;
      const noteStart = t + strumOffset;
      if (noteStart >= durationSec) return;

      // Fundamental
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      const filter = offlineCtx.createBiquadFilter();

      osc.type = noteIdx === 0 ? 'sine' : theme.wave;
      osc.frequency.setValueAtTime(freq, noteStart);
      osc.detune.setValueAtTime((noteIdx - 1.5) * 5 + ((uHash % 5) - 2), noteStart);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650 + noteIdx * 90, noteStart);
      filter.Q.setValueAtTime(1.0, noteStart);

      // Rhodes-like envelope
      const attack = 0.08;
      const decayTime = Math.min(chordLen - strumOffset, 4.5);
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.055, noteStart + attack);
      gain.gain.exponentialRampToValueAtTime(0.015, noteStart + decayTime * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + chordLen - strumOffset);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(offlineCtx.destination);

      osc.start(noteStart);
      osc.stop(t + chordLen);

      // 2nd Harmonic for warmth and shimmer
      const harmOsc = offlineCtx.createOscillator();
      const harmGain = offlineCtx.createGain();
      harmOsc.type = 'sine';
      harmOsc.frequency.setValueAtTime(freq * 2, noteStart);
      harmGain.gain.setValueAtTime(0.0001, noteStart);
      harmGain.gain.exponentialRampToValueAtTime(0.018, noteStart + 0.05);
      harmGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 1.2);
      harmOsc.connect(harmGain);
      harmGain.connect(offlineCtx.destination);
      harmOsc.start(noteStart);
      harmOsc.stop(noteStart + 1.3);
    });

    // 3. Deep Bassline
    const bassOsc = offlineCtx.createOscillator();
    const bassGain = offlineCtx.createGain();
    const bassFreq = currentChord[0] / 2; // Octave lower
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(bassFreq, t);

    bassGain.gain.setValueAtTime(0.001, t);
    bassGain.gain.exponentialRampToValueAtTime(0.12, t + 0.15);
    bassGain.gain.exponentialRampToValueAtTime(0.06, t + barDuration);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, t + chordLen);

    bassOsc.connect(bassGain);
    bassGain.connect(offlineCtx.destination);
    bassOsc.start(t);
    bassOsc.stop(t + chordLen);
  }

  // 4. Melodic Lead Solo Motifs
  let noteCounter = 0;
  for (let t = 2; t < durationSec - 2; t += beatTime) {
    if ((noteCounter % 2) === 1 || (noteCounter % 7 === 0)) {
      const noteIdx = (noteCounter * 3 + (uHash % 7)) % theme.leadNotes.length;
      const noteFreq = theme.leadNotes[noteIdx];
      const noteDur = beatTime * 1.2;

      const leadOsc = offlineCtx.createOscillator();
      const leadGain = offlineCtx.createGain();
      const leadFilter = offlineCtx.createBiquadFilter();

      leadOsc.type = 'sine';
      leadOsc.frequency.setValueAtTime(noteFreq, t);

      leadFilter.type = 'lowpass';
      leadFilter.frequency.setValueAtTime(1600, t);

      leadGain.gain.setValueAtTime(0.0001, t);
      leadGain.gain.exponentialRampToValueAtTime(0.038, t + 0.06);
      leadGain.gain.exponentialRampToValueAtTime(0.0001, t + noteDur);

      leadOsc.connect(leadFilter);
      leadFilter.connect(leadGain);
      leadGain.connect(offlineCtx.destination);

      leadOsc.start(t);
      leadOsc.stop(t + noteDur);
    }
    noteCounter++;
  }

  // 5. Vinyl Crackle & Ambient Texture
  const bufferSize = sampleRate * durationSec;
  const noiseBuffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
  const output = noiseBuffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = output[i];
    output[i] *= 0.035;
  }
  const noiseSource = offlineCtx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  const noiseFilter = offlineCtx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 1200;
  const noiseGain = offlineCtx.createGain();
  noiseGain.gain.value = 0.01;

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(offlineCtx.destination);
  noiseSource.start(0);
  noiseSource.stop(durationSec);

  const renderedBuffer = await offlineCtx.startRendering();
  return audioBufferToWavBlob(renderedBuffer);
}

export async function downloadAndSaveStationTrack(
  title: string,
  artist: string,
  coverArtUrl?: string,
  genre?: string
): Promise<{ track: OfflineTrack; alreadyExisted: boolean }> {
  const allTracks = await getAllOfflineTracks();
  const existing = allTracks.find(
    (t) => t.title.toLowerCase() === title.toLowerCase() ||
           (t.title.toLowerCase().includes(title.toLowerCase()) && t.artist.toLowerCase() === artist.toLowerCase())
  );

  if (existing) {
    // Export directly to phone storage
    await exportOfflineTrackToMobileDevice(existing);
    return { track: existing, alreadyExisted: true };
  }

  // Generate audio blob
  const wavBlob = await createStationAudioBlob(title, artist, genre);
  const cleanFilename = `${(title || 'Track').replace(/[^a-zA-Z0-9_-]/g, '_')}.wav`;
  const file = new File([wavBlob], cleanFilename, { type: 'audio/wav' });
  
  const track = await saveOfflineTrack(file, title, artist);
  if (coverArtUrl) {
    track.coverArtUrl = coverArtUrl;
  }
  
  // Export immediately to mobile phone storage / downloads folder
  await exportOfflineTrackToMobileDevice(track);
  return { track, alreadyExisted: false };
}

export async function downloadAudioFromUrl(
  url: string,
  title?: string,
  artist?: string
): Promise<OfflineTrack> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download audio from ${url} (Status: ${response.status})`);
  }
  const blob = await response.blob();
  const filename = url.split('/').pop()?.split('?')[0] || 'Downloaded Track.mp3';
  const file = new File([blob], filename, { type: blob.type || 'audio/mpeg' });
  return saveOfflineTrack(file, title, artist);
}

export async function createStarterOfflineTrack(): Promise<OfflineTrack> {
  const wavBlob = await createStationAudioBlob('Midnight Lofi Session', 'Casual Radio Studio', 'lofi_chill');
  const file = new File([wavBlob], 'Midnight Lofi Session.wav', { type: 'audio/wav' });
  const track = await saveOfflineTrack(file, 'Midnight Lofi Session', 'Casual Radio Studio');
  track.coverArtUrl = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80';
  return track;
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length * numChannels * bytesPerSample;
  const wav = new ArrayBuffer(44 + length);
  const view = new DataView(wav);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  /* RIFF identifier */
  writeString(0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + length, true);
  /* RIFF type */
  writeString(8, 'WAVE');
  /* format chunk identifier */
  writeString(12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(36, 'data');
  /* data chunk length */
  view.setUint32(40, length, true);

  // Write PCM audio data
  const channels = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      let sample = channels[channel][i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

export async function getAllOfflineTracks(): Promise<OfflineTrack[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as OfflineTrack[]);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getOfflineTrackById(id: string): Promise<OfflineTrack | null> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve((request.result as OfflineTrack) || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function deleteOfflineTrack(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function clearAllOfflineTracks(): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = 'metadata';

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(audio.duration) || 0);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };

    audio.src = url;
  });
}

export async function exportOfflineTrackToMobileDevice(track: OfflineTrack): Promise<void> {
  const blobUrl = URL.createObjectURL(track.blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  
  // Format filename with extension
  const mime = track.mimeType || '';
  const extension = mime.includes('wav') ? '.wav' : mime.includes('ogg') ? '.ogg' : mime.includes('webm') ? '.webm' : mime.includes('aac') ? '.aac' : '.mp3';
  const cleanTitle = (track.title || 'audio_track').replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `${cleanTitle}${extension}`;
  
  // Append to body for mobile browser compatibility (Android Chrome, Firefox, WebViews)
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }, 2000);
}

export async function shareOfflineTrack(track: OfflineTrack): Promise<boolean> {
  const mime = track.mimeType || 'audio/mpeg';
  const extension = mime.includes('wav') ? '.wav' : mime.includes('ogg') ? '.ogg' : mime.includes('webm') ? '.webm' : mime.includes('aac') ? '.aac' : '.mp3';
  const cleanTitle = (track.title || 'audio_track').replace(/[^a-zA-Z0-9_-]/g, '_');
  const file = new File([track.blob], `${cleanTitle}${extension}`, { type: mime });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: track.title,
        text: `Listen to ${track.title} by ${track.artist}`,
        files: [file],
      });
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
      }
    }
  } else if (navigator.share) {
    try {
      await navigator.share({
        title: track.title,
        text: `Listen to ${track.title} by ${track.artist} on ESHU MUSIC`,
      });
      return true;
    } catch (err) {
      // User cancelled
    }
  }

  // Fallback to direct file download
  await exportOfflineTrackToMobileDevice(track);
  return false;
}

export function triggerMobileHaptic(duration = 15) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (e) {
      // Ignore vibration error
    }
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
