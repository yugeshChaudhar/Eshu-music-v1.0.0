import { Track, Playlist } from '../types';
import { apiUrl } from './apiConfig';
import { cleanTitle, cleanArtistName, getGenuineThumbnail, getAllCatalogTracks } from './recommendationService';
import { getStoredTasteProfile, getTopAffinityArtists } from './tasteProfileService';
import { getListeningHistory } from './echoStorage';

export type DetectedGenre =
  | 'phonk'
  | 'nepali'
  | 'hindi'
  | 'k-pop'
  | 'rock'
  | 'edm'
  | 'lo-fi'
  | 'hip-hop'
  | 'pop'
  | 'latin'
  | 'j-pop'
  | 'punjabi'
  | 'r&b'
  | 'classical'
  | 'general';

export type DetectedLanguage =
  | 'nepali'
  | 'hindi'
  | 'korean'
  | 'japanese'
  | 'punjabi'
  | 'spanish'
  | 'english'
  | 'instrumental'
  | 'unknown';

export interface MusicProfile {
  genre: DetectedGenre;
  language: DetectedLanguage;
  confidence: 'high' | 'medium' | 'low';
  seedArtist: string;
  seedTitle: string;
  relatedArtists: string[];
  searchQueries: string[];
}

// 1. Rich Genre & Artist Knowledge Graph
const GENRE_ARTIST_MAP: Record<string, { genre: DetectedGenre; language: DetectedLanguage; related: string[] }> = {
  // Phonk
  'dvrst': { genre: 'phonk', language: 'instrumental', related: ['Kordhell', 'Pharmacist', 'Hensonn', 'PlayaPhonk', 'Sxmpra'] },
  'kordhell': { genre: 'phonk', language: 'instrumental', related: ['DVRST', 'Pharmacist', 'Hensonn', 'Interworld', 'MoonDeity'] },
  'pharmacist': { genre: 'phonk', language: 'instrumental', related: ['DVRST', 'Kordhell', 'Ghostface Playa', 'Lxst Cxntury'] },
  'hensonn': { genre: 'phonk', language: 'instrumental', related: ['DVRST', 'Kordhell', 'Pharmacist', 'Shadxwbxrn'] },
  'playaphonk': { genre: 'phonk', language: 'instrumental', related: ['DVRST', 'Kordhell', 'Ghostface Playa', 'Pharmacist'] },
  'ghostface playa': { genre: 'phonk', language: 'instrumental', related: ['Pharmacist', 'DVRST', 'Kordhell', 'Sxmpra'] },
  'sxmpra': { genre: 'phonk', language: 'english', related: ['Ghostface Playa', 'Kordhell', 'DVRST', 'Baker Ya Maker'] },
  'interworld': { genre: 'phonk', language: 'instrumental', related: ['Kordhell', 'DVRST', 'MoonDeity', 'Hensonn'] },
  'lxst cxntury': { genre: 'phonk', language: 'instrumental', related: ['DVRST', 'Hensonn', 'Pharmacist', 'Kordhell'] },
  'shadxwbxrn': { genre: 'phonk', language: 'instrumental', related: ['DVRST', 'Hensonn', 'Kordhell', 'MoonDeity'] },
  'moondeity': { genre: 'phonk', language: 'instrumental', related: ['Kordhell', 'Interworld', 'DVRST', 'Pharmacist'] },

  // Nepali
  'sajjan raj vaidya': { genre: 'nepali', language: 'nepali', related: ['Bipul Chettri', 'Sushant KC', 'Yabesh Thapa', 'Tribal Rain', 'Albatross', 'Arthur Gunn', 'The Elements'] },
  'bipul chettri': { genre: 'nepali', language: 'nepali', related: ['Sajjan Raj Vaidya', 'Sushant KC', 'Tribal Rain', '1974 AD', 'Cobweb', 'Nepathya'] },
  'sushant kc': { genre: 'nepali', language: 'nepali', related: ['Sajjan Raj Vaidya', 'Yabesh Thapa', 'Bipul Chettri', 'Arthur Gunn', 'Bekh', 'Sabin Rai'] },
  'yabesh thapa': { genre: 'nepali', language: 'nepali', related: ['Sajjan Raj Vaidya', 'Sushant KC', 'Oasis Thapa', 'Bekh', 'John Chamling Rai'] },
  'tribal rain': { genre: 'nepali', language: 'nepali', related: ['Sajjan Raj Vaidya', 'Bipul Chettri', 'Albatross', 'The Elements', 'Sushant KC'] },
  'albatross': { genre: 'nepali', language: 'nepali', related: ['Tribal Rain', '1974 AD', 'Cobweb', 'The Edge Band', 'Sabin Rai'] },
  '1974 ad': { genre: 'nepali', language: 'nepali', related: ['Cobweb', 'Nepathya', 'Albatross', 'Bipul Chettri', 'Sabin Rai'] },
  'cobweb': { genre: 'nepali', language: 'nepali', related: ['1974 AD', 'Albatross', 'The Edge Band', 'Nepathya'] },
  'nepathya': { genre: 'nepali', language: 'nepali', related: ['1974 AD', 'Cobweb', 'Bipul Chettri', 'Sabin Rai'] },
  'sugam pokharel': { genre: 'nepali', language: 'nepali', related: ['Sabin Rai', 'The Edge Band', 'Sajjan Raj Vaidya', '1974 AD'] },
  'sabin rai': { genre: 'nepali', language: 'nepali', related: ['The Edge Band', 'Sajjan Raj Vaidya', 'Sugam Pokharel', '1974 AD'] },
  'the edge band': { genre: 'nepali', language: 'nepali', related: ['Sabin Rai', 'Cobweb', '1974 AD', 'Albatross'] },
  'arthur gunn': { genre: 'nepali', language: 'nepali', related: ['Sajjan Raj Vaidya', 'Bipul Chettri', 'Sushant KC', 'Tribal Rain'] },
  'the elements': { genre: 'nepali', language: 'nepali', related: ['Tribal Rain', 'Sajjan Raj Vaidya', 'Albatross', 'Bipul Chettri'] },

  // Hindi / Bollywood
  'arijit singh': { genre: 'hindi', language: 'hindi', related: ['Pritam', 'Atif Aslam', 'Shreya Ghoshal', 'Jubin Nautiyal', 'Sachin-Jigar', 'Mohit Chauhan'] },
  'pritam': { genre: 'hindi', language: 'hindi', related: ['Arijit Singh', 'Atif Aslam', 'KK', 'Mohit Chauhan', 'Sachin-Jigar'] },
  'atif aslam': { genre: 'hindi', language: 'hindi', related: ['Arijit Singh', 'Pritam', 'Mustafa Zahid', 'Ali Zafar', 'Jubin Nautiyal'] },
  'shreya ghoshal': { genre: 'hindi', language: 'hindi', related: ['Arijit Singh', 'Sunidhi Chauhan', 'Jubin Nautiyal', 'Sonu Nigam'] },
  'jubin nautiyal': { genre: 'hindi', language: 'hindi', related: ['Arijit Singh', 'Darshan Raval', 'Sachin-Jigar', 'Atif Aslam'] },
  'darshan raval': { genre: 'hindi', language: 'hindi', related: ['Jubin Nautiyal', 'Armaan Malik', 'Arijit Singh', 'Anuv Jain'] },
  'anuv jain': { genre: 'hindi', language: 'hindi', related: ['Prateek Kuhad', 'Jasleen Royal', 'Darshan Raval', 'The Local Train'] },
  'prateek kuhad': { genre: 'hindi', language: 'hindi', related: ['Anuv Jain', 'The Local Train', 'Jasleen Royal', 'When Chai Met Toast'] },
  'sachin-jigar': { genre: 'hindi', language: 'hindi', related: ['Arijit Singh', 'Pritam', 'Jubin Nautiyal', 'Amit Trivedi'] },
  'sonu nigam': { genre: 'hindi', language: 'hindi', related: ['KK', 'Shaan', 'Udit Narayan', 'Arijit Singh'] },
  'kk': { genre: 'hindi', language: 'hindi', related: ['Pritam', 'Sonu Nigam', 'Mohit Chauhan', 'Shaan', 'Arijit Singh'] },

  // K-Pop
  'bts': { genre: 'k-pop', language: 'korean', related: ['TOMORROW X TOGETHER', 'SEVENTEEN', 'Stray Kids', 'ENHYPEN', 'EXO'] },
  'blackpink': { genre: 'k-pop', language: 'korean', related: ['NewJeans', 'LE SSERAFIM', 'TWICE', 'aespa', 'ITZY', 'IVE'] },
  'newjeans': { genre: 'k-pop', language: 'korean', related: ['LE SSERAFIM', 'IVE', 'aespa', 'BLACKPINK', 'TWICE', 'ILLIT'] },
  'le sserafim': { genre: 'k-pop', language: 'korean', related: ['NewJeans', 'aespa', 'IVE', 'ITZY', 'BLACKPINK'] },
  'twice': { genre: 'k-pop', language: 'korean', related: ['BLACKPINK', 'Red Velvet', 'ITZY', 'NewJeans', 'aespa'] },
  'stray kids': { genre: 'k-pop', language: 'korean', related: ['ATEEZ', 'TOMORROW X TOGETHER', 'ENHYPEN', 'SEVENTEEN', 'BTS'] },
  'aespa': { genre: 'k-pop', language: 'korean', related: ['NewJeans', 'LE SSERAFIM', 'IVE', 'Red Velvet', 'BLACKPINK'] },
  'ive': { genre: 'k-pop', language: 'korean', related: ['NewJeans', 'LE SSERAFIM', 'aespa', 'ITZY', 'TWICE'] },
  'seventeen': { genre: 'k-pop', language: 'korean', related: ['BTS', 'TOMORROW X TOGETHER', 'Stray Kids', 'ENHYPEN'] },
  'iu': { genre: 'k-pop', language: 'korean', related: ['Taeyeon', 'AKMU', 'Heize', 'BOL4', 'NewJeans'] },

  // Rock
  'linkin park': { genre: 'rock', language: 'english', related: ['Three Days Grace', 'Evanescence', 'Papa Roach', 'Breaking Benjamin', 'Green Day', 'Foo Fighters'] },
  'queen': { genre: 'rock', language: 'english', related: ['David Bowie', 'Led Zeppelin', 'Pink Floyd', 'The Beatles', 'The Who', 'Coldplay'] },
  'nirvana': { genre: 'rock', language: 'english', related: ['Foo Fighters', 'Pearl Jam', 'Soundgarden', 'Alice in Chains', 'Green Day'] },
  'foo fighters': { genre: 'rock', language: 'english', related: ['Nirvana', 'Red Hot Chili Peppers', 'Green Day', 'Queens of the Stone Age'] },
  'green day': { genre: 'rock', language: 'english', related: ['Blink-182', 'Sum 41', 'Offspring', 'Linkin Park', 'Foo Fighters'] },
  'coldplay': { genre: 'rock', language: 'english', related: ['OneRepublic', 'The Script', 'Imagine Dragons', 'Keane', 'Snow Patrol'] },
  'imagine dragons': { genre: 'rock', language: 'english', related: ['OneRepublic', 'Coldplay', 'Fall Out Boy', 'The Script', 'Maroon 5'] },
  'arctic monkeys': { genre: 'rock', language: 'english', related: ['The Strokes', 'The Neighbourhood', 'Cage The Elephant', 'Franz Ferdinand'] },
  'three days grace': { genre: 'rock', language: 'english', related: ['Linkin Park', 'Breaking Benjamin', 'Skillet', 'Papa Roach'] },

  // EDM
  'alan walker': { genre: 'edm', language: 'english', related: ['Marshmello', 'Martin Garrix', 'The Chainsmokers', 'Avicii', 'Kygo', 'DJ Snake'] },
  'avicii': { genre: 'edm', language: 'english', related: ['Kygo', 'Martin Garrix', 'Swedish House Mafia', 'Alesso', 'Zedd', 'Alan Walker'] },
  'martin garrix': { genre: 'edm', language: 'english', related: ['Avicii', 'Marshmello', 'Alan Walker', 'Tiësto', 'Hardwell', 'David Guetta'] },
  'marshmello': { genre: 'edm', language: 'english', related: ['Alan Walker', 'The Chainsmokers', 'DJ Snake', 'Martin Garrix'] },
  'the chainsmokers': { genre: 'edm', language: 'english', related: ['Marshmello', 'Zedd', 'Kygo', 'Martin Garrix', 'Alan Walker'] },
  'daft punk': { genre: 'edm', language: 'english', related: ['The Weeknd', 'Justice', 'Kavinsky', 'deadmau5', 'Avicii'] },
  'kygo': { genre: 'edm', language: 'english', related: ['Avicii', 'Alan Walker', 'Gryffin', 'Robin Schulz', 'Lost Frequencies'] },

  // Lo-Fi
  'lofi girl': { genre: 'lo-fi', language: 'instrumental', related: ['ChilledCow', 'Potsu', 'Kudasaibeats', 'Jinsang', 'Idealism'] },
  'potsu': { genre: 'lo-fi', language: 'instrumental', related: ['Jinsang', 'Kudasaibeats', 'Idealism', 'Saib'] },
  'jinsang': { genre: 'lo-fi', language: 'instrumental', related: ['Potsu', 'Kudasaibeats', 'Idealism', 'Tomppabeats'] },
  'kudasaibeats': { genre: 'lo-fi', language: 'instrumental', related: ['Potsu', 'Jinsang', 'Idealism', 'Saib'] },

  // Hip-Hop
  'kendrick lamar': { genre: 'hip-hop', language: 'english', related: ['J. Cole', 'Drake', 'Travis Scott', 'Kanye West', 'Baby Keem'] },
  'drake': { genre: 'hip-hop', language: 'english', related: ['Travis Scott', 'Future', '21 Savage', 'Kendrick Lamar', 'Lil Baby'] },
  'travis scott': { genre: 'hip-hop', language: 'english', related: ['Drake', 'Metro Boomin', 'Future', 'Playboi Carti', 'Don Toliver'] },
  'eminem': { genre: 'hip-hop', language: 'english', related: ['Dr. Dre', '50 Cent', 'Snoop Dogg', 'Tupac', 'Kendrick Lamar'] },

  // Pop
  'the weeknd': { genre: 'pop', language: 'english', related: ['Dua Lipa', 'Bruno Mars', 'Post Malone', 'Ariana Grande', 'Daft Punk'] },
  'dua lipa': { genre: 'pop', language: 'english', related: ['The Weeknd', 'Taylor Swift', 'Ariana Grande', 'Doja Cat', 'Bebe Rexha'] },
  'taylor swift': { genre: 'pop', language: 'english', related: ['Olivia Rodrigo', 'Sabrina Carpenter', 'Lorde', 'Phoebe Bridgers'] },
  'ed sheeran': { genre: 'pop', language: 'english', related: ['Shawn Mendes', 'Charlie Puth', 'Lewis Capaldi', 'James Arthur'] },

  // J-Pop
  'yoasobi': { genre: 'j-pop', language: 'japanese', related: ['Eve', 'Official HIGE DANDism', 'Kenshi Yonezu', 'Ado', 'King Gnu'] },
  'kenshi yonezu': { genre: 'j-pop', language: 'japanese', related: ['YOASOBI', 'King Gnu', 'Eve', 'RADWIMPS', 'Fujii Kaze'] },
  'ado': { genre: 'j-pop', language: 'japanese', related: ['YOASOBI', 'Eve', 'ZUTOMAYO', 'Kenshi Yonezu'] },

  // Punjabi
  'ap dhillon': { genre: 'punjabi', language: 'punjabi', related: ['Gurinder Gill', 'Shubh', 'Sidhu Moose Wala', 'Diljit Dosanjh', 'Karan Aujla'] },
  'sidhu moose wala': { genre: 'punjabi', language: 'punjabi', related: ['Karan Aujla', 'Diljit Dosanjh', 'AP Dhillon', 'Amrit Maan'] },
  'diljit dosanjh': { genre: 'punjabi', language: 'punjabi', related: ['Sidhu Moose Wala', 'Karan Aujla', 'AP Dhillon', 'Badshah'] },

  // Latin
  'bad bunny': { genre: 'latin', language: 'spanish', related: ['Rauw Alejandro', 'J Balvin', 'Ozuna', 'Anuel AA', 'Feid'] },
  'j balvin': { genre: 'latin', language: 'spanish', related: ['Bad Bunny', 'Maluma', 'Ozuna', 'Daddy Yankee', 'Luis Fonsi'] },
};

