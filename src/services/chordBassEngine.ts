import { Track } from '../types';

export interface ChordInfo {
  name: string;
  rootNote: string;
  rootFreq: number; // Hz (e.g. 41.2 Hz for E1, 55 Hz for A1, 65.4 Hz for C2)
  notes: string[];
  noteFreqs: number[]; // Hz frequencies for chord triad / 7th in octave 3 & 4
  type: 'major' | 'minor' | '7th' | 'sus4' | 'dim';
}

export interface SongSection {
  name: 'Intro' | 'Verse' | 'Pre-Chorus' | 'Chorus / Drop' | 'Bridge' | 'Outro';
  energyMultiplier: number; // 0.4 (intro) to 1.35 (drop)
  bassWeight: number; // Sub-bass presence
  chordWeight: number; // Harmonic presence
  percussionDensity: number;
}

// Standard Pitch Frequencies (Octave 1 to 4)
const NOTE_FREQUENCIES: Record<string, number> = {
  'C1': 32.7, 'C#1': 34.65, 'D1': 36.71, 'D#1': 38.89, 'E1': 41.2, 'F1': 43.65, 'F#1': 46.25, 'G1': 49.0, 'G#1': 51.91, 'A1': 55.0, 'A#1': 58.27, 'B1': 61.74,
  'C2': 65.41, 'C#2': 69.3, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.5, 'G2': 98.0, 'G#2': 103.83, 'A2': 110.0, 'A#2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.0, 'G3': 196.0, 'G#3': 207.65, 'A3': 220.0, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.0, 'G#4': 415.3, 'A4': 440.0, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'G5': 783.99, 'A5': 880.0,
};

const CHORD_LIBRARY: Record<string, ChordInfo> = {
  // Major Chords
  'C': { name: 'C', rootNote: 'C', rootFreq: NOTE_FREQUENCIES['C2'], notes: ['C3', 'E3', 'G3', 'C4'], noteFreqs: [130.81, 164.81, 196.0, 261.63], type: 'major' },
  'D': { name: 'D', rootNote: 'D', rootFreq: NOTE_FREQUENCIES['D2'], notes: ['D3', 'F#3', 'A3', 'D4'], noteFreqs: [146.83, 185.0, 220.0, 293.66], type: 'major' },
  'E': { name: 'E', rootNote: 'E', rootFreq: NOTE_FREQUENCIES['E2'], notes: ['E3', 'G#3', 'B3', 'E4'], noteFreqs: [164.81, 207.65, 246.94, 329.63], type: 'major' },
  'F': { name: 'F', rootNote: 'F', rootFreq: NOTE_FREQUENCIES['F1'], notes: ['F3', 'A3', 'C4', 'F4'], noteFreqs: [174.61, 220.0, 261.63, 349.23], type: 'major' },
  'G': { name: 'G', rootNote: 'G', rootFreq: NOTE_FREQUENCIES['G1'], notes: ['G3', 'B3', 'D4', 'G4'], noteFreqs: [196.0, 246.94, 293.66, 392.0], type: 'major' },
  'A': { name: 'A', rootNote: 'A', rootFreq: NOTE_FREQUENCIES['A1'], notes: ['A3', 'C#4', 'E4', 'A4'], noteFreqs: [220.0, 277.18, 329.63, 440.0], type: 'major' },
  'Bb': { name: 'Bb', rootNote: 'A#', rootFreq: NOTE_FREQUENCIES['A#1'], notes: ['A#3', 'D4', 'F4', 'A#4'], noteFreqs: [233.08, 293.66, 349.23, 466.16], type: 'major' },
  'Eb': { name: 'Eb', rootNote: 'D#', rootFreq: NOTE_FREQUENCIES['D#2'], notes: ['D#3', 'G3', 'A#3', 'D#4'], noteFreqs: [155.56, 196.0, 233.08, 311.13], type: 'major' },

  // Minor Chords
  'Am': { name: 'Am', rootNote: 'A', rootFreq: NOTE_FREQUENCIES['A1'], notes: ['A3', 'C4', 'E4', 'A4'], noteFreqs: [220.0, 261.63, 329.63, 440.0], type: 'minor' },
  'Em': { name: 'Em', rootNote: 'E', rootFreq: NOTE_FREQUENCIES['E1'], notes: ['E3', 'G3', 'B3', 'E4'], noteFreqs: [164.81, 196.0, 246.94, 329.63], type: 'minor' },
  'Dm': { name: 'Dm', rootNote: 'D', rootFreq: NOTE_FREQUENCIES['D2'], notes: ['D3', 'F3', 'A3', 'D4'], noteFreqs: [146.83, 174.61, 220.0, 293.66], type: 'minor' },
  'Bm': { name: 'Bm', rootNote: 'B', rootFreq: NOTE_FREQUENCIES['B1'], notes: ['B3', 'D4', 'F#4', 'B4'], noteFreqs: [246.94, 293.66, 369.99, 493.88], type: 'minor' },
  'F#m': { name: 'F#m', rootNote: 'F#', rootFreq: NOTE_FREQUENCIES['F#1'], notes: ['F#3', 'A3', 'C#4', 'F#4'], noteFreqs: [185.0, 220.0, 277.18, 369.99], type: 'minor' },
  'Cm': { name: 'Cm', rootNote: 'C', rootFreq: NOTE_FREQUENCIES['C2'], notes: ['C3', 'D#3', 'G3', 'C4'], noteFreqs: [130.81, 155.56, 196.0, 261.63], type: 'minor' },
  'Gm': { name: 'Gm', rootNote: 'G', rootFreq: NOTE_FREQUENCIES['G1'], notes: ['G3', 'A#3', 'D4', 'G4'], noteFreqs: [196.0, 233.08, 293.66, 392.0], type: 'minor' },

  // 7th / Jazz / Neo-Soul Chords
  'Cmaj7': { name: 'Cmaj7', rootNote: 'C', rootFreq: NOTE_FREQUENCIES['C2'], notes: ['C3', 'E3', 'G3', 'B3'], noteFreqs: [130.81, 164.81, 196.0, 246.94], type: '7th' },
  'Am7': { name: 'Am7', rootNote: 'A', rootFreq: NOTE_FREQUENCIES['A1'], notes: ['A3', 'C4', 'E4', 'G4'], noteFreqs: [220.0, 261.63, 329.63, 392.0], type: '7th' },
  'Dm7': { name: 'Dm7', rootNote: 'D', rootFreq: NOTE_FREQUENCIES['D2'], notes: ['D3', 'F3', 'A3', 'C4'], noteFreqs: [146.83, 174.61, 220.0, 261.63], type: '7th' },
  'G7': { name: 'G7', rootNote: 'G', rootFreq: NOTE_FREQUENCIES['G1'], notes: ['G3', 'B3', 'D4', 'F4'], noteFreqs: [196.0, 246.94, 293.66, 349.23], type: '7th' },
  'Fmaj7': { name: 'Fmaj7', rootNote: 'F', rootFreq: NOTE_FREQUENCIES['F1'], notes: ['F3', 'A3', 'C4', 'E4'], noteFreqs: [174.61, 220.0, 261.63, 329.63], type: '7th' },
};

