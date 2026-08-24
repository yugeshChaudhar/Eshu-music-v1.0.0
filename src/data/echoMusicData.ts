import { 
  Track, 
  Playlist, 
  Artist, 
  MoodCategory, 
  PodcastShow, 
  PodcastEpisode, 
  AutoEqProfile, 
  TenBandEqualizer, 
  EqualizerPreset 
} from '../types';

// 1. Quick Picks
export const ECHO_QUICK_PICKS: Track[] = [
  {
    id: 'fJ9rUzIMcZQ',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    duration: 359,
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    views: '1.7B',
    likeCount: 14200000,
    bitrate: '256 kbps (HQ)',
    category: 'Rock Classics',
    canvasVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vintage-cassette-tape-spinning-41470-large.mp4',
  },
  {
    id: '4NRXx6U8ABQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    views: '890M',
    likeCount: 9800000,
    bitrate: '256 kbps (HQ)',
    category: 'Synthpop',
  },
  {
    id: 'kXYiU_JCYtU',
    title: 'Numb',
    artist: 'Linkin Park',
    album: 'Meteora',
    duration: 187,
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    views: '2.3B',
    likeCount: 16500000,
    bitrate: '256 kbps (HQ)',
    category: 'Alternative Rock',
  },
  {
    id: '09R8_2nJtjg',
    title: 'Sugar',
    artist: 'Maroon 5',
    album: 'V',
    duration: 300,
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80',
    views: '4.1B',
    likeCount: 17200000,
    bitrate: '256 kbps (HQ)',
    category: 'Pop Hits',
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Despacito',
    artist: 'Luis Fonsi ft. Daddy Yankee',
    album: 'VIDA',
    duration: 228,
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
    views: '8.4B',
    likeCount: 52000000,
    bitrate: '256 kbps (HQ)',
    category: 'Latin Pop',
  },
  {
    id: 'JGwWNGJdvx8',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    duration: 233,
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    views: '6.2B',
    likeCount: 33000000,
    bitrate: '256 kbps (HQ)',
    category: 'Acoustic Pop',
  },
  {
    id: 'hT_nvWreIhg',
    title: 'Counting Stars',
    artist: 'OneRepublic',
    album: 'Native',
    duration: 257,
    thumbnail: 'https://images.unsplash.com/photo-1445985543469-753ec76cc6ce?w=800&auto=format&fit=crop&q=80',
    views: '3.9B',
    likeCount: 18000000,
    bitrate: '256 kbps (HQ)',
    category: 'Pop Rock',
  },
  {
    id: '60ItHLz5WEA',
    title: 'Faded',
    artist: 'Alan Walker',
    album: 'Different World',
    duration: 212,
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
    views: '3.6B',
    likeCount: 27000000,
    bitrate: '256 kbps (HQ)',
    category: 'EDM Electronic',
  }
];

