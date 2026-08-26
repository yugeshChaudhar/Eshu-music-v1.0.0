import fs from 'fs';
import path from 'path';

export interface ServerLyricsRecord {
  id: string;
  songId?: string;
  title: string;
  artist: string;
  album?: string;
  language?: 'Nepali' | 'English' | 'Hindi' | 'Other' | string;
  plainLyrics?: string;
  syncedLyrics?: string;
  source: string;
  createdAt: number | string;
  updatedAt: number | string;
}

// Normalized text cleaner for robust matching
export function normalizeForSearch(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics where applicable
    .replace(/(\(|\[)(official\s*(music\s*)?(video|audio|lyrics|hd|4k|remastered|lyric\s*video|visualizer)|remastered\s*\d*).*?(\)|\])/gi, '')
    .replace(/\s*-\s*(official\s*(music\s*)?(video|audio|lyrics)|visualizer)/gi, '')
    .replace(/\s+(ft\.|feat\.|featuring)\s+.*/gi, '')
    .replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '') // keep alphanumeric and Devanagari Unicode
    .trim();
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'lyrics_database.json');

// Built-in seed data featuring authentic Nepali Devanagari lyrics, Hindi & Global classics
const INITIAL_SEED_LYRICS: ServerLyricsRecord[] = [
  {
    id: 'eshu_nepali_sajjan_hataarindai',
    title: 'Hataarindai Bataasindai',
    artist: 'Sajjan Raj Vaidya',
    album: 'Single',
    language: 'Nepali',
    plainLyrics: `हतारिँदै बतासिँदै
कहाँ जान लागेको तिमी?
नरोकिने समय जस्तै
कहाँ उड्न लागेको तिमी?

यहाँ एकै छिन बस न
मेरो हात समाएर
मलाई हेर न तिम्रो आँखाले
तिम्रो त्यो न्यानो मायाले

तिमी जहाँ गए पनि
मेरो मुटु तिम्रै साथ छ
यो संसारको जुनसुकै कुनामा
हाम्रो माया जीवित रहन्छ`,
    syncedLyrics: `[00:00.00]♪ हतारिँदै बतासिँदै - सज्जन राज वैद्य ♪
[00:10.50]हतारिँदै बतासिँदै
[00:16.80]कहाँ जान लागेको तिमी?
[00:23.20]नरोकिने समय जस्तै
[00:29.40]कहाँ उड्न लागेको तिमी?
[00:36.00]यहाँ एकै छिन बस न
[00:42.50]मेरो हात समाएर
[00:49.00]मलाई हेर न तिम्रो आँखाले
[00:55.20]तिम्रो त्यो न्यानो मायाले
[01:03.00]तिमी जहाँ गए पनि
[01:09.50]मेरो मुटु तिम्रै साथ छ
[01:16.00]यो संसारको जुनसुकै कुनामा
[01:23.40]हाम्रो माया जीवित रहन्छ
[01:32.00]♪ Instrumental Melodic Interlude ♪
[01:45.00]हतारिँदै बतासिँदै
[01:52.00]कहाँ जान लागेको तिमी?`,
    source: 'ESHU Database',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'eshu_nepali_sajjan_dhawankh',
    title: 'Dhawankh (ढुङ्गाको मुटु)',
    artist: 'Sajjan Raj Vaidya',
    album: 'Dhawankh',
    language: 'Nepali',
    plainLyrics: `म त कालो काग झैं उड्दै छु
तिम्रो सम्झनाको आकाशमा
ढुङ्गाको मुटु बोकेर हिँड्दै छु
यो विरानो सडकमा

तिमी फूल झैं फुलेकी छौ
कसैको आँगनमा
म काँडा झैं बिझिरहेछु
आफ्नै कल्पनामा`,
    syncedLyrics: `[00:00.00]♪ Dhawankh - Sajjan Raj Vaidya ♪
[00:14.20]म त कालो काग झैं उड्दै छु
[00:22.50]तिम्रो सम्झनाको आकाशमा
[00:31.00]ढुङ्गाको मुटु बोकेर हिँड्दै छु
[00:39.50]यो विरानो सडकमा
[00:48.00]तिमी फूल झैं फुलेकी छौ
[00:56.50]कसैको आँगनमा
[01:05.00]म काँडा झैं बिझिरहेछु
[01:13.50]आफ्नै कल्पनामा`,
    source: 'ESHU Database',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'eshu_nepali_sushant_aama',
    title: 'Aama (आमा)',
    artist: 'Sushant KC',
    album: 'Single',
    language: 'Nepali',
    plainLyrics: `आमा, तिम्रो न्यानो काखको याद आउँछ
यो परदेशी भूमिमा एक्लै हुँदा
तिम्रो त्यो मायालु बोली सम्झना आउँछ
सपना पूरा गर्न हिँडेको म`,
    syncedLyrics: `[00:00.00]♪ Aama - Sushant KC ♪
[00:12.00]आमा, तिम्रो न्यानो काखको याद आउँछ
[00:21.40]यो परदेशी भूमिमा एक्लै हुँदा
[00:30.50]तिम्रो त्यो मायालु बोली सम्झना आउँछ
[00:40.00]सपना पूरा गर्न हिँडेको म
[00:49.50]आमा, म फर्कि आउनेछु तिम्रो मुहारमा हाँसो लिएर`,
    source: 'ESHU Database',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'eshu_nepali_sushant_gulabi',
    title: 'Gulabi (गुलाबी)',
    artist: 'Sushant KC',
    album: 'Single',
    language: 'Nepali',
    plainLyrics: `तिम्रो त्यो गुलाबी आँखाले
मलाई हेरिदेऊ न एकपल्ट
तिम्रो त्यो मिठो मुस्कानले
मनै लोभ्यायो अचानक`,
    syncedLyrics: `[00:00.00]♪ Gulabi - Sushant KC ♪
[00:11.50]तिम्रो त्यो गुलाबी आँखाले
[00:19.00]मलाई हेरिदेऊ न एकपल्ट
[00:26.50]तिम्रो त्यो मिठो मुस्कानले
[00:34.00]मनै लोभ्यायो अचानक
[00:41.50]गुलाबी तिम्रो गाला... मन मेरो उड्यो बादल पारी`,
    source: 'ESHU Database',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'eshu_nepali_tribalrain_bhanai',
    title: 'Bhanai (भनाई)',
    artist: 'Tribal Rain',
    album: 'Roka Yo Samay',
    language: 'Nepali',
    plainLyrics: `के भन्नु र खै तिमीलाई?
शब्दहरु सबै हराए झैं लाग्छ
मनको कुरा मनमै रह्यो
बताससँगै बगेर गयो

रोक यो समयलाई एकै छिन
म तिमीलाई हेरिरहुँ
जिन्दगीको यो यात्रामा
तिम्रै साथ हिँडिरहुँ`,
    syncedLyrics: `[00:00.00]♪ Bhanai - Tribal Rain ♪
[00:15.00]के भन्नु र खै तिमीलाई?
[00:24.00]शब्दहरु सबै हराए झैं लाग्छ
[00:33.50]मनको कुरा मनमै रह्यो
[00:42.00]बताससँगै बगेर गयो
[00:52.00]रोक यो समयलाई एकै छिन
[01:01.00]म तिमीलाई हेरिरहुँ
[01:10.00]जिन्दगीको यो यात्रामा
[01:19.00]तिम्रै साथ हिँडिरहुँ`,
    source: 'ESHU Database',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'eshu_nepali_bipul_syndicate',
    title: 'Syndicate (सिन्डिकेट)',
    artist: 'Bipul Chettri',
    album: 'Sketches of Darjeeling',
    language: 'Nepali',
    plainLyrics: `तिमी र म बस्यौ सिन्डिकेटको गाडीमा
झ्यालबाट देखिने ती हरिया पहाडमा
धुवाँ उडाउँदै गफिँदै गयौ
मनका कुरा सुनाउँदै गयौ

सिन्डिकेटको यात्रा लामो भए पनि
तिम्रो साथ छोटो लाग्यो सधैं भरि`,
    syncedLyrics: `[00:00.00]♪ Syndicate - Bipul Chettri ♪
[00:13.50]तिमी र म बस्यौ सिन्डिकेटको गाडीमा
[00:22.00]झ्यालबाट देखिने ती हरिया पहाडमा
[00:31.00]धुवाँ उडाउँदै गफिँदै गयौ
[00:40.00]मनका कुरा सुनाउँदै गयौ
[00:50.00]सिन्डिकेटको यात्रा लामो भए पनि
[00:59.00]तिम्रो साथ छोटो लाग्यो सधैं भरि`,
    source: 'ESHU Database',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'eshu_nepali_arthur_nyanoghar',
    title: 'Nyano Ghar (न्यानो घर)',
    artist: 'Arthur Gunn (Dibesh Pokharel)',
    album: 'Single',
    language: 'Nepali',
    plainLyrics: `न्यानो घर मेरो पहाडको काखमा
सफा हावा चल्ने हरियाली डाँडामा
सम्झिरहन्छु म त्यो गाउँको गोरेटो
आमाले बनाएको कोदोको रोटी त्यो`,
    syncedLyrics: `[00:00.00]♪ Nyano Ghar - Arthur Gunn ♪
[00:12.80]न्यानो घर मेरो पहाडको काखमा
[00:22.00]सफा हावा चल्ने हरियाली डाँडामा
[00:32.00]सम्झिरहन्छु म त्यो गाउँको गोरेटो
[00:41.50]आमाले बनाएको कोदोको रोटी त्यो
[00:51.00]फर्कि आउनेछु म आफ्नै प्यारो घरमा`,
    source: 'ESHU Database',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'eshu_nepali_oasis_junkeri',
    title: 'Junkeri (जुन्केरी)',
    artist: 'Oasis Thapa',
    album: 'Single',
    language: 'Nepali',
    plainLyrics: `जुन्केरी झैं बल्दै छौ तिमी
मेरो यो अध्याँरो रातमा
तारा झैं चम्किरहेछौ तिमी
मेरो यो सानो संसारमा

म तिमीलाई सम्झिरहन्छु
हरेक धड्कन र हरेक साससँगै`,
    syncedLyrics: `[00:00.00]♪ Junkeri - Oasis Thapa ♪
[00:14.00]जुन्केरी झैं बल्दै छौ तिमी
[00:23.00]मेरो यो अध्याँरो रातमा
[00:32.00]तारा झैं चम्किरहेछौ तिमी
[00:41.00]मेरो यो सानो संसारमा
[00:51.00]म तिमीलाई सम्झिरहन्छु
[01:00.00]हरेक धड्कन र हरेक साससँगै`,
    source: 'ESHU Database',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'eshu_global_queen_bohemian',
    songId: 'fJ9rUzIMcZQ',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    language: 'English',
    plainLyrics: `Is this the real life? Is this just fantasy?
Caught in a landslide, no escape from reality
Open your eyes, look up to the skies and see
I'm just a poor boy, I need no sympathy
Because I'm easy come, easy go, little high, little low
Any way the wind blows doesn't really matter to me, to me

Mama, just killed a man
Put a gun against his head, pulled my trigger, now he's dead
Mama, life had just begun
But now I've gone and thrown it all away
Mama, ooh, didn't mean to make you cry
If I'm not back again this time tomorrow
Carry on, carry on as if nothing really matters`,
    syncedLyrics: `[00:00.00]Is this the real life? Is this just fantasy?
[00:07.50]Caught in a landslide, no escape from reality
[00:14.80]Open your eyes, look up to the skies and see
[00:22.00]I'm just a poor boy, I need no sympathy
[00:28.50]Because I'm easy come, easy go, little high, little low
[00:36.00]Any way the wind blows doesn't really matter to me, to me
[00:55.00]Mama, just killed a man
[01:02.00]Put a gun against his head, pulled my trigger, now he's dead
[01:10.00]Mama, life had just begun
[01:16.00]But now I've gone and thrown it all away
[01:23.00]Mama, ooh, didn't mean to make you cry
[01:31.00]If I'm not back again this time tomorrow
[01:36.00]Carry on, carry on as if nothing really matters`,
    source: 'ESHU Database',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'eshu_global_weeknd_blindinglights',
    songId: '4NRXx6U8ABQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    language: 'English',
    plainLyrics: `Yeah
I've been tryna call
I've been on my own for long enough
Maybe you can show me how to love, maybe
I'm going through withdrawals
You don't even have to do too much
You can turn me on with just a touch, baby

I look around and Sin City's cold and empty
No one's around to judge me
I can't see clearly when you're gone

I said, ooh, I'm blinded by the lights
No, I can't sleep until I feel your touch
I said, ooh, I'm drowning in the night
Oh, when I'm like this, you're the one I trust`,
    syncedLyrics: `[00:00.00]♪ Synthesizer Intro ♪
[00:15.50]Yeah
[00:20.00]I've been tryna call
[00:23.50]I've been on my own for long enough
[00:27.50]Maybe you can show me how to love, maybe
[00:35.00]I'm going through withdrawals
[00:38.50]You don't even have to do too much
[00:43.00]You can turn me on with just a touch, baby
[00:49.50]I look around and Sin City's cold and empty
[00:54.00]No one's around to judge me
[00:57.00]I can't see clearly when you're gone
[01:02.00]I said, ooh, I'm blinded by the lights
[01:08.50]No, I can't sleep until I feel your touch
[01:16.00]I said, ooh, I'm drowning in the night
[01:23.50]Oh, when I'm like this, you're the one I trust`,
    source: 'ESHU Database',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'eshu_global_weeknd_saveyourtears',
    songId: 'XXYlFuWEuKI',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    language: 'English',
    plainLyrics: `I saw you dancing in a crowded room
You look so happy when I'm not with you
But then you saw me, caught you by surprise
A single teardrop falling from your eye

I don't know why I run away
I'll make you cry when I run away
Take me back 'cause I wanna stay
Save your tears for another day`,
    syncedLyrics: `[00:00.00]♪ Synth Melody ♪
[00:10.50]I saw you dancing in a crowded room
[00:16.00]You look so happy when I'm not with you
[00:21.00]But then you saw me, caught you by surprise
[00:26.50]A single teardrop falling from your eye
[00:32.00]I don't know why I run away
[00:42.00]I'll make you cry when I run away
[00:53.00]Take me back 'cause I wanna stay
[00:58.50]Save your tears for another day`,
    source: 'ESHU Database',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'eshu_global_linkin_numb',
    songId: 'kXYiU_JCYtU',
    title: 'Numb',
    artist: 'Linkin Park',
    album: 'Meteora',
    language: 'English',
    plainLyrics: `I'm tired of being what you want me to be
Feeling so faithless, lost under the surface
Don't know what you're expecting of me
Put under the pressure of walking in your shoes

I've become so numb, I can't feel you there
Become so tired, so much more aware
I'm becoming this, all I want to do
Is be more like me and be less like you`,
    syncedLyrics: `[00:00.00]♪ Instrumental Intro ♪
[00:19.50]I'm tired of being what you want me to be
[00:23.00]Feeling so faithless, lost under the surface
[00:26.50]Don't know what you're expecting of me
[00:30.00]Put under the pressure of walking in your shoes
[00:34.00]Every step that I take is another mistake to you
[00:41.50]I've become so numb, I can't feel you there
[00:47.00]Become so tired, so much more aware
[00:53.00]I'm becoming this, all I want to do
[00:58.00]Is be more like me and be less like you`,
    source: 'ESHU Database',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'eshu_global_edsheeran_shapeofyou',
    songId: 'JGwWNGJdvx8',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷',
    language: 'English',
    plainLyrics: `The club isn't the best place to find a lover
So the bar is where I go
Me and my friends at the table doing shots
Drinking fast and then we talk slow

Girl, you know I want your love
Your love was handmade for somebody like me
Come on now, follow my lead
I may be crazy, don't mind me

I'm in love with the shape of you
We push and pull like a magnet do
Although my heart is falling too
I'm in love with your body`,
    syncedLyrics: `[00:00.00]♪ Marimba Intro ♪
[00:09.50]The club isn't the best place to find a lover
[00:11.80]So the bar is where I go
[00:14.20]Me and my friends at the table doing shots
[00:16.80]Drinking fast and then we talk slow
[00:19.00]Come over and start up a conversation with just me
[00:21.80]And trust me I'll give it a chance now
[00:24.00]Girl, you know I want your love
[00:26.50]Your love was handmade for somebody like me
[00:29.00]Come on now, follow my lead
[00:31.50]I'm in love with the shape of you
[00:36.50]We push and pull like a magnet do
[00:41.50]Although my heart is falling too
[00:46.50]I'm in love with your body`,
    source: 'ESHU Database',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'eshu_hindi_arijit_kesariya',
    songId: 'BddP6PYo2gs',
    title: 'Kesariya',
    artist: 'Arijit Singh, Pritam',
    album: 'Brahmastra',
    language: 'Hindi',
    plainLyrics: `मुझको इतना बताए कोई
कैसे तुझसे दिल ना लगाए कोई
रब्बा ने तुझको बनाने में
कर दी है हुस्न की खाली तिजोरियां

केसरिया तेरा इश्क है पिया
रंग जाऊं जो मैं हाथ लगाऊं
दिन बीते सारा तेरी फिक्र में
रैन सारी तेरी खैर मनाऊं`,
    syncedLyrics: `[00:00.00]♪ Kesariya - Arijit Singh ♪
[00:18.00]मुझको इतना बताए कोई
[00:24.50]कैसे तुझसे दिल ना लगाए कोई
[00:32.00]रब्बा ने तुझको बनाने में
[00:39.00]कर दी है हुस्न की खाली तिजोरियां
[00:46.50]केसरिया तेरा इश्क है पिया
[00:53.00]रंग जाऊं जो मैं हाथ लगाऊं
[01:00.00]दिन बीते सारा तेरी फिक्र में
[01:07.50]रैन सारी तेरी खैर मनाऊं`,
    source: 'ESHU Database',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  }
];