/**
 * Detect script or character signatures for accurate regional categorization
 */
function detectScript(text: string): DetectedLanguage | null {
  if (!text) return null;
  // Hangul (Korean)
  if (/[\uac00-\ud7af\u1100-\u11ff]/.test(text)) return 'korean';
  // Japanese (Hiragana/Katakana)
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'japanese';
  // Devanagari (Hindi / Nepali)
  if (/[\u0900-\u097f]/.test(text)) {
    // If text contains common Nepali words or suffixes
    if (/(?:नेपाली|सज्जन|विपुल|सुशान्त|याबेश|गित|माया|काठमाडौं|तिमी|हाम्रो|जिन्दगी)/i.test(text)) {
      return 'nepali';
    }
    return 'hindi';
  }
  return null;
}

/**
 * Detects the music profile (genre, language, confidence, related artists)
 * using actual track metadata, title, artist, album, and category.
 */
export function detectTrackMusicProfile(track: Track): MusicProfile {
  const cleanArt = cleanArtistName(track.artist || '').toLowerCase().trim();
  const titleLower = (track.title || '').toLowerCase();
  const categoryLower = (track.category || '').toLowerCase();
  const albumLower = (track.album || '').toLowerCase();
  const fullText = `${cleanArt} ${titleLower} ${categoryLower} ${albumLower}`;

  // 1. Direct Knowledge Graph match on clean artist
  for (const [knownArt, info] of Object.entries(GENRE_ARTIST_MAP)) {
    if (cleanArt === knownArt || cleanArt.includes(knownArt) || knownArt.includes(cleanArt)) {
      const queries = buildSearchQueries(info.genre, info.language, track.artist, info.related);
      return {
        genre: info.genre,
        language: info.language,
        confidence: 'high',
        seedArtist: track.artist,
        seedTitle: track.title,
        relatedArtists: info.related,
        searchQueries: queries,
      };
    }
  }

  // 2. Keyword & script analysis
  let detectedGenre: DetectedGenre = 'general';
  let detectedLang: DetectedLanguage = 'unknown';
  let confidence: 'high' | 'medium' | 'low' = 'low';

  const scriptLang = detectScript(track.title + ' ' + track.artist);
  if (scriptLang) {
    detectedLang = scriptLang;
    if (scriptLang === 'korean') detectedGenre = 'k-pop';
    else if (scriptLang === 'japanese') detectedGenre = 'j-pop';
    else if (scriptLang === 'nepali') detectedGenre = 'nepali';
    else if (scriptLang === 'hindi') detectedGenre = 'hindi';
    confidence = 'high';
  }

  // Phonk detection
  if (
    fullText.includes('phonk') ||
    fullText.includes('drift phonk') ||
    fullText.includes('brazilian phonk') ||
    fullText.includes('memphis rap') ||
    fullText.includes('cowbell') ||
    fullText.includes('slowed+reverb phonk')
  ) {
    detectedGenre = 'phonk';
    detectedLang = 'instrumental';
    confidence = 'high';
  }
  // Nepali detection
  else if (
    fullText.includes('nepali') ||
    fullText.includes('nepal') ||
    fullText.includes('adhunika') ||
    fullText.includes('lok dohori') ||
    fullText.includes('nepali acoustic') ||
    fullText.includes('nepali lofi') ||
    fullText.includes('kathmandu')
  ) {
    detectedGenre = 'nepali';
    detectedLang = 'nepali';
    confidence = 'high';
  }
  // K-Pop detection
  else if (
    fullText.includes('kpop') ||
    fullText.includes('k-pop') ||
    fullText.includes('korean pop') ||
    fullText.includes('hangul')
  ) {
    detectedGenre = 'k-pop';
    detectedLang = 'korean';
    confidence = 'high';
  }
  // Hindi / Bollywood
  else if (
    fullText.includes('bollywood') ||
    fullText.includes('hindi') ||
    fullText.includes('sufi') ||
    fullText.includes('t-series') ||
    fullText.includes('zee music') ||
    fullText.includes('ghazal')
  ) {
    detectedGenre = 'hindi';
    detectedLang = 'hindi';
    confidence = 'high';
  }
  // Lo-Fi detection
  else if (
    fullText.includes('lofi') ||
    fullText.includes('lo-fi') ||
    fullText.includes('chillhop') ||
    fullText.includes('study beats') ||
    fullText.includes('sleep beats') ||
    fullText.includes('chill beats')
  ) {
    detectedGenre = 'lo-fi';
    detectedLang = 'instrumental';
    confidence = 'high';
  }
  // Rock / Metal
  else if (
    fullText.includes('rock') ||
    fullText.includes('metal') ||
    fullText.includes('grunge') ||
    fullText.includes('punk') ||
    categoryLower.includes('rock')
  ) {
    detectedGenre = 'rock';
    confidence = 'medium';
  }
  // EDM / Electronic
  else if (
    fullText.includes('edm') ||
    fullText.includes('electronic') ||
    fullText.includes('house music') ||
    fullText.includes('techno') ||
    fullText.includes('trance') ||
    fullText.includes('dubstep') ||
    categoryLower.includes('electronic') ||
    categoryLower.includes('dance')
  ) {
    detectedGenre = 'edm';
    confidence = 'medium';
  }
  // Hip Hop
  else if (
    fullText.includes('hip hop') ||
    fullText.includes('hip-hop') ||
    fullText.includes('rap') ||
    fullText.includes('trap') ||
    categoryLower.includes('hip-hop')
  ) {
    detectedGenre = 'hip-hop';
    confidence = 'medium';
  }
  // Punjabi
  else if (
    fullText.includes('punjabi') ||
    fullText.includes('bhangra')
  ) {
    detectedGenre = 'punjabi';
    detectedLang = 'punjabi';
    confidence = 'high';
  }
  // Latin / Reggaeton
  else if (
    fullText.includes('reggaeton') ||
    fullText.includes('latin') ||
    fullText.includes('urbano')
  ) {
    detectedGenre = 'latin';
    detectedLang = 'spanish';
    confidence = 'high';
  }
  // Fallback to existing category on track
  else if (track.category) {
    const cat = track.category.toLowerCase();
    if (cat.includes('rock')) detectedGenre = 'rock';
    else if (cat.includes('pop')) detectedGenre = 'pop';
    else if (cat.includes('synthpop')) detectedGenre = 'pop';
    else if (cat.includes('chill') || cat.includes('lofi')) detectedGenre = 'lo-fi';
    confidence = 'medium';
  }

  // Derive related artists based on detected genre if not in map
  const genreRelated = getGenreRepresentativeArtists(detectedGenre);
  const queries = buildSearchQueries(detectedGenre, detectedLang, track.artist, genreRelated);

  return {
    genre: detectedGenre,
    language: detectedLang,
    confidence,
    seedArtist: track.artist,
    seedTitle: track.title,
    relatedArtists: genreRelated,
    searchQueries: queries,
  };
}