// 2. Global & Regional Country Charts
export const COUNTRY_CHARTS: Record<string, { name: string; flag: string; tracks: Track[] }> = {
  GLOBAL: {
    name: 'Global Top 50',
    flag: '🌐',
    tracks: [
      {
        id: 'dQw4w9WgXcQ',
        title: 'Never Gonna Give You Up',
        artist: 'Rick Astley',
        album: 'Whenever You Need Somebody',
        duration: 213,
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
        views: '1.5B',
        likeCount: 16000000,
        bitrate: '256 kbps',
      },
      {
        id: '4NRXx6U8ABQ',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration: 200,
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
        views: '890M',
        likeCount: 9800000,
        bitrate: '256 kbps',
      },
      {
        id: 'L_LUpnjgPso',
        title: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        duration: 203,
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        views: '850M',
        likeCount: 6500000,
        bitrate: '256 kbps',
      },
      {
        id: '7wtfhZwyrcc',
        title: 'Believer',
        artist: 'Imagine Dragons',
        album: 'Evolve',
        duration: 204,
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
        views: '2.6B',
        likeCount: 21000000,
        bitrate: '256 kbps',
      },
      {
        id: 'OPf0YbXqDm0',
        title: 'Uptown Funk',
        artist: 'Mark Ronson ft. Bruno Mars',
        album: 'Uptown Special',
        duration: 270,
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80',
        views: '5.1B',
        likeCount: 22000000,
        bitrate: '256 kbps',
      },
      {
        id: 'kXYiU_JCYtU',
        title: 'Numb',
        artist: 'Linkin Park',
        album: 'Meteora',
        duration: 187,
        thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
        views: '2.3B',
        likeCount: 16500000,
        bitrate: '256 kbps',
      },
      {
        id: 'fJ9rUzIMcZQ',
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        album: 'A Night at the Opera',
        duration: 359,
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        views: '1.7B',
        likeCount: 14200000,
        bitrate: '256 kbps',
      }
    ]
  },
  US: {
    name: 'United States Top 50',
    flag: '🇺🇸',
    tracks: [
      {
        id: '4NRXx6U8ABQ',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration: 200,
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
        views: '890M',
      },
      {
        id: '7wtfhZwyrcc',
        title: 'Believer',
        artist: 'Imagine Dragons',
        album: 'Evolve',
        duration: 204,
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
        views: '2.6B',
      },
      {
        id: 'L_LUpnjgPso',
        title: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        duration: 203,
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        views: '850M',
      }
    ]
  },
  IN: {
    name: 'India Top 50',
    flag: '🇮🇳',
    tracks: [
      {
        id: 'kXYiU_JCYtU',
        title: 'Kesariya',
        artist: 'Arijit Singh, Pritam',
        album: 'Brahmastra',
        duration: 268,
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        views: '600M',
      },
      {
        id: 'fJ9rUzIMcZQ',
        title: 'Apna Bana Le',
        artist: 'Arijit Singh, Sachin-Jigar',
        album: 'Bhediya',
        duration: 261,
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
        views: '450M',
      },
      {
        id: '4NRXx6U8ABQ',
        title: 'Maan Meri Jaan',
        artist: 'King',
        album: 'Champagne Talk',
        duration: 194,
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
        views: '540M',
      }
    ]
  },
  GB: {
    name: 'United Kingdom Top 50',
    flag: '🇬🇧',
    tracks: [
      {
        id: 'JGwWNGJdvx8',
        title: 'Shape of You',
        artist: 'Ed Sheeran',
        album: '÷',
        duration: 233,
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
        views: '6.2B',
      },
      {
        id: 'fJ9rUzIMcZQ',
        title: 'Someone Like You',
        artist: 'Adele',
        album: '21',
        duration: 285,
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        views: '2.1B',
      }
    ]
  },
  JP: {
    name: 'Japan Top 50',
    flag: '🇯🇵',
    tracks: [
      {
        id: '4NRXx6U8ABQ',
        title: 'Idol (アイドル)',
        artist: 'YOASOBI',
        album: 'THE BOOK 3',
        duration: 213,
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
        views: '450M',
      },
      {
        id: '60ItHLz5WEA',
        title: 'Night Dancer',
        artist: 'imase',
        album: 'POP CUBE',
        duration: 211,
        thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
        views: '230M',
      }
    ]
  }
};

