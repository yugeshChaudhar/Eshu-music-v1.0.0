import { Track, Playlist, MoodCategory, Artist, Album } from '../types';

export const SIMP_SEED_COLOR = '#8ECAE6';
export const SIMP_LYRIC_COLOR = '#FFFF00';
export const SIMP_FAVORITE_COLOR = '#FF4081';

// Top Charts / Trending Hits on SimpMusic
export const TOP_CHARTS_TRACKS: Track[] = [
  {
    id: 'fJ9rUzIMcZQ',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    duration: 359,
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    views: '1.7B views',
    category: 'Rock',
    likeCount: 14500000,
    dislikeCount: 180000,
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Despacito',
    artist: 'Luis Fonsi ft. Daddy Yankee',
    album: 'VIDA',
    duration: 228,
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    views: '8.4B views',
    category: 'Latin',
    likeCount: 52000000,
    dislikeCount: 5400000,
  },
  {
    id: '4NRXx6U8ABQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    views: '3.9B views',
    category: 'Synthwave',
    likeCount: 29000000,
    dislikeCount: 420000,
  },
  {
    id: 'JGwWNGJdvx8',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    duration: 233,
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
    views: '6.2B views',
    category: 'Pop',
    likeCount: 34000000,
    dislikeCount: 1200000,
  },
  {
    id: '09R8_2nJtjg',
    title: 'Sugar',
    artist: 'Maroon 5',
    album: 'V',
    duration: 235,
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80',
    views: '4.0B views',
    category: 'Pop',
    likeCount: 17000000,
    dislikeCount: 650000,
  },
  {
    id: 'hT_nvWreIhg',
    title: 'Counting Stars',
    artist: 'OneRepublic',
    album: 'Native',
    duration: 257,
    thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=80',
    views: '3.8B views',
    category: 'Pop Rock',
    likeCount: 18500000,
    dislikeCount: 410000,
  },
  {
    id: 'OPf0YbXqDm0',
    title: 'Uptown Funk',
    artist: 'Mark Ronson ft. Bruno Mars',
    album: 'Uptown Special',
    duration: 270,
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    views: '5.1B views',
    category: 'Funk Pop',
    likeCount: 22000000,
    dislikeCount: 950000,
  },
  {
    id: 'RgKAFK5djSk',
    title: 'See You Again',
    artist: 'Wiz Khalifa ft. Charlie Puth',
    album: 'Furious 7 Soundtrack',
    duration: 237,
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
    views: '6.1B views',
    category: 'Hip Hop',
    likeCount: 41000000,
    dislikeCount: 1100000,
  }
];

// Quick Picks / Speed Dial
export const QUICK_PICKS_TRACKS: Track[] = [
  {
    id: 'jfKfPfyJRdk',
    title: 'lofi hip hop radio - beats to relax/study to',
    artist: 'Lofi Girl',
    album: 'Chill Beats 24/7',
    duration: 3600,
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    views: 'Live Stream',
    category: 'Lo-Fi',
  },
  {
    id: '4xDzrJKXOOY',
    title: 'Synthwave Radio - Chill synth / retro vibes',
    artist: 'Lofi Girl - Synthwave',
    album: 'Night Drive Cyberpunk',
    duration: 3600,
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    views: 'Live Stream',
    category: 'Synthwave',
  },
  {
    id: '5yx6BWlEVcY',
    title: 'Chillout Lounge & Coffee Beats',
    artist: 'Cafe De Paris',
    album: 'Parisian Sunsets',
    duration: 3600,
    thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80',
    views: '12M views',
    category: 'Chill',
  },
  {
    id: 'WPni755-Krg',
    title: 'Interstellar Main Theme (Piano & Orchestra)',
    artist: 'Hans Zimmer',
    album: 'Interstellar OST',
    duration: 310,
    thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=80',
    views: '88M views',
    category: 'Soundtrack',
  },
  {
    id: '2Vv-BfVoq4g',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    duration: 263,
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
    views: '3.6B views',
    category: 'Acoustic',
  },
  {
    id: 'YQHsXMglC9A',
    title: 'Hello',
    artist: 'Adele',
    album: '25',
    duration: 367,
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    views: '3.1B views',
    category: 'Soul',
  }
];