function getGenreRepresentativeArtists(genre: DetectedGenre): string[] {
  switch (genre) {
    case 'phonk':
      return ['DVRST', 'Kordhell', 'Pharmacist', 'Hensonn', 'PlayaPhonk', 'Sxmpra'];
    case 'nepali':
      return ['Sajjan Raj Vaidya', 'Bipul Chettri', 'Sushant KC', 'Yabesh Thapa', 'Tribal Rain', 'The Elements'];
    case 'hindi':
      return ['Arijit Singh', 'Pritam', 'Atif Aslam', 'Shreya Ghoshal', 'Jubin Nautiyal', 'Sachin-Jigar'];
    case 'k-pop':
      return ['NewJeans', 'LE SSERAFIM', 'BLACKPINK', 'BTS', 'TWICE', 'Stray Kids'];
    case 'rock':
      return ['Linkin Park', 'Queen', 'Foo Fighters', 'Green Day', 'Coldplay', 'Nirvana'];
    case 'edm':
      return ['Alan Walker', 'Avicii', 'Martin Garrix', 'Marshmello', 'The Chainsmokers', 'Kygo'];
    case 'lo-fi':
      return ['Lofi Girl', 'Potsu', 'Jinsang', 'Kudasaibeats', 'Idealism'];
    case 'hip-hop':
      return ['Kendrick Lamar', 'Drake', 'J. Cole', 'Travis Scott', 'Eminem'];
    case 'punjabi':
      return ['AP Dhillon', 'Sidhu Moose Wala', 'Diljit Dosanjh', 'Karan Aujla'];
    case 'latin':
      return ['Bad Bunny', 'J Balvin', 'Rauw Alejandro', 'Ozuna'];
    case 'j-pop':
      return ['YOASOBI', 'Kenshi Yonezu', 'Eve', 'Ado'];
    case 'pop':
    default:
      return ['The Weeknd', 'Dua Lipa', 'Bruno Mars', 'Taylor Swift', 'Ed Sheeran'];
  }
}