// 3. Moods & Moments
export const ECHO_MOODS_AND_GENRES: MoodCategory[] = [
  {
    id: 'mood-chill',
    title: 'Chill & Relax',
    subtitle: 'Unwind with mellow beats, lofi textures and acoustic gems',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
    color: '#00BCD4',
    playlistId: 'PLchill',
    iconName: 'Coffee',
    tags: ['Acoustic', 'Lofi', 'Ambient', 'Downtempo'],
    tracks: ECHO_QUICK_PICKS.slice(0, 4),
  },
  {
    id: 'mood-workout',
    title: 'Workout & Energy',
    subtitle: 'High BPM bangers and adrenaline heavy synthwave',
    coverUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    color: '#FF5252',
    playlistId: 'PLworkout',
    iconName: 'Zap',
    tags: ['Gym', 'EDM', 'Hype', 'Rock', 'Trap'],
    tracks: ECHO_QUICK_PICKS.slice(1, 5),
  },
  {
    id: 'mood-focus',
    title: 'Deep Focus & Study',
    subtitle: 'Deep flow state, instrumental rhythms and alpha waves',
    coverUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
    color: '#7C4DFF',
    playlistId: 'PLfocus',
    iconName: 'Brain',
    tags: ['Coding', 'Study', 'Binaural', 'Minimal Techno'],
    tracks: ECHO_QUICK_PICKS.slice(2, 6),
  },
  {
    id: 'mood-sleep',
    title: 'Sleep & Nightfall',
    subtitle: 'Soft rainscapes, drifting ambient pianos and delta frequencies',
    coverUrl: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=800&auto=format&fit=crop&q=80',
    color: '#3F51B5',
    playlistId: 'PLsleep',
    iconName: 'Moon',
    tags: ['Night', 'Piano', 'Dream', 'Sleep Sounds'],
    tracks: ECHO_QUICK_PICKS.slice(3, 7),
  },
  {
    id: 'mood-party',
    title: 'Party & Dancefloor',
    subtitle: 'Chart topping dance anthems, pop remix gems and club vibes',
    coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    color: '#E91E63',
    playlistId: 'PLparty',
    iconName: 'Music',
    tags: ['Club', 'Dance', 'House', 'Festival'],
    tracks: ECHO_QUICK_PICKS.slice(0, 5),
  },
  {
    id: 'mood-romance',
    title: 'Romance & Feelings',
    subtitle: 'Heartfelt ballads, slow R&B jams and soul music',
    coverUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80',
    color: '#FF4081',
    playlistId: 'PLromance',
    iconName: 'Heart',
    tags: ['Love', 'R&B', 'Ballad', 'Soul'],
    tracks: ECHO_QUICK_PICKS.slice(2, 7),
  }
];

// 4. Featured Top Artists
export const ECHO_TOP_ARTISTS: Artist[] = [
  {
    id: 'art-the-weeknd',
    name: 'The Weeknd',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    subscribers: '35.4M Subscribers',
    monthlyListeners: '108M Monthly Listeners',
    verified: true,
    bio: 'Abel Makkonen Tesfaye, known professionally as the Weeknd, is a Canadian singer-songwriter and record producer known for his sonic versatility and dark lyricism.',
    topTracks: [
      {
        id: '4NRXx6U8ABQ',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration: 200,
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
        views: '890M',
      },
      {
        id: 'XXYlFuWEuKi',
        title: 'Save Your Tears',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration: 215,
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        views: '1.2B',
      },
      {
        id: '34Na4j8AVgA',
        title: 'Starboy',
        artist: 'The Weeknd ft. Daft Punk',
        album: 'Starboy',
        duration: 230,
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
        views: '2.4B',
      }
    ],
    albums: [
      {
        id: 'alb-after-hours',
        title: 'After Hours',
        year: '2020',
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
        trackCount: 14,
      },
      {
        id: 'alb-dawn-fm',
        title: 'Dawn FM',
        year: '2022',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        trackCount: 16,
      }
    ],
    singles: []
  },
  {
    id: 'art-taylor-swift',
    name: 'Taylor Swift',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    subscribers: '59.2M Subscribers',
    monthlyListeners: '99M Monthly Listeners',
    verified: true,
    bio: 'Taylor Alison Swift is an American singer-songwriter. Her narrative songwriting, often inspired by her personal life, has received widespread media coverage.',
    topTracks: [
      {
        id: 'b1kbLwvqugk',
        title: 'Anti-Hero',
        artist: 'Taylor Swift',
        album: 'Midnights',
        duration: 200,
        thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        views: '210M',
      },
      {
        id: '3tmd-ClpJxA',
        title: 'Cruel Summer',
        artist: 'Taylor Swift',
        album: 'Lover',
        duration: 178,
        thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
        views: '350M',
      }
    ],
    albums: [
      {
        id: 'alb-midnights',
        title: 'Midnights',
        year: '2022',
        thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        trackCount: 13,
      }
    ],
    singles: []
  },
  {
    id: 'art-billie-eilish',
    name: 'Billie Eilish',
    thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    subscribers: '50.1M Subscribers',
    monthlyListeners: '88M Monthly Listeners',
    verified: true,
    bio: 'Billie Eilish Pirate Baird O\'Connell is an American singer and songwriter. She first gained public attention in 2015 with her debut single Ocean Eyes.',
    topTracks: [
      {
        id: 'HUHC9tYz8ik',
        title: 'Bad Guy',
        artist: 'Billie Eilish',
        album: 'When We All Fall Asleep, Where Do We Go?',
        duration: 194,
        thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
        views: '1.3B',
      },
      {
        id: 'V1Pl8CzNzCw',
        title: 'Happier Than Ever',
        artist: 'Billie Eilish',
        album: 'Happier Than Ever',
        duration: 298,
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        views: '410M',
      }
    ],
    albums: [],
    singles: []
  },
  {
    id: 'art-dua-lipa',
    name: 'Dua Lipa',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    subscribers: '23.8M Subscribers',
    monthlyListeners: '74M Monthly Listeners',
    verified: true,
    bio: 'Dua Lipa is an English and Albanian singer and songwriter. Possessing a mezzo-soprano vocal range, Lipa is known for her signature disco-pop sound.',
    topTracks: [
      {
        id: 'L_LUpnjgPso',
        title: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        duration: 203,
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        views: '850M',
      },
      {
        id: 'oygrmJFKYZY',
        title: 'Don\'t Start Now',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        duration: 183,
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
        views: '670M',
      }
    ],
    albums: [],
    singles: []
  },
  {
    id: 'art-arijit-singh',
    name: 'Arijit Singh',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    subscribers: '41.2M Subscribers',
    monthlyListeners: '85M Monthly Listeners',
    verified: true,
    bio: 'Arijit Singh is an Indian playback singer and music composer. Known for his soulful and emotive vocal delivery, he is the recipient of numerous national awards.',
    topTracks: [
      {
        id: 'kXYiU_JCYtU',
        title: 'Kesariya',
        artist: 'Arijit Singh, Pritam',
        album: 'Brahmastra',
        duration: 268,
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        views: '600M',
      },
      {
        id: 'fJ9rUzIMcZQ',
        title: 'Apna Bana Le',
        artist: 'Arijit Singh, Sachin-Jigar',
        album: 'Bhediya',
        duration: 261,
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
        views: '450M',
      }
    ],
    albums: [],
    singles: []
  }
];

