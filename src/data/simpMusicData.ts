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

  'XXYlFuWEuKI': `[00:00.00]♪ Intro ♪
[00:09.20]I saw you dancing in a crowded room
[00:13.80]You look so happy when I'm not with you
[00:18.50]But then you saw me, caught you by surprise
[00:23.20]A single teardrop falling from your eye
[00:28.00]I don't know why I run away
[00:32.80]I'll make you cry when I run away
[00:37.40]You could've asked me why I broke your heart
[00:42.00]You could've told me that you fell apart
[00:46.80]But you walked past me like I wasn't there
[00:51.50]And just pretended like you didn't care
[00:56.20]I don't know why I run away
[01:01.00]I'll make you cry when I run away
[01:06.00]Take me back 'cause I wanna stay
[01:10.50]Save your tears for another day
[01:15.50]Save your tears for another day`,

  'kXYiU_JCYtU': `[00:00.00]♪ Intro ♪
[00:20.50]I'm tired of being what you want me to be
[00:25.00]Feeling so faithless, lost under the surface
[00:30.50]Don't know what you're expecting of me
[00:35.00]Put under the pressure of walking in your shoes
[00:40.00]Every step that I take is another mistake to you
[00:45.00]Caught in the undertow, just caught in the undertow
[00:50.00]I've become so numb, I can't feel you there
[00:55.20]Become so tired, so much more aware
[01:00.00]I'm becoming this, all I want to do
[01:05.00]Is be more like me and be less like you`,

  '09R8_2nJtjg': `[00:00.00]♪ Intro ♪
[00:11.50]I'm hurting, baby, I'm broken down
[00:16.80]I need your loving, loving, I need it now
[00:22.00]When I'm without you, I'm something weak
[00:27.20]You got me begging, begging, I'm on my knees
[00:32.50]I don't wanna be needing your love
[00:35.20]I just wanna be deep in your love
[00:37.80]And it's killing me when you're away, ooh, baby
[00:43.00]'Cause I really don't care where you are
[00:45.50]I just wanna be there where you are
[00:48.20]And I gotta get one little taste
[00:53.00]Sugar, yes please
[00:56.50]Won't you come and put it down on me?
[01:01.20]Right here, 'cause I need
[01:04.00]Little love, a little sympathy`,

  'JGwWNGJdvx8': `[00:00.00]♪ Intro ♪
[00:09.50]The club isn't the best place to find a lover
[00:11.80]So the bar is where I go
[00:14.20]Me and my friends at the table doing shots
[00:16.50]Drinking fast and then we talk slow
[00:19.00]Come over and start up a conversation with just me
[00:21.80]And trust me I'll give it a chance now
[00:24.00]Take my hand, stop, put Van the Man on the jukebox
[00:26.50]And then we start to dance, and now I'm singing like
[00:29.00]Girl, you know I want your love
[00:31.50]Your love was handmade for somebody like me
[00:34.00]Come on now, follow my lead
[00:36.50]I may be crazy, don't mind me
[00:39.00]Say, boy, let's not talk too much
[00:41.20]Grab on my waist and put that body on me
[00:43.80]Come on now, follow my lead
[00:46.00]Come, come on now, follow my lead
[00:49.00]I'm in love with the shape of you
[00:51.50]We push and pull like a magnet do
[00:54.00]Although my heart is falling too
[00:56.50]I'm in love with your body`,

  'H5v3kku4y6Q': `[00:00.00]Tonight I'm gonna have myself a real good time
[00:06.50]I feel alive
[00:10.00]And the world, I'll turn it inside out, yeah
[00:15.50]I'm floating around in ecstasy, so
[00:21.00]Don't stop me now
[00:24.20]Don't stop me, 'cause I'm having a good time, having a good time
[00:29.50]I'm a shooting star leaping through the sky like a tiger
[00:34.20]Defying the laws of gravity
[00:37.00]I'm a racing car passing by like Lady Godiva
[00:41.50]I'm gonna go, go, go, there's no stopping me
[00:45.00]I'm burning through the sky, yeah
[00:48.00]Two hundred degrees, that's why they call me Mister Fahrenheit
[00:52.50]I'm traveling at the speed of light
[00:55.20]I wanna make a supersonic man out of you
[00:59.00]Don't stop me now, I'm having such a good time
[01:03.50]I'm having a ball
[01:06.00]Don't stop me now, if you wanna have a good time, just give me a call`,

  'rY0WxgSXdEE': `[00:00.00]♪ Bassline intro ♪
[00:15.50]Steve walks warily down the street
[00:18.20]With the brim pulled way down low
[00:21.00]Ain't no sound but the sound of his feet
[00:23.50]Machine guns ready to go
[00:26.50]Are you ready? Hey, are you ready for this?
[00:29.50]Are you hanging on the edge of your seat?
[00:32.00]Out of the doorway the bullets rip
[00:34.80]To the sound of the beat, yeah
[00:37.50]Another one bites the dust
[00:41.00]Another one bites the dust
[00:44.20]And another one gone, and another one gone
[00:47.00]Another one bites the dust, yeah
[00:50.50]Hey, I'm gonna get you too
[00:53.00]Another one bites the dust`,

  'hT_nvWreIhg': `[00:00.00]♪ Intro ♪
[00:06.50]Lately, I've been, I've been losing sleep
[00:11.20]Dreaming about the things that we could be
[00:15.80]But baby, I've been, I've been praying hard
[00:20.50]Said, no more counting dollars, we'll be counting stars
[00:25.20]Yeah, we'll be counting stars
[00:30.00]I see this life, like a swinging vine
[00:33.20]Swing my heart across the line
[00:36.00]In my face is flashing signs
[00:39.00]Seek it out and you shall find
[00:41.80]Old, but I'm not that old
[00:44.20]Young, but I'm not that bold
[00:47.00]And I don't think the world is sold
[00:50.00]On just doing what we're told
[00:53.00]I feel something so right, doing the wrong thing
[00:58.20]I feel something so wrong, doing the right thing
[01:03.50]I couldn't lie, couldn't lie, couldn't lie
[01:07.00]Everything that kills me makes me feel alive`,
};