class LyricsDatabase {
  private inMemoryDb: Map<string, ServerLyricsRecord> = new Map();
  private isLoaded: boolean = false;

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed: ServerLyricsRecord[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          for (const item of parsed) {
            this.inMemoryDb.set(item.id, item);
          }
          // Seed any missing defaults
          for (const seed of INITIAL_SEED_LYRICS) {
            if (!this.inMemoryDb.has(seed.id)) {
              this.inMemoryDb.set(seed.id, seed);
            }
          }
          this.saveToFile();
          this.isLoaded = true;
          return;
        }
      }

      // Populate with initial seeds
      for (const seed of INITIAL_SEED_LYRICS) {
        this.inMemoryDb.set(seed.id, seed);
      }
      this.saveToFile();
      this.isLoaded = true;
    } catch (err) {
      console.warn('LyricsDatabase initialization warning:', err);
      // Fallback in-memory only
      for (const seed of INITIAL_SEED_LYRICS) {
        this.inMemoryDb.set(seed.id, seed);
      }
      this.isLoaded = true;
    }
  }

  private saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const records = Array.from(this.inMemoryDb.values());
      fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), 'utf8');
    } catch (err) {
      console.warn('Could not persist lyrics database to file system:', err);
    }
  }

  public getAll(): ServerLyricsRecord[] {
    return Array.from(this.inMemoryDb.values()).sort((a, b) => {
      const aTime = typeof a.updatedAt === 'number' ? a.updatedAt : 0;
      const bTime = typeof b.updatedAt === 'number' ? b.updatedAt : 0;
      return bTime - aTime;
    });
  }

  public getById(id: string): ServerLyricsRecord | undefined {
    return this.inMemoryDb.get(id);
  }

  /**
   * Search lyrics in database by songId, track title, artist
   */
  public findMatch(title: string, artist: string, songId?: string): ServerLyricsRecord | null {
    const normTitle = normalizeForSearch(title);
    const normArtist = normalizeForSearch(artist);

    // 1. Direct songId match
    if (songId) {
      for (const record of this.inMemoryDb.values()) {
        if (record.songId && record.songId === songId) {
          return record;
        }
      }
    }

    // 2. Exact normalized title + artist
    for (const record of this.inMemoryDb.values()) {
      const rTitle = normalizeForSearch(record.title);
      const rArtist = normalizeForSearch(record.artist);

      if (rTitle === normTitle && rArtist === normArtist) {
        return record;
      }
    }

    // 3. Exact normalized title match
    for (const record of this.inMemoryDb.values()) {
      const rTitle = normalizeForSearch(record.title);
      if (rTitle && normTitle && (rTitle === normTitle || normTitle.includes(rTitle) || rTitle.includes(normTitle))) {
        // If artist matches loosely as well
        const rArtist = normalizeForSearch(record.artist);
        if (!normArtist || !rArtist || normArtist.includes(rArtist) || rArtist.includes(normArtist)) {
          return record;
        }
      }
    }

    return null;
  }

  public create(record: Omit<ServerLyricsRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): ServerLyricsRecord {
    const id = record.id || `eshu_user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();
    const newRecord: ServerLyricsRecord = {
      ...record,
      id,
      source: record.source || 'ESHU Database',
      createdAt: now,
      updatedAt: now,
    };

    this.inMemoryDb.set(id, newRecord);
    this.saveToFile();
    return newRecord;
  }

  public update(id: string, updates: Partial<ServerLyricsRecord>): ServerLyricsRecord | null {
    const existing = this.inMemoryDb.get(id);
    if (!existing) return null;

    const updated: ServerLyricsRecord = {
      ...existing,
      ...updates,
      id,
      updatedAt: Date.now(),
    };

    this.inMemoryDb.set(id, updated);
    this.saveToFile();
    return updated;
  }

  public delete(id: string): boolean {
    const deleted = this.inMemoryDb.delete(id);
    if (deleted) {
      this.saveToFile();
    }
    return deleted;
  }
}

export const serverLyricsDb = new LyricsDatabase();