// 5. Curated Playlists
export const ECHO_CURATED_PLAYLISTS: Playlist[] = [
  {
    id: 'echo-playlist-hits',
    title: 'Echo Music Top Hits',
    description: 'The hottest tracks trending across YouTube Music and global streaming platforms',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    trackCount: ECHO_QUICK_PICKS.length,
    tracks: ECHO_QUICK_PICKS,
    author: 'Echo Music Editorial',
    color: '#FF5252',
  },
  {
    id: 'echo-playlist-cyber',
    title: 'Cyberpunk & Synthwave Drive',
    description: 'Neon retro-futuristic arpeggios, analog synthesizers and dark cyberpunk bass',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    trackCount: 6,
    tracks: ECHO_QUICK_PICKS.slice(1, 7),
    author: 'Echo Sound Lab',
    color: '#00BCD4',
  },
  {
    id: 'echo-playlist-deep-focus',
    title: 'Deep Coding & Flow',
    description: 'Minimal instrumental electronic beats curated for uninterrupted productivity',
    thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
    trackCount: 5,
    tracks: ECHO_QUICK_PICKS.slice(2, 7),
    author: 'Echo Productivity',
    color: '#7C4DFF',
  },
  {
    id: 'echo-playlist-night',
    title: 'Late Night Echoes',
    description: 'Soul-stirring midnight vocals, emotional acoustics and cinematic soundscapes',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
    trackCount: 4,
    tracks: ECHO_QUICK_PICKS.slice(0, 4),
    author: 'Echo Nocturnal',
    color: '#FF9800',
  }
];