// Moods & Genres Bento Grid
export const MOODS_AND_GENRES: MoodCategory[] = [
  {
    id: 'chill',
    title: 'Chill & Relax',
    subtitle: 'Calm beats, peaceful acoustics, and cozy ambient sounds',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    color: '#8ECAE6',
    playlistId: 'PLOzDu-MXXL3gR7RkR6W5XQ4rEa4S1Q4j2',
    iconName: 'Coffee',
    tags: ['Lofi', 'Ambient', 'Downtempo', 'Acoustic'],
  },
  {
    id: 'workout',
    title: 'Energy & Workout',
    subtitle: 'High BPM electronic, trap, and motivational workout anthems',
    coverUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    color: '#FF4081',
    playlistId: 'PLOzDu-MXXL3g_workout_energy_mix',
    iconName: 'Zap',
    tags: ['EDM', 'Hardstyle', 'Trap', 'Hip-Hop'],
  },
  {
    id: 'focus',
    title: 'Focus & Deep Work',
    subtitle: 'Binaural beats, neoclassical piano, and distraction-free flow',
    coverUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
    color: '#06D6A0',
    playlistId: 'PLOzDu-MXXL3g_focus_deepwork_mix',
    iconName: 'Compass',
    tags: ['Neoclassical', 'Piano', 'Synthesizer', 'Coding'],
  },
  {
    id: 'sleep',
    title: 'Sleep & Serenity',
    subtitle: 'Gentle night rain, soft piano chords, and deep delta waves',
    coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    color: '#118AB2',
    playlistId: 'PLOzDu-MXXL3g_sleep_serenity_mix',
    iconName: 'Moon',
    tags: ['Night', 'Meditation', 'Sleep', 'Rain'],
  },
  {
    id: 'synthwave',
    title: 'Synthwave & Cyberpunk',
    subtitle: '80s analog synthesizers, neon highways, and retro future',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    color: '#FF007F',
    playlistId: 'PLOzDu-MXXL3g_synthwave_retro_mix',
    iconName: 'Radio',
    tags: ['Retrowave', 'Darksynth', 'Cyberpunk', '80s'],
  },
  {
    id: 'party',
    title: 'Party & Dance',
    subtitle: 'Chart-toppers, club hits, and energetic festival bangers',
    coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    color: '#FFD166',
    playlistId: 'PLOzDu-MXXL3g_party_dance_mix',
    iconName: 'Flame',
    tags: ['Club', 'Dance', 'Pop', 'House'],
  }
];

export const MOOD_CATEGORIES = MOODS_AND_GENRES;

// Curated Playlists
export const CURATED_PLAYLISTS: Playlist[] = [
  {
    id: 'simpmusic-chart-global',
    title: 'SimpMusic Top 50 Global',
    description: 'The hottest trending tracks worldwide on YouTube Music and SimpMusic Chart.',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    trackCount: TOP_CHARTS_TRACKS.length,
    tracks: TOP_CHARTS_TRACKS,
    author: 'SimpMusic Official',
    color: '#8ECAE6',
  },
  {
    id: 'lofi-study-chill',
    title: 'Lofi Cafe & Chill Study',
    description: 'Atmospheric vinyl beats, cozy jazz chords, and gentle rain melodies.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    trackCount: 6,
    tracks: QUICK_PICKS_TRACKS,
    author: 'SimpMusic Curators',
    color: '#06D6A0',
  }
];

