import { Station } from '../types';

export const CURATED_STATIONS: Station[] = [];


export const PRESET_AMBIENTS = [
  { id: 'rain', name: 'Gentle Rain', iconName: 'CloudRain', volume: 0, isPlaying: false, type: 'rain' as const },
  { id: 'fire', name: 'Campfire Crackle', iconName: 'Flame', volume: 0, isPlaying: false, type: 'fire' as const },
  { id: 'waves', name: 'Ocean Swell', iconName: 'Waves', volume: 0, isPlaying: false, type: 'waves' as const },
  { id: 'cafe', name: 'Cafe Murmur', iconName: 'Coffee', volume: 0, isPlaying: false, type: 'cafe' as const },
  { id: 'crickets', name: 'Night Crickets', iconName: 'Moon', volume: 0, isPlaying: false, type: 'crickets' as const },
  { id: 'wind', name: 'Pine Wind', iconName: 'Wind', volume: 0, isPlaying: false, type: 'wind' as const },
  { id: 'vinyl', name: 'Vinyl Dust & Hiss', iconName: 'Disc', volume: 0, isPlaying: false, type: 'vinyl' as const },
  { id: 'thunder', name: 'Distant Thunder', iconName: 'Zap', volume: 0, isPlaying: false, type: 'thunder' as const },
];

export const AMBIENT_PRESETS = [
  {
    id: 'rainy-cafe',
    name: 'Rainy Cafe',
    description: 'Soft raindrops tapping the window with gentle cafe murmur in the background.',
    volumes: { rain: 0.6, cafe: 0.45, vinyl: 0.25 }
  },
  {
    id: 'fireside-cabin',
    name: 'Fireside Cabin',
    description: 'Warm crackling hearth and soft night wind outside.',
    volumes: { fire: 0.7, wind: 0.35, crickets: 0.2 }
  },
  {
    id: 'midnight-storm',
    name: 'Midnight Storm',
    description: 'Soothing heavy rainfall with occasional distant rolling thunder.',
    volumes: { rain: 0.75, thunder: 0.5, wind: 0.3 }
  },
  {
    id: 'summer-coast',
    name: 'Summer Coastline',
    description: 'Rhythmic ocean waves and breezy coastal air.',
    volumes: { waves: 0.65, wind: 0.3, crickets: 0.2 }
  }
];