// 6. Podcasts Catalog
export const ECHO_PODCASTS: PodcastShow[] = [
  {
    id: 'pod-waveform',
    title: 'Waveform: The MKBHD Podcast',
    author: 'Marques Brownlee & Andrew Manganelli',
    description: 'A deep dive into everything tech, consumer gadgets, electric vehicles, and future tech trends.',
    thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
    genre: 'Technology',
    episodesCount: 142,
    episodes: [
      {
        id: 'ep-wave-1',
        title: 'The AI Revolution in Smartphones: Helpful or Hype?',
        showTitle: 'Waveform: The MKBHD Podcast',
        channelName: 'Waveform',
        thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
        duration: 3720,
        publishedAt: '2 days ago',
        description: 'Marques and Andrew break down modern on-device AI models, smart glasses, and what actually matters.',
        videoId: 'dQw4w9WgXcQ',
      },
      {
        id: 'ep-wave-2',
        title: 'The State of Electric Vehicles in 2026',
        showTitle: 'Waveform: The MKBHD Podcast',
        channelName: 'Waveform',
        thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
        duration: 4180,
        publishedAt: '1 week ago',
        description: 'Analyzing charging networks, range improvements, and upcoming EV supercars.',
        videoId: '4NRXx6U8ABQ',
      }
    ]
  },
  {
    id: 'pod-huberman',
    title: 'Huberman Lab',
    author: 'Dr. Andrew Huberman',
    description: 'Neuroscience and science-based tools for everyday health, sleep, focus, and peak performance.',
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    genre: 'Science & Health',
    episodesCount: 210,
    episodes: [
      {
        id: 'ep-hub-1',
        title: 'Master Your Sleep: Protocols for Deep Recovery & Longevity',
        showTitle: 'Huberman Lab',
        channelName: 'Dr. Andrew Huberman',
        thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
        duration: 7200,
        publishedAt: '3 days ago',
        description: 'Optimizing circadian rhythm, temperature regulation, light exposure, and sleep supplements.',
        videoId: 'fJ9rUzIMcZQ',
      }
    ]
  },
  {
    id: 'pod-lex',
    title: 'Lex Fridman Podcast',
    author: 'Lex Fridman',
    description: 'Conversations about AI, science, technology, history, philosophy, and the nature of intelligence.',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=80',
    genre: 'Philosophy & AI',
    episodesCount: 450,
    episodes: [
      {
        id: 'ep-lex-1',
        title: 'Future of Computing, Quantum Physics & Space Exploration',
        showTitle: 'Lex Fridman Podcast',
        channelName: 'Lex Fridman',
        thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=80',
        duration: 9800,
        publishedAt: '5 days ago',
        description: 'A 3-hour journey into the mysteries of the universe and next-generation cognitive architecture.',
        videoId: '7wtfhZwyrcc',
      }
    ]
  },
  {
    id: 'pod-lofi-story',
    title: 'Lofi Midnight Tales',
    author: 'Echo Chill Collective',
    description: 'Soothing bedtime stories narrated over warm acoustic ambient tape loops.',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
    genre: 'Stories & Relax',
    episodesCount: 88,
    episodes: [
      {
        id: 'ep-lofi-1',
        title: 'The Silent Cabin in the Misty Woods',
        showTitle: 'Lofi Midnight Tales',
        channelName: 'Echo Chill',
        thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
        duration: 2400,
        publishedAt: 'Yesterday',
        description: 'Immersive soft storytelling accompanied by gentle rain and vinyl crackle.',
        videoId: '60ItHLz5WEA',
      }
    ]
  }
];