// Preset Chord Progressions
const PROGRESSION_PRESETS: ChordInfo[][] = [
  // 1. Pop & EDM Hit: I - V - vi - IV (C -> G -> Am -> F)
  [CHORD_LIBRARY['C'], CHORD_LIBRARY['G'], CHORD_LIBRARY['Am'], CHORD_LIBRARY['F']],
  // 2. Emotional / Melodic: vi - IV - I - V (Am -> F -> C -> G)
  [CHORD_LIBRARY['Am'], CHORD_LIBRARY['F'], CHORD_LIBRARY['C'], CHORD_LIBRARY['G']],
  // 3. Dark Trap / Hip-Hop: i - VI - VII - i (Em -> C -> D -> Em)
  [CHORD_LIBRARY['Em'], CHORD_LIBRARY['C'], CHORD_LIBRARY['D'], CHORD_LIBRARY['Em']],
  // 4. Lofi / Neo-Soul / R&B: ii7 - V7 - Imaj7 - vi7 (Dm7 -> G7 -> Cmaj7 -> Am7)
  [CHORD_LIBRARY['Dm7'], CHORD_LIBRARY['G7'], CHORD_LIBRARY['Cmaj7'], CHORD_LIBRARY['Am7']],
  // 5. Indie Rock / Alternative: I - IV - vi - V (D -> G -> Bm -> A)
  [CHORD_LIBRARY['D'], CHORD_LIBRARY['G'], CHORD_LIBRARY['Bm'], CHORD_LIBRARY['A']],
  // 6. Cyber / Synthwave: i - VII - VI - VII (F#m -> E -> D -> E)
  [CHORD_LIBRARY['F#m'], CHORD_LIBRARY['E'], CHORD_LIBRARY['D'], CHORD_LIBRARY['E']],
  // 7. Soulful Blues / Funk: i - iv - i - V (Gm -> Cm -> Gm -> D)
  [CHORD_LIBRARY['Gm'], CHORD_LIBRARY['Cm'], CHORD_LIBRARY['Gm'], CHORD_LIBRARY['D']],
];

/**
 * Derives a deterministic harmonic chord progression for a track based on its title and artist.
 */