function buildSearchQueries(
  genre: DetectedGenre,
  lang: DetectedLanguage,
  artist: string,
  relatedArtists: string[]
): string[] {
  const cleanArt = cleanArtistName(artist);
  const queries: string[] = [];

  switch (genre) {
    case 'phonk':
      queries.push(`${cleanArt} phonk audio`);
      queries.push(`drift phonk bass boosted audio`);
      queries.push(`best phonk songs audio`);
      if (relatedArtists[0]) queries.push(`${relatedArtists[0]} phonk audio`);
      if (relatedArtists[1]) queries.push(`${relatedArtists[1]} phonk audio`);
      break;

    case 'nepali':
      queries.push(`${cleanArt} nepali song audio`);
      queries.push(`nepali acoustic song audio`);
      queries.push(`nepali modern songs best audio`);
      if (relatedArtists[0]) queries.push(`${relatedArtists[0]} nepali song audio`);
      if (relatedArtists[1]) queries.push(`${relatedArtists[1]} nepali song audio`);
      break;

    case 'hindi':
      queries.push(`${cleanArt} hindi song audio`);
      queries.push(`bollywood hits hindi songs audio`);
      queries.push(`hindi acoustic romantic songs audio`);
      if (relatedArtists[0]) queries.push(`${relatedArtists[0]} hindi song audio`);
      if (relatedArtists[1]) queries.push(`${relatedArtists[1]} hindi song audio`);
      break;

    case 'k-pop':
      queries.push(`${cleanArt} kpop song audio`);
      queries.push(`kpop hits playlist audio`);
      queries.push(`korean pop best songs audio`);
      if (relatedArtists[0]) queries.push(`${relatedArtists[0]} kpop song audio`);
      if (relatedArtists[1]) queries.push(`${relatedArtists[1]} kpop song audio`);
      break;

    case 'rock':
      queries.push(`${cleanArt} rock audio`);
      queries.push(`alternative rock classics audio`);
      queries.push(`modern rock hits audio`);
      if (relatedArtists[0]) queries.push(`${relatedArtists[0]} rock audio`);
      if (relatedArtists[1]) queries.push(`${relatedArtists[1]} rock audio`);
      break;

    case 'edm':
      queries.push(`${cleanArt} edm audio`);
      queries.push(`electronic dance music hits audio`);
      queries.push(`festival edm playlist audio`);
      if (relatedArtists[0]) queries.push(`${relatedArtists[0]} edm audio`);
      if (relatedArtists[1]) queries.push(`${relatedArtists[1]} edm audio`);
      break;

    case 'lo-fi':
      queries.push(`${cleanArt} lofi chill beats`);
      queries.push(`lofi hip hop chill study beats audio`);
      queries.push(`relaxing lofi beats audio`);
      break;

    case 'hip-hop':
      queries.push(`${cleanArt} hip hop audio`);
      queries.push(`hip hop rap hits audio`);
      if (relatedArtists[0]) queries.push(`${relatedArtists[0]} songs audio`);
      break;

    case 'punjabi':
      queries.push(`${cleanArt} punjabi song audio`);
      queries.push(`punjabi hits songs audio`);
      if (relatedArtists[0]) queries.push(`${relatedArtists[0]} punjabi song audio`);
      break;

    case 'latin':
      queries.push(`${cleanArt} reggaeton latin audio`);
      queries.push(`latin hits urbano audio`);
      break;

    case 'j-pop':
      queries.push(`${cleanArt} jpop audio`);
      queries.push(`jpop hits playlist audio`);
      break;

    case 'pop':
    default:
      queries.push(`${cleanArt} best songs audio`);
      queries.push(`${cleanArt} similar songs audio`);
      if (relatedArtists[0]) queries.push(`${relatedArtists[0]} songs audio`);
      if (relatedArtists[1]) queries.push(`${relatedArtists[1]} songs audio`);
      break;
  }

  return queries;
}

