import { LyricsLine } from '../types';

export interface ParsedLrcResult {
  lines: LyricsLine[];
  metadata: Record<string, string>;
  isValid: boolean;
  errors: string[];
}

/**
 * Robust, production-grade LRC Parser.
 * Supports:
 * - [mm:ss.xx], [mm:ss.xxx], [m:ss.xx], [m:ss], [hh:mm:ss.xx]
 * - Multiple timestamps on a single line (e.g., [00:05.20][00:15.80]Repeated lyric)
 * - Metadata tags ([ti:Title], [ar:Artist], [al:Album], [by:Creator], [offset:+200], etc.)
 * - Nepali Devanagari Unicode and Multilingual scripts without character corruption
 * - Returns chronologically sorted lyric lines with both seconds and milliseconds
 */
export function parseLrcString(lrcContent: string, offsetMs: number = 0): LyricsLine[] {
  if (!lrcContent || typeof lrcContent !== 'string') return [];

  const lines: LyricsLine[] = [];
  const rawLines = lrcContent.split(/\r?\n/);

  // Match timestamps like [01:23.45], [1:23.45], [01:23], [01:23.456], [00:01:23.45]
  const timestampRegex = /\[(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?\]/g;
  const metadataRegex = /^\s*\[([a-zA-Z]+)\s*:\s*(.*?)\]\s*$/;

  let fileOffset = offsetMs;

  // First pass: extract metadata offset if present
  for (const raw of rawLines) {
    const metaMatch = metadataRegex.exec(raw.trim());
    if (metaMatch) {
      const key = metaMatch[1].toLowerCase();
      const val = metaMatch[2].trim();
      if (key === 'offset') {
        const parsedOffset = parseInt(val, 10);
        if (!isNaN(parsedOffset)) {
          fileOffset += parsedOffset;
        }
      }
    }
  }

  for (const raw of rawLines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // Skip pure metadata lines
    if (metadataRegex.test(trimmed)) {
      continue;
    }

    // Extract all timestamps on this line
    const matches: { totalMs: number; timeSec: number }[] = [];
    let match: RegExpExecArray | null;

    timestampRegex.lastIndex = 0;
    while ((match = timestampRegex.exec(trimmed)) !== null) {
      let hours = 0;
      let minutes = 0;
      let seconds = 0;
      let ms = 0;

      if (match[3] !== undefined) {
        // [hh:mm:ss.xx]
        hours = parseInt(match[1], 10) || 0;
        minutes = parseInt(match[2], 10) || 0;
        seconds = parseInt(match[3], 10) || 0;
      } else {
        // [mm:ss.xx]
        minutes = parseInt(match[1], 10) || 0;
        seconds = parseInt(match[2], 10) || 0;
      }

      if (match[4]) {
        const msStr = match[4].padEnd(3, '0').slice(0, 3);
        ms = parseInt(msStr, 10) || 0;
      }

      const totalMs = Math.max(0, hours * 3600000 + minutes * 60000 + seconds * 1000 + ms + fileOffset);
      matches.push({
        totalMs,
        timeSec: +(totalMs / 1000).toFixed(3),
      });
    }

    if (matches.length > 0) {
      // Strip timestamps to get the lyric text
      const text = trimmed.replace(timestampRegex, '').trim();

      // For each timestamp attached to this text, create a line
      for (const t of matches) {
        lines.push({
          time: t.timeSec,
          timeMs: t.totalMs,
          text: text,
        });
      }
    }
  }

  // Sort chronologically and deduplicate exact identical timestamps and texts
  lines.sort((a, b) => a.timeMs - b.timeMs);

  const deduplicated: LyricsLine[] = [];
  for (let i = 0; i < lines.length; i++) {
    const current = lines[i];
    const prev = deduplicated[deduplicated.length - 1];
    if (!prev || prev.timeMs !== current.timeMs || prev.text !== current.text) {
      deduplicated.push(current);
    }
  }

  return deduplicated;
}

/**
 * Validates an LRC text block and provides helpful feedback for the Admin Lyrics Editor.
 */
export function validateLrcString(lrcContent: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  parsedLinesCount: number;
  parsedLines: LyricsLine[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!lrcContent || !lrcContent.trim()) {
    return {
      isValid: false,
      errors: ['Lyrics content cannot be empty.'],
      warnings: [],
      parsedLinesCount: 0,
      parsedLines: [],
    };
  }

  const rawLines = lrcContent.split(/\r?\n/);
  const parsedLines = parseLrcString(lrcContent);

  let hasTimestamp = false;
  let lineNum = 0;

  for (const raw of rawLines) {
    lineNum++;
    const trimmed = raw.trim();
    if (!trimmed) continue;

    if (/^\[(ti|ar|al|by|offset|length|re|ve):/i.test(trimmed)) {
      continue;
    }

    if (/\[\d{1,2}:\d{2}/.test(trimmed)) {
      hasTimestamp = true;
      // Check for malformed seconds like [00:75.00]
      const secMatch = /\[\d{1,2}:(\d{2})/.exec(trimmed);
      if (secMatch && parseInt(secMatch[1], 10) >= 60) {
        warnings.push(`Line ${lineNum}: Seconds value "${secMatch[1]}" exceeds 59.`);
      }
    } else {
      // Line without timestamp in LRC mode
      warnings.push(`Line ${lineNum}: Plain text without timestamp "[mm:ss.xx]".`);
    }
  }

  if (!hasTimestamp && parsedLines.length === 0) {
    errors.push('No valid LRC timestamps found (e.g., "[00:12.50]"). Use Plain Text mode for unsynced lyrics.');
  }

  return {
    isValid: errors.length === 0 && parsedLines.length > 0,
    errors,
    warnings,
    parsedLinesCount: parsedLines.length,
    parsedLines,
  };
}

/**
 * Converts formatted structured lines into standard LRC string.
 */
export function formatToLrc(lines: LyricsLine[], metadata?: { title?: string; artist?: string; album?: string }): string {
  const metaHeader: string[] = [];
  if (metadata?.title) metaHeader.push(`[ti:${metadata.title}]`);
  if (metadata?.artist) metaHeader.push(`[ar:${metadata.artist}]`);
  if (metadata?.album) metaHeader.push(`[al:${metadata.album}]`);

  const lrcLines = lines.map((l) => {
    const mins = Math.floor(l.timeMs / 60000);
    const secs = Math.floor((l.timeMs % 60000) / 1000);
    const ms = Math.floor((l.timeMs % 1000) / 10);
    const timeTag = `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}]`;
    return `${timeTag}${l.text}`;
  });

  return [...metaHeader, ...lrcLines].join('\n');
}

/**
 * Converts plain text into evenly distributed synced lines over song duration.
 */
export function createDistributedSyncedLines(plainText: string, durationSec: number = 200): LyricsLine[] {
  if (!plainText) return [];

  const rawLines = plainText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('[') && !l.startsWith('('));

  if (rawLines.length === 0) return [];

  const startMs = 5000; // 5s intro
  const availableMs = Math.max(15000, (durationSec * 1000) - 10000);
  const stepMs = Math.max(2500, Math.floor((availableMs - startMs) / rawLines.length));

  return rawLines.map((text, idx) => {
    const timeMs = startMs + idx * stepMs;
    return {
      time: +(timeMs / 1000).toFixed(2),
      timeMs,
      text,
    };
  });
}