// Verified Artists
export const TOP_ARTISTS: Artist[] = [
  {
    id: 'the-weeknd',
    name: 'The Weeknd',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    subscribers: '35.4M subscribers',
    monthlyListeners: '112M monthly listeners',
    verified: true,
    bio: 'Abel Makkonen Tesfaye, known professionally as The Weeknd, is a Canadian singer and songwriter known for his sonic versatility and dark lyricism.',
    topTracks: [
      {
        id: '4NRXx6U8ABQ',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration: 200,
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'XXYlFuWEuKi',
        title: 'Save Your Tears',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration: 215,
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: '34Na4j8AVgA',
        title: 'Starboy ft. Daft Punk',
        artist: 'The Weeknd',
        album: 'Starboy',
        duration: 230,
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
      }
    ],
    albums: [
      { id: 'after-hours', title: 'After Hours', year: '2020', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80', trackCount: 14 },
      { id: 'dawn-fm', title: 'Dawn FM', year: '2022', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80', trackCount: 16 }
    ],
    singles: [],
  },
  {
    id: 'queen',
    name: 'Queen',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    subscribers: '17.8M subscribers',
    monthlyListeners: '48M monthly listeners',
    verified: true,
    bio: 'Queen are a British rock band formed in London in 1970 by Freddie Mercury, Brian May, and Roger Taylor.',
    topTracks: [
      {
        id: 'fJ9rUzIMcZQ',
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        album: 'A Night at the Opera',
        duration: 359,
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      }
    ],
    albums: [
      { id: 'a-night-at-the-opera', title: 'A Night at the Opera', year: '1975', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80', trackCount: 12 }
    ],
    singles: [],
  },
  {
    id: 'lofi-girl',
    name: 'Lofi Girl',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    subscribers: '14.2M subscribers',
    monthlyListeners: '22M monthly listeners',
    verified: true,
    bio: 'Lofi Girl is a French YouTube channel and music label providing 24/7 lofi hip hop livestreams and soothing study beats.',
    topTracks: [
      {
        id: 'jfKfPfyJRdk',
        title: 'beats to relax/study to',
        artist: 'Lofi Girl',
        album: 'Peaceful Beats',
        duration: 3600,
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      }
    ],
    albums: [],
    singles: [],
  }
];

// Fallback high-fidelity Synced Lyrics mapping for instant playback demo
export const SAMPLE_SYNCED_LYRICS: Record<string, string> = {
  'fJ9rUzIMcZQ': `[00:00.50]Is this the real life?
[00:04.20]Is this just fantasy?
[00:08.50]Caught in a landslide, no escape from reality
[00:16.80]Open your eyes, look up to the skies and see
[00:26.50]I'm just a poor boy, I need no sympathy
[00:33.20]Because I'm easy come, easy go, little high, little low
[00:41.50]Any way the wind blows doesn't really matter to me, to me
[00:55.20]Mama, just killed a man
[01:02.10]Put a gun against his head, pulled my trigger, now he's dead
[01:10.50]Mama, life had just begun
[01:16.80]But now I've gone and thrown it all away
[01:25.00]Mama, ooh, didn't mean to make you cry
[01:34.20]If I'm not back again this time tomorrow
[01:38.90]Carry on, carry on as if nothing really matters`,

  '4NRXx6U8ABQ': `[00:00.00]Yeah
[00:15.50]I've been tryna call
[00:19.20]I've been on my own for long enough
[00:23.00]Maybe you can show me how to love, maybe
[00:30.80]I'm going through withdrawals
[00:34.50]You don't even have to do too much
[00:38.50]You can turn me on with just a touch, baby
[00:46.50]I look around and Sin City's cold and empty
[00:52.20]No one's around to judge me
[00:56.00]I can't see clearly when you're gone
[01:02.00]I said, ooh, I'm blinded by the lights
[01:09.50]No, I can't sleep until I feel your touch
[01:17.50]I said, ooh, I'm drowning in the night
[01:25.00]Oh, when I'm like this, you're the one I trust`,
};