// 7. AutoEq Headphone Calibration Profiles
export const AUTO_EQ_PROFILES: AutoEqProfile[] = [
  {
    id: 'sony-wh1000xm4',
    name: 'WH-1000XM4 (Harman OE 2018)',
    brand: 'Sony',
    type: 'Over-Ear',
    targetCurve: 'Harman Over-Ear Target 2018',
    gains: [-2.5, -1.8, 0.5, 1.2, 0.8, -0.4, 1.6, 2.4, 1.1, -0.5],
  },
  {
    id: 'apple-airpods-pro-2',
    name: 'AirPods Pro (2nd Gen)',
    brand: 'Apple',
    type: 'In-Ear',
    targetCurve: 'Harman In-Ear Target',
    gains: [0.8, 0.4, -0.2, 0.0, -0.6, 0.8, 1.4, 0.5, -1.2, 0.2],
  },
  {
    id: 'sennheiser-hd600',
    name: 'HD 600 Audiophile Reference',
    brand: 'Sennheiser',
    type: 'Over-Ear',
    targetCurve: 'Diffuse Field / Harman Hybrid',
    gains: [3.5, 2.8, 1.2, 0.0, -0.2, -0.5, 0.4, 1.0, 0.8, 0.0],
  },
  {
    id: 'samsung-buds2-pro',
    name: 'Galaxy Buds 2 Pro',
    brand: 'Samsung',
    type: 'Earbuds',
    targetCurve: 'Harman IE Target',
    gains: [-1.0, -0.5, 0.2, 0.4, 0.0, 0.5, -0.8, 1.2, 0.4, -0.2],
  },
  {
    id: 'audio-technica-m50x',
    name: 'ATH-M50x Studio Monitor',
    brand: 'Audio-Technica',
    type: 'Over-Ear',
    targetCurve: 'Harman Studio Flat',
    gains: [-3.2, -2.4, -0.8, 0.6, 1.4, 0.8, -1.5, 0.6, 2.0, 1.2],
  },
  {
    id: 'bose-qc45',
    name: 'QuietComfort 45',
    brand: 'Bose',
    type: 'Over-Ear',
    targetCurve: 'Harman OE Target',
    gains: [-1.8, -0.8, 0.6, 1.0, 0.2, -1.2, 0.8, 2.0, 1.4, -0.6],
  },
];

// 8. 10-Band Equalizer Presets
export const EQUALIZER_PRESETS_10_BAND: Record<EqualizerPreset, TenBandEqualizer> = {
  flat: { b31: 0, b62: 0, b125: 0, b250: 0, b500: 0, b1k: 0, b2k: 0, b4k: 0, b8k: 0, b16k: 0 },
  'bass-boost': { b31: 6, b62: 5, b125: 4, b250: 2, b500: 0, b1k: 0, b2k: 0, b4k: 1, b8k: 2, b16k: 2 },
  'treble-boost': { b31: -1, b62: -1, b125: 0, b250: 0, b500: 1, b1k: 2, b2k: 4, b4k: 6, b8k: 7, b16k: 8 },
  vocal: { b31: -2, b62: -1, b125: 0, b250: 2, b500: 4, b1k: 5, b2k: 4, b4k: 2, b8k: 1, b16k: 0 },
  acoustic: { b31: 3, b62: 2, b125: 1, b250: 1, b500: 2, b1k: 2, b2k: 3, b4k: 4, b8k: 3, b16k: 2 },
  rock: { b31: 5, b62: 4, b125: 2, b250: 0, b500: -1, b1k: 1, b2k: 3, b4k: 5, b8k: 5, b16k: 4 },
  electronic: { b31: 5, b62: 5, b125: 3, b250: 0, b500: -1, b1k: 2, b2k: 3, b4k: 4, b8k: 5, b16k: 6 },
  chill: { b31: 2, b62: 2, b125: 1, b250: 0, b500: 0, b1k: 1, b2k: 2, b4k: 2, b8k: 1, b16k: 0 },
  'hip-hop': { b31: 7, b62: 6, b125: 4, b250: 1, b500: -1, b1k: 1, b2k: 2, b4k: 3, b8k: 4, b16k: 4 },
  jazz: { b31: 3, b62: 2, b125: 1, b250: 2, b500: -1, b1k: -1, b2k: 1, b4k: 2, b8k: 3, b16k: 3 },
  dance: { b31: 6, b62: 5, b125: 3, b250: 0, b500: 0, b1k: 2, b2k: 3, b4k: 4, b8k: 4, b16k: 5 },
  pop: { b31: -1, b62: 1, b125: 3, b250: 4, b500: 3, b1k: 1, b2k: 2, b4k: 3, b8k: 3, b16k: 2 },
};

// Aliases for compatibility
export const QUICK_PICKS_TRACKS = ECHO_QUICK_PICKS;
export const TOP_CHARTS_TRACKS = COUNTRY_CHARTS.GLOBAL.tracks;
export const MOOD_CATEGORIES = ECHO_MOODS_AND_GENRES;
export const TOP_ARTISTS = ECHO_TOP_ARTISTS;
export const CURATED_PLAYLISTS = ECHO_CURATED_PLAYLISTS;