export function getTrackProgression(track: Track): {
  progression: ChordInfo[];
  bpm: number;
  genre: string;
} {
  const text = `${track.title} ${track.artist} ${track.category || ''}`.toLowerCase();
  
  // Calculate a hash from title + artist
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  let bpm = 120;
  let progressionIdx = hash % PROGRESSION_PRESETS.length;
  let genre = 'Pop / Dynamic';

  if (text.includes('synth') || text.includes('cyber') || text.includes('electronic') || text.includes('dance') || text.includes('house')) {
    bpm = 126;
    progressionIdx = 5; // Cyber Synthwave
    genre = 'Electronic / Dance';
  } else if (text.includes('hip hop') || text.includes('rap') || text.includes('trap')) {
    bpm = 138;
    progressionIdx = 2; // Dark Trap
    genre = 'Hip-Hop / Trap';
  } else if (text.includes('rock') || text.includes('metal') || text.includes('punk') || text.includes('guitar')) {
    bpm = 132;
    progressionIdx = 4; // Indie Rock
    genre = 'Rock / Alternative';
  } else if (text.includes('lofi') || text.includes('chill') || text.includes('study') || text.includes('relax') || text.includes('jazz')) {
    bpm = 80;
    progressionIdx = 3; // Neo-Soul / Lofi
    genre = 'Lo-Fi / Jazz';
  } else if (text.includes('r&b') || text.includes('soul') || text.includes('acoustic')) {
    bpm = 98;
    progressionIdx = 1; // Emotional R&B
    genre = 'R&B / Acoustic';
  } else {
    bpm = 118;
    progressionIdx = hash % PROGRESSION_PRESETS.length;
  }

  return {
    progression: PROGRESSION_PRESETS[progressionIdx],
    bpm,
    genre,
  };
}

/**
 * Computes the active song section (Intro, Verse, Pre-Chorus, Drop, Bridge, Outro)
 */
export function getSongSection(currentTime: number, duration: number): SongSection {
  const total = duration > 10 ? duration : 210;
  const progress = Math.max(0, Math.min(1, currentTime / total));

  if (progress < 0.08) {
    return { name: 'Intro', energyMultiplier: 0.55, bassWeight: 0.4, chordWeight: 0.8, percussionDensity: 0.3 };
  } else if (progress < 0.28) {
    return { name: 'Verse', energyMultiplier: 0.82, bassWeight: 0.75, chordWeight: 0.9, percussionDensity: 0.7 };
  } else if (progress < 0.40) {
    return { name: 'Pre-Chorus', energyMultiplier: 1.05, bassWeight: 0.9, chordWeight: 1.1, percussionDensity: 0.9 };
  } else if (progress < 0.62) {
    return { name: 'Chorus / Drop', energyMultiplier: 1.35, bassWeight: 1.3, chordWeight: 1.25, percussionDensity: 1.2 };
  } else if (progress < 0.76) {
    return { name: 'Bridge', energyMultiplier: 0.75, bassWeight: 0.5, chordWeight: 1.2, percussionDensity: 0.4 };
  } else if (progress < 0.92) {
    return { name: 'Chorus / Drop', energyMultiplier: 1.4, bassWeight: 1.35, chordWeight: 1.3, percussionDensity: 1.25 };
  } else {
    return { name: 'Outro', energyMultiplier: 0.6, bassWeight: 0.45, chordWeight: 0.75, percussionDensity: 0.35 };
  }
}

/**
 * Calculates acoustic frequency spectrum bars based on current song playback,
 * active chord, bass root note, and percussive drum transients.
 */