/**
 * Live search via the server's /api/search endpoint (Innertube + HTML scrape)
 */
async function fetchProviderTracks(query: string, limit: number = 8): Promise<Track[]> {
  try {
    let url = apiUrl(`/api/search?q=${encodeURIComponent(query)}`);
    if (typeof window === 'undefined' && url.startsWith('/')) {
      url = `http://localhost:3000${url}`;
    }
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data.results)) return [];

    const tracks: Track[] = [];
    for (const item of data.results) {
      if (!item.id || !/^[a-zA-Z0-9_-]{11}$/.test(item.id)) continue;

      const dur = typeof item.duration === 'number' && item.duration > 0 ? item.duration : 210;
      // Filter out > 12 min compilations / 1 hour loops and < 45s audio snippets
      if (dur > 720 || dur < 45) continue;

      const rawTitle = item.title || '';
      const lower = rawTitle.toLowerCase();
      // Filter obvious non-track compilation text
      if (
        lower.includes('1 hour') ||
        lower.includes('10 hours') ||
        lower.includes('full album') ||
        lower.includes('all songs compilation')
      ) {
        continue;
      }

      tracks.push({
        id: item.id,
        title: cleanTitle(rawTitle),
        artist: cleanArtistName(item.artist || 'Artist'),
        album: item.album,
        duration: dur,
        thumbnail: getGenuineThumbnail(item.id, item.thumbnail),
        videoUrl: `https://www.youtube.com/watch?v=${item.id}`,
        views: item.views,
      });

      if (tracks.length >= limit) break;
    }
    return tracks;
  } catch (err) {
    console.warn('[SmartAutoplay] Live search failed for query:', query, err);
    return [];
  }
}

/**
 * Scores a candidate track against the music profile and seed track.
 * Weighted scoring:
 * - Genre keyword / signature match: +50
 * - Language match: +40
 * - Same verified artist: +35 (capped at max tracks)
 * - Related artist match: +30
 * - User taste profile affinity: +15
 * - Penalties for cross-genre or mismatching language: -60
 */
export function scoreCandidateTrack(
  candidate: Track,
  profile: MusicGenreProfileInternal,
  seedTrack: Track,
  topAffinities: string[]
): number {
  let score = 0;
  const candTitle = (candidate.title || '').toLowerCase();
  const candArtist = cleanArtistName(candidate.artist || '').toLowerCase();
  const candText = `${candTitle} ${candArtist}`;

  // 1. Same artist bonus
  const cleanSeedArt = cleanArtistName(seedTrack.artist || '').toLowerCase();
  if (candArtist === cleanSeedArt || candArtist.includes(cleanSeedArt) || cleanSeedArt.includes(candArtist)) {
    score += 40;
  }

  // 2. Related artist bonus
  for (const rel of profile.relatedArtists) {
    const relLower = rel.toLowerCase();
    if (candArtist.includes(relLower) || relLower.includes(candArtist)) {
      score += 35;
      break;
    }
  }

  // 3. Genre matching & keyword validation
  switch (profile.genre) {
    case 'phonk':
      if (candText.includes('phonk') || candText.includes('drift') || candText.includes('cowbell')) {
        score += 50;
      } else if (candText.includes('rock') || candText.includes('kpop') || candText.includes('nepali')) {
        score -= 60; // Strong penalty for cross-genre mismatch
      }
      break;

    case 'nepali':
      if (
        candText.includes('nepali') ||
        detectScript(candText) === 'nepali' ||
        profile.relatedArtists.some((a) => candArtist.includes(a.toLowerCase()))
      ) {
        score += 55;
      } else if (detectScript(candText) === 'korean' || candText.includes('phonk')) {
        score -= 70;
      }
      break;

    case 'hindi':
      if (
        candText.includes('hindi') ||
        candText.includes('bollywood') ||
        detectScript(candText) === 'hindi' ||
        profile.relatedArtists.some((a) => candArtist.includes(a.toLowerCase()))
      ) {
        score += 50;
      } else if (candText.includes('phonk') || detectScript(candText) === 'korean') {
        score -= 60;
      }
      break;

    case 'k-pop':
      if (
        candText.includes('kpop') ||
        candText.includes('k-pop') ||
        detectScript(candText) === 'korean' ||
        profile.relatedArtists.some((a) => candArtist.includes(a.toLowerCase()))
      ) {
        score += 55;
      } else if (candText.includes('nepali') || candText.includes('phonk')) {
        score -= 70;
      }
      break;

    case 'rock':
      if (candText.includes('rock') || candText.includes('band') || profile.relatedArtists.some((a) => candArtist.includes(a.toLowerCase()))) {
        score += 45;
      }
      break;

    case 'edm':
      if (candText.includes('edm') || candText.includes('remix') || candText.includes('mix') || candText.includes('dance')) {
        score += 45;
      }
      break;

    case 'lo-fi':
      if (candText.includes('lofi') || candText.includes('lo-fi') || candText.includes('chill') || candText.includes('beats')) {
        score += 50;
      }
      break;

    case 'punjabi':
      if (candText.includes('punjabi') || profile.relatedArtists.some((a) => candArtist.includes(a.toLowerCase()))) {
        score += 50;
      }
      break;

    default:
      score += 15;
      break;
  }

  // 4. Taste profile affinity bonus
  for (const aff of topAffinities) {
    if (candArtist.includes(aff.toLowerCase())) {
      score += 15;
      break;
    }
  }

  return score;
}