export function synthesizeChordBassSpectrum(
  currentTime: number,
  duration: number,
  progression: ChordInfo[],
  bpm: number,
  volume: number,
  numBars: number = 48
): {
  bars: Float32Array;
  currentChord: ChordInfo;
  section: SongSection;
  bassEnergy: number;
  chordEnergy: number;
  trebleEnergy: number;
  isBassKick: boolean;
  isChordStrum: boolean;
} {
  const bars = new Float32Array(numBars);
  const beatInterval = 60 / bpm; // seconds per quarter note beat
  const rawBeats = currentTime / beatInterval;
  const currentMeasure = Math.floor(rawBeats / 4);
  const beatInMeasure = rawBeats % 4; // 0.0 to 4.0
  const beatFraction = beatInMeasure % 1; // 0.0 to 1.0 inside current beat

  // Active Chord in progression: changes every 1 or 2 measures
  const chordIndex = Math.floor(currentMeasure / 2) % progression.length;
  const currentChord = progression[chordIndex];
  const section = getSongSection(currentTime, duration);

  // 1. Kick Drum & 808 Sub-Bass Transients
  // Kick hits on beats 0 and 2 (or 0 and 2.5 in trap)
  const isDownbeat = beatInMeasure < 0.35;
  const isBackbeatKick = Math.abs(beatInMeasure - 2.0) < 0.35;
  const kickDist = Math.min(beatInMeasure, Math.abs(beatInMeasure - 2.0));
  const kickEnvelope = Math.max(0, Math.exp(-kickDist * 6.5)) * section.bassWeight;
  const isBassKick = kickEnvelope > 0.6;

  // Snare/Clap on beats 1 and 3
  const snareDist = Math.min(Math.abs(beatInMeasure - 1.0), Math.abs(beatInMeasure - 3.0));
  const snareEnvelope = Math.max(0, Math.exp(-snareDist * 7.5)) * section.percussionDensity;

  // Hi-hat 16th groove (subdivision of 0.25 beats)
  const sixteenth = (rawBeats * 4) % 1;
  const hiHatEnvelope = Math.max(0, Math.exp(-sixteenth * 12.0)) * 0.45 * section.percussionDensity;

  // 2. Chord Strumming & Arpeggiation Envelope
  // Rhythmic chord pulse on 8th notes (0.0, 0.5, 1.0, 1.5, etc.)
  const eighthFraction = (rawBeats * 2) % 1;
  const chordPulse = Math.max(0, Math.exp(-eighthFraction * 4.0));
  const isChordStrum = chordPulse > 0.65;

  // 3. Map frequencies to spectrum bars
  // Low bars (0 to 12): Sub-bass (30Hz) to Upper Bass (200Hz)
  // Mid bars (13 to 34): Chord fundamentals (200Hz to 1200Hz)
  // High bars (35 to 47): Chord harmonics, vocal presence, & hi-hats (1200Hz to 16000Hz)

  let bassSum = 0;
  let chordSum = 0;
  let trebleSum = 0;

  // Bass root note index calculation
  // E.g., Root Freq 41.2Hz to 120Hz maps into bars 2 to 9
  const rootFreqNorm = (currentChord.rootFreq - 30) / 100; // 0 to 1
  const rootBarCenter = Math.max(2, Math.min(10, Math.round(rootFreqNorm * 8 + 3)));

  for (let i = 0; i < numBars; i++) {
    let energy = 0.05; // Base noise floor

    if (i < 13) {
      // --- BASS REGION (Sub-bass, Kick, 808, Bassline) ---
      const distFromRoot = Math.abs(i - rootBarCenter);
      const rootResonance = Math.max(0, 1 - distFromRoot * 0.3);

      // Deep 808 sustain + punchy kick attack
      const subSustain = (Math.sin(rawBeats * Math.PI * 2 + i * 0.4) * 0.2 + 0.8) * 0.45;
      const bassValue = (kickEnvelope * 0.85 + subSustain * rootResonance) * section.bassWeight;
      
      energy += bassValue;
      bassSum += bassValue;
    } else if (i < 35) {
      // --- CHORD & HARMONIC MID REGION (Piano, Synth, Guitar, Vocals) ---
      const midNorm = (i - 13) / 22; // 0.0 to 1.0
      
      // Match each of the chord's triad notes to bar peaks
      let chordNoteMatch = 0;
      currentChord.noteFreqs.forEach((freq, noteIdx) => {
        // Map 130Hz - 600Hz across mid bars
        const targetBar = 13 + Math.round(((freq - 130) / 470) * 20);
        const dist = Math.abs(i - targetBar);
        if (dist <= 2) {
          // Inversion weighting
          const weight = 1.0 - noteIdx * 0.12;
          chordNoteMatch += Math.max(0, 1 - dist * 0.45) * weight;
        }
      });

      const strumWave = (chordPulse * 0.65 + 0.35);
      const chordValue = (chordNoteMatch * 0.75 * strumWave + snareEnvelope * 0.4) * section.chordWeight;
      
      energy += chordValue;
      chordSum += chordValue;
    } else {
      // --- TREBLE & AIR REGION (Hi-hats, Acoustic Shimmer, Overtones) ---
      const trebleNorm = (i - 35) / 13; // 0.0 to 1.0
      // Chord 3rd and 5th harmonic overtones extend into treble
      const harmonicShimmer = (Math.sin(rawBeats * 4 + i * 0.8) * 0.15 + 0.25);
      const trebleValue = (hiHatEnvelope * 0.7 + harmonicShimmer * section.energyMultiplier);

      energy += trebleValue;
      trebleSum += trebleValue;
    }

    // Apply song section multiplier and user volume
    const finalVal = Math.max(0.04, Math.min(1.0, energy * section.energyMultiplier * volume));
    bars[i] = finalVal;
  }

  return {
    bars,
    currentChord,
    section,
    bassEnergy: Math.min(1.0, (bassSum / 13) * section.bassWeight),
    chordEnergy: Math.min(1.0, (chordSum / 22) * section.chordWeight),
    trebleEnergy: Math.min(1.0, (trebleSum / 13) * section.percussionDensity),
    isBassKick,
    isChordStrum,
  };
}