type MusicGenreProfileInternal = MusicProfile;

// Cache to prevent duplicate queries for the same track
const smartQueueCache = new Map<string, { queue: Track[]; profile: MusicProfile; timestamp: number }>();
const CACHE_TTL_MS = 8 * 60 * 1000;

/**
 * Generates 15–30 high quality related candidate tracks for the seed track.
 * Respects the ~70% core style / 20% related artists / 10% discovery mix.
 * Deduplicates by stable ID and limits same artist to max 3 tracks.
 */
export async function generateSmartAutoplayQueue(
  seedTrack: Track,
  options: {
    history?: Track[];
    existingQueue?: Track[];
    customPlaylists?: Playlist[];
    favorites?: Track[];
    targetCount?: number;
  } = {}
): Promise<{ queue: Track[]; profile: MusicProfile }> {
  if (!seedTrack || !seedTrack.id) {
    return { queue: [], profile: detectTrackMusicProfile({ id: 'dummy', title: 'Unknown', artist: 'Unknown', duration: 210, thumbnail: '' }) };
  }

  const targetCount = options.targetCount || 24;
  const cacheKey = `smart_q:${seedTrack.id}`;
  const cached = smartQueueCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS && cached.queue.length >= 10) {
    return { queue: cached.queue, profile: cached.profile };
  }

  // 1. Detect Music Profile
  const profile = detectTrackMusicProfile(seedTrack);
  const tasteProfile = getStoredTasteProfile();
  const topAffinityNames = getTopAffinityArtists(5).map((a) => a.artist);

  // Set of IDs to avoid repeating
  const seenIds = new Set<string>();
  seenIds.add(seedTrack.id);

  // Avoid recent history tracks (last 8)
  const recentHistory = options.history || getListeningHistory().map((h) => h.track);
  for (const t of recentHistory.slice(0, 8)) {
    if (t?.id) seenIds.add(t.id);
  }

  // Avoid tracks already in existing queue
  if (options.existingQueue) {
    for (const t of options.existingQueue) {
      if (t?.id) seenIds.add(t.id);
    }
  }

  const rawCandidates: Track[] = [];

  // 2. Fetch candidates from bundled catalog matching genre or related artists
  const catalogTracks = getAllCatalogTracks(options.customPlaylists || [], options.favorites || []);
  for (const catTrack of catalogTracks) {
    if (seenIds.has(catTrack.id)) continue;
    const catArt = cleanArtistName(catTrack.artist).toLowerCase();
    const isRelated = profile.relatedArtists.some((a) => catArt.includes(a.toLowerCase()));
    const isSameArt = catArt.includes(cleanArtistName(seedTrack.artist).toLowerCase());
    const isSameGenre = (catTrack.category || '').toLowerCase().includes(profile.genre);

    if (isRelated || isSameArt || isSameGenre) {
      rawCandidates.push(catTrack);
    }
  }

  // 3. Concurrently fetch candidates from live provider search using profile queries
  const queriesToRun = profile.searchQueries.slice(0, 4);
  const searchPromises = queriesToRun.map((q) => fetchProviderTracks(q, 7));
  const queryResults = await Promise.allSettled(searchPromises);

  for (const res of queryResults) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      for (const t of res.value) {
        if (!seenIds.has(t.id)) {
          rawCandidates.push(t);
        }
      }
    }
  }

  // 4. Secondary fallback: if still insufficient candidates, query general artist radio
  if (rawCandidates.length < 12) {
    const fallbackTracks = await fetchProviderTracks(`${cleanArtistName(seedTrack.artist)} songs audio`, 8);
    for (const t of fallbackTracks) {
      if (!seenIds.has(t.id)) {
        rawCandidates.push(t);
      }
    }
  }

  // 5. Deduplicate and score all candidates
  const candidateMap = new Map<string, { track: Track; score: number }>();

  for (const cand of rawCandidates) {
    if (!cand?.id || seenIds.has(cand.id)) continue;
    if (candidateMap.has(cand.id)) continue;

    const score = scoreCandidateTrack(cand, profile, seedTrack, topAffinityNames);
    // Discard strong negative mismatch scores
    if (score < 0) continue;

    candidateMap.set(cand.id, { track: cand, score });
  }

  // 6. Sort scored candidates and enforce diversity (max 2-3 tracks per artist)
  const scoredList = Array.from(candidateMap.values()).sort((a, b) => b.score - a.score);

  const artistCounts: Record<string, number> = {};
  const selectedCore: Track[] = [];
  const selectedAdjacent: Track[] = [];
  const selectedDiscovery: Track[] = [];

  const maxPerArtist = 3;

  for (const { track, score } of scoredList) {
    const artKey = cleanArtistName(track.artist).toLowerCase();
    const count = artistCounts[artKey] || 0;
    if (count >= maxPerArtist) continue;

    artistCounts[artKey] = count + 1;

    if (score >= 45) {
      selectedCore.push(track);
    } else if (score >= 25) {
      selectedAdjacent.push(track);
    } else {
      selectedDiscovery.push(track);
    }

    if (selectedCore.length + selectedAdjacent.length + selectedDiscovery.length >= targetCount + 6) {
      break;
    }
  }

  // 7. Assemble Smart Queue Mix:
  // ~70% core matches, ~20% related/adjacent, ~10% discovery
  const coreTarget = Math.round(targetCount * 0.7);
  const adjTarget = Math.round(targetCount * 0.2);
  const discTarget = targetCount - coreTarget - adjTarget;

  // Controlled shuffle within tiers to keep repeated sessions fresh
  const shuffleSlice = (arr: Track[], count: number) => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const finalTracks: Track[] = [
    ...shuffleSlice(selectedCore, coreTarget),
    ...shuffleSlice(selectedAdjacent, adjTarget),
    ...shuffleSlice(selectedDiscovery, discTarget),
  ];

  // If still below targetCount, fill from remaining sorted candidates
  if (finalTracks.length < targetCount) {
    const remaining = scoredList
      .map((s) => s.track)
      .filter((t) => !finalTracks.some((f) => f.id === t.id));
    finalTracks.push(...remaining.slice(0, targetCount - finalTracks.length));
  }

  // Final interleave/shuffle: keep the top 2 best matches immediately up-next,
  // then lightly shuffle the rest so subsequent tracks are dynamic
  let finalizedQueue: Track[] = [];
  if (finalTracks.length > 2) {
    const topPicks = finalTracks.slice(0, 2);
    const rest = [...finalTracks.slice(2)].sort(() => Math.random() - 0.5);
    finalizedQueue = [...topPicks, ...rest];
  } else {
    finalizedQueue = finalTracks;
  }

  // Store in cache
  smartQueueCache.set(cacheKey, {
    queue: finalizedQueue,
    profile,
    timestamp: Date.now(),
  });

  return {
    queue: finalizedQueue,
    profile,
  };
}

/**
 * Expands an existing queue when only a few tracks remain before running empty.
 */
export async function expandSmartAutoplayQueue(
  currentTrack: Track,
  existingQueue: Track[],
  options: { customPlaylists?: Playlist[]; favorites?: Track[] } = {}
): Promise<Track[]> {
  const { queue: freshCandidates } = await generateSmartAutoplayQueue(currentTrack, {
    existingQueue,
    customPlaylists: options.customPlaylists,
    favorites: options.favorites,
    targetCount: 15,
  });

  const existingIds = new Set(existingQueue.map((t) => t.id));
  const newAdditions = freshCandidates.filter((t) => !existingIds.has(t.id));

  return newAdditions;
}
