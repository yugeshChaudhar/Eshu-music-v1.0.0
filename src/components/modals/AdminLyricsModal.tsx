import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic2,
  Save,
  Trash2,
  Play,
  Pause,
  Clock,
  Sparkles,
  Check,
  AlertCircle,
  Database,
  FileText,
  Radio,
  Search,
  Edit3,
  RotateCcw,
  Languages,
  Music,
} from 'lucide-react';
import { Track, LyricsRecord, LyricsLine, LyricsData } from '../../types';
import { parseLrcString, validateLrcString, formatToLrc } from '../../services/lrcParser';
import {
  saveLyricsToDatabase,
  updateLyricsInDatabase,
  deleteLyricsFromDatabase,
  fetchAllDatabaseLyrics,
} from '../../services/lyricsService';

interface AdminLyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: Track | null;
  currentTime?: number;
  isPlaying?: boolean;
  onSeek?: (seconds: number) => void;
  onTogglePlay?: () => void;
  onLyricsSaved?: (lyricsData: LyricsData) => void;
  initialLyricsData?: LyricsData | null;
}

type TabMode = 'edit' | 'studio' | 'preview' | 'database';
type LyricInputType = 'lrc' | 'plain';

export const AdminLyricsModal: React.FC<AdminLyricsModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  currentTime = 0,
  isPlaying = false,
  onSeek,
  onTogglePlay,
  onLyricsSaved,
  initialLyricsData,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('edit');
  const [inputType, setInputType] = useState<LyricInputType>('lrc');

  // Form State
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [language, setLanguage] = useState<'Nepali' | 'English' | 'Hindi' | 'Other'>('Nepali');
  const [songId, setSongId] = useState('');
  const [lrcContent, setLrcContent] = useState('');
  const [plainContent, setPlainContent] = useState('');

  // Studio Tapper state
  const [studioLines, setStudioLines] = useState<{ text: string; timeMs?: number }[]>([]);
  const [currentStudioIndex, setCurrentStudioIndex] = useState(0);

  // Database list state
  const [dbRecords, setDbRecords] = useState<LyricsRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Live preview active index
  const previewLines = React.useMemo(() => {
    if (inputType === 'lrc' || activeTab === 'preview') {
      return parseLrcString(lrcContent);
    }
    return [];
  }, [lrcContent, inputType, activeTab]);

  const activeLyricIndex = React.useMemo(() => {
    if (!previewLines || previewLines.length === 0) return -1;
    const currentMs = currentTime * 1000;
    for (let i = previewLines.length - 1; i >= 0; i--) {
      if (currentMs >= previewLines[i].timeMs) {
        return i;
      }
    }
    return 0;
  }, [previewLines, currentTime]);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Populate when modal opens or currentTrack changes
  useEffect(() => {
    if (!isOpen) return;

    if (currentTrack) {
      setTitle(currentTrack.title || '');
      setArtist(currentTrack.artist || '');
      setAlbum(currentTrack.album || '');
      setSongId(currentTrack.id || '');
    }

    if (initialLyricsData) {
      if (initialLyricsData.syncedLyrics) {
        setLrcContent(initialLyricsData.syncedLyrics);
        setInputType('lrc');
      } else if (initialLyricsData.lines && initialLyricsData.lines.length > 0) {
        setLrcContent(formatToLrc(initialLyricsData.lines, { title: currentTrack?.title, artist: currentTrack?.artist }));
        setInputType('lrc');
      }

      if (initialLyricsData.plainLyrics) {
        setPlainContent(initialLyricsData.plainLyrics);
      }

      if (initialLyricsData.language) {
        setLanguage(initialLyricsData.language as any);
      }
      if (initialLyricsData.id) {
        setEditingRecordId(initialLyricsData.id);
      }
    }

    loadDatabaseRecords();
  }, [isOpen, currentTrack, initialLyricsData]);

  // Scroll active lyric in preview
  useEffect(() => {
    if (activeTab === 'preview' && activeLyricIndex >= 0 && previewContainerRef.current) {
      const activeEl = previewContainerRef.current.children[activeLyricIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLyricIndex, activeTab]);

  const loadDatabaseRecords = async () => {
    setIsLoadingDb(true);
    try {
      const records = await fetchAllDatabaseLyrics();
      setDbRecords(records);
    } catch {
      // Ignore
    } finally {
      setIsLoadingDb(false);
    }
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Convert plain text to Studio Tapper lines
  const prepareStudioFromPlain = () => {
    const lines = (plainContent || lrcContent.replace(/\[\d{2}:\d{2}(\.\d{2,3})?\]/g, ''))
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      showFeedback('error', 'Please enter some lyrics text first.');
      return;
    }

    setStudioLines(lines.map((text) => ({ text })));
    setCurrentStudioIndex(0);
    setActiveTab('studio');
  };

  // Stamp current audio time to active studio line
  const handleStampCurrentTime = () => {
    if (currentStudioIndex >= studioLines.length) return;

    const currentMs = Math.round(currentTime * 1000);
    const updated = [...studioLines];
    updated[currentStudioIndex] = {
      ...updated[currentStudioIndex],
      timeMs: currentMs,
    };
    setStudioLines(updated);

    if (currentStudioIndex < studioLines.length - 1) {
      setCurrentStudioIndex((prev) => prev + 1);
    }
  };

  // Finish Studio and generate LRC
  const handleApplyStudioToLrc = () => {
    const formatted: LyricsLine[] = studioLines
      .filter((l) => l.timeMs !== undefined)
      .map((l) => ({
        time: +((l.timeMs || 0) / 1000).toFixed(2),
        timeMs: l.timeMs || 0,
        text: l.text,
      }));

    if (formatted.length === 0) {
      showFeedback('error', 'No timestamps were stamped.');
      return;
    }

    const generatedLrc = formatToLrc(formatted, { title, artist, album });
    setLrcContent(generatedLrc);
    setInputType('lrc');
    setActiveTab('edit');
    showFeedback('success', `Generated synced LRC with ${formatted.length} lines!`);
  };

  const handleUseCurrentSong = () => {
    if (currentTrack) {
      setTitle(currentTrack.title || '');
      setArtist(currentTrack.artist || '');
      setAlbum(currentTrack.album || '');
      setSongId(currentTrack.id || '');
      showFeedback('success', `Loaded "${currentTrack.title}" info.`);
    }
  };

  const handleSelectRecordForEdit = (record: LyricsRecord) => {
    setEditingRecordId(record.id);
    setTitle(record.title);
    setArtist(record.artist);
    setAlbum(record.album || '');
    setLanguage((record.language as any) || 'Nepali');
    setSongId(record.songId || '');
    setLrcContent(record.syncedLyrics || '');
    setPlainContent(record.plainLyrics || '');
    setInputType(record.syncedLyrics ? 'lrc' : 'plain');
    setActiveTab('edit');
    showFeedback('success', `Loaded "${record.title}" for editing.`);
  };

  const handleDeleteRecord = async (id: string, recTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete lyrics for "${recTitle}"?`)) {
      return;
    }
    try {
      await deleteLyricsFromDatabase(id, recTitle, artist);
      setDbRecords((prev) => prev.filter((r) => r.id !== id));
      if (editingRecordId === id) {
        setEditingRecordId(null);
      }
      showFeedback('success', `Deleted "${recTitle}" from lyrics database.`);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete record.');
    }
  };

  const handleSaveLyrics = async () => {
    if (!title.trim()) {
      showFeedback('error', 'Song title is required.');
      return;
    }
    if (!artist.trim()) {
      showFeedback('error', 'Artist name is required.');
      return;
    }

    let finalLrc = lrcContent.trim();
    let finalPlain = plainContent.trim();

    if (inputType === 'lrc') {
      if (!finalLrc) {
        showFeedback('error', 'LRC lyrics content cannot be empty.');
        return;
      }
      const validation = validateLrcString(finalLrc);
      if (!validation.isValid && validation.errors.length > 0) {
        showFeedback('error', validation.errors[0]);
        return;
      }
      if (!finalPlain) {
        finalPlain = finalLrc.replace(/\[\d{2}:\d{2}(\.\d{2,3})?\]/g, '').trim();
      }
    } else {
      if (!finalPlain) {
        showFeedback('error', 'Plain lyrics content cannot be empty.');
        return;
      }
    }

    setIsSaving(true);
    try {
      let savedRecord: LyricsRecord;

      if (editingRecordId) {
        savedRecord = await updateLyricsInDatabase(editingRecordId, {
          title: title.trim(),
          artist: artist.trim(),
          album: album.trim() || undefined,
          language,
          songId: songId.trim() || undefined,
          syncedLyrics: finalLrc || undefined,
          plainLyrics: finalPlain,
          source: 'ESHU Database (Admin)',
        });
        showFeedback('success', `Successfully updated lyrics for "${title}"!`);
      } else {
        savedRecord = await saveLyricsToDatabase({
          title: title.trim(),
          artist: artist.trim(),
          album: album.trim() || undefined,
          language,
          songId: songId.trim() || undefined,
          syncedLyrics: finalLrc || undefined,
          plainLyrics: finalPlain,
          source: 'ESHU Database (Admin)',
        });
        setEditingRecordId(savedRecord.id);
        showFeedback('success', `Successfully saved lyrics for "${title}" to database!`);
      }

      // Notify parent to refresh current song's lyrics
      const parsedLines = finalLrc ? parseLrcString(finalLrc) : [];
      if (onLyricsSaved) {
        onLyricsSaved({
          id: savedRecord.id,
          songId: savedRecord.songId,
          synced: parsedLines.length > 0,
          lines: parsedLines,
          syncedLyrics: finalLrc,
          plainLyrics: finalPlain,
          source: 'ESHU Database',
          language,
          trackName: title,
          artistName: artist,
          album,
          isCustom: true,
        });
      }

      await loadDatabaseRecords();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save lyrics.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetForm = () => {
    setEditingRecordId(null);
    setTitle('');
    setArtist('');
    setAlbum('');
    setSongId('');
    setLrcContent('');
    setPlainContent('');
    setStudioLines([]);
    setCurrentStudioIndex(0);
    showFeedback('success', 'Cleared editor form.');
  };

  const formatTimestamp = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}]`;
  };

  if (!isOpen) return null;

  const validation = validateLrcString(lrcContent);

  const filteredDbRecords = dbRecords.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.language && r.language.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-neutral-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8ECAE6] to-[#219EBC] flex items-center justify-center text-black font-bold shadow-lg shadow-[#8ECAE6]/20">
              <Mic2 className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">ESHU Lyrics Studio</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#8ECAE6]/20 text-[#8ECAE6] border border-[#8ECAE6]/30">
                  ADMIN / CREATOR
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Add, synchronize, and manage Nepali, Hindi, and Global song lyrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentTrack && (
              <button
                type="button"
                onClick={handleUseCurrentSong}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white transition-colors border border-white/10"
                title="Fill metadata from playing track"
              >
                <Music className="w-3.5 h-3.5 text-[#8ECAE6]" />
                <span>Fill Playing Song</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Bar */}
        {feedback && (
          <div
            className={`px-6 py-2.5 flex items-center gap-2 text-xs font-medium transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/80 border-b border-rose-500/30 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-white/10 bg-neutral-900/50">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'edit'
                  ? 'border-[#8ECAE6] text-white bg-white/5'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Lyrics Editor</span>
              {editingRecordId && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'studio'
                  ? 'border-[#8ECAE6] text-white bg-white/5'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-[#8ECAE6]" />
              <span>Sync Tapper Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'preview'
                  ? 'border-[#8ECAE6] text-white bg-white/5'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Test & Sync</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('database');
                loadDatabaseRecords();
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'database'
                  ? 'border-[#8ECAE6] text-white bg-white/5'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>ESHU Database ({dbRecords.length})</span>
            </button>
          </div>

          {/* Quick Player Control in Modal */}
          {onTogglePlay && (
            <div className="flex items-center gap-2 pb-2">
              <button
                type="button"
                onClick={onTogglePlay}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 transition-colors border border-white/10"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isPlaying ? 'Pause Audio' : 'Play Audio'}</span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: LYRICS EDITOR */}
          {activeTab === 'edit' && (
            <div className="space-y-5">
              
              {/* Track Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                    Song Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Hataarindai Bataasindai"
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#8ECAE6] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                    Artist Name *
                  </label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="e.g. Sajjan Raj Vaidya"
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#8ECAE6] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#8ECAE6] transition-colors"
                  >
                    <option value="Nepali">Nepali (नेपाली)</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                    Album / YouTube Video ID
                  </label>
                  <input
                    type="text"
                    value={album || songId}
                    onChange={(e) => {
                      setAlbum(e.target.value);
                      if (e.target.value.length === 11) setSongId(e.target.value);
                    }}
                    placeholder="e.g. Dhawankh or Video ID"
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#8ECAE6] transition-colors"
                  />
                </div>
              </div>

              {/* Format Toggle & Quick Tools */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 font-medium">Input Format:</span>
                  <div className="inline-flex rounded-lg p-0.5 bg-neutral-950 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setInputType('lrc')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        inputType === 'lrc'
                          ? 'bg-[#8ECAE6] text-neutral-950 shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Synced LRC Format
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputType('plain')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        inputType === 'plain'
                          ? 'bg-[#8ECAE6] text-neutral-950 shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Plain Text Lyrics
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {inputType === 'lrc' && (
                    <button
                      type="button"
                      onClick={() => {
                        const stamp = formatTimestamp(Math.round(currentTime * 1000));
                        setLrcContent((prev) => `${prev ? prev + '\n' : ''}${stamp}`);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-white/10 transition-colors"
                      title="Insert timestamp at current audio playback point"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#8ECAE6]" />
                      <span>Insert Current Time ({formatTimestamp(Math.round(currentTime * 1000))})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={prepareStudioFromPlain}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[#8ECAE6]/10 hover:bg-[#8ECAE6]/20 text-[#8ECAE6] rounded-lg border border-[#8ECAE6]/30 transition-colors"
                    title="Launch Karaoke Tapper to sync lines with 1 click"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Sync in Studio</span>
                  </button>
                </div>
              </div>

              {/* Textarea Input */}
              <div>
                <textarea
                  value={inputType === 'lrc' ? lrcContent : plainContent}
                  onChange={(e) => {
                    if (inputType === 'lrc') setLrcContent(e.target.value);
                    else setPlainContent(e.target.value);
                  }}
                  placeholder={
                    inputType === 'lrc'
                      ? `[00:00.00]♪ Intro ♪\n[00:12.50]हतारिँदै बतासिँदै\n[00:18.00]कहाँ जान लागेको तिमी?\n[00:25.00]म तिमीलाई हेरिरहुँ...`
                      : `हतारिँदै बतासिँदै\nकहाँ जान लागेको तिमी?\nनरोकिने समय जस्तै...`
                  }
                  rows={12}
                  className="w-full p-4 bg-neutral-950 border border-white/10 rounded-xl text-sm font-mono text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#8ECAE6] transition-colors leading-relaxed selection:bg-[#8ECAE6]/30"
                  style={{ fontFamily: 'var(--font-mono, monospace), system-ui, -apple-system, sans-serif' }}
                />
              </div>

              {/* LRC Syntax Helper / Validation Status */}
              {inputType === 'lrc' && (
                <div className="p-3 bg-neutral-950/80 border border-white/10 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {validation.isValid ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <Check className="w-4 h-4" />
                        <span>Valid LRC Format ({validation.parsedLinesCount} timestamped lines)</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400 font-medium">
                        <AlertCircle className="w-4 h-4" />
                        <span>{validation.errors[0] || 'No timestamps detected yet.'}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-neutral-500 font-mono">
                    Nepali Unicode & Multilingual Supported
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STUDIO TAPPER (Interactive Karaoke Lyric Syncing) */}
          {activeTab === 'studio' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#8ECAE6]/10 border border-[#8ECAE6]/20 rounded-xl">
                <h3 className="text-sm font-bold text-[#8ECAE6] mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Real-Time Karaoke Tapper Studio</span>
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  1. Start music playback using the play button below or player. <br />
                  2. Whenever the singer starts singing the highlighted line, click the big <strong>"Stamp Current Time"</strong> button (or press Spacebar). <br />
                  3. When finished, click <strong>"Apply Studio Timestamps"</strong> to generate your synchronized LRC file!
                </p>
              </div>

              {studioLines.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <FileText className="w-12 h-12 text-neutral-600" />
                  <p className="text-sm text-neutral-400">
                    No lyrics loaded in studio. Enter plain lyrics in the Editor tab first.
                  </p>
                  <button
                    type="button"
                    onClick={prepareStudioFromPlain}
                    className="px-4 py-2 rounded-lg bg-[#8ECAE6] text-neutral-950 font-bold text-xs"
                  >
                    Load Lyrics into Studio
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Studio Big Stamp Action Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-neutral-950 border border-white/10 rounded-xl">
                    <div className="text-center sm:text-left">
                      <span className="text-xs text-neutral-400 uppercase font-semibold">Active Line ({currentStudioIndex + 1} of {studioLines.length}):</span>
                      <p className="text-lg font-bold text-white mt-0.5">
                        "{studioLines[currentStudioIndex]?.text || 'End of lyrics'}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleStampCurrentTime}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8ECAE6] to-[#219EBC] hover:opacity-90 text-neutral-950 font-extrabold text-sm shadow-lg shadow-[#8ECAE6]/25 transition-all flex items-center gap-2 active:scale-95"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Stamp Time ({formatTimestamp(Math.round(currentTime * 1000))})</span>
                      </button>
                    </div>
                  </div>

                  {/* Lines List */}
                  <div className="max-h-72 overflow-y-auto space-y-2 p-2 bg-neutral-950/60 rounded-xl border border-white/10">
                    {studioLines.map((line, idx) => {
                      const isCurrent = idx === currentStudioIndex;
                      const hasTimestamp = line.timeMs !== undefined;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setCurrentStudioIndex(idx);
                            if (line.timeMs && onSeek) {
                              onSeek(line.timeMs / 1000);
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                            isCurrent
                              ? 'bg-[#8ECAE6]/20 border border-[#8ECAE6] text-white font-bold'
                              : hasTimestamp
                              ? 'bg-white/5 text-neutral-300 hover:bg-white/10'
                              : 'text-neutral-500 hover:text-neutral-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono w-6 text-neutral-500">#{idx + 1}</span>
                            <span className="text-sm">{line.text}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {hasTimestamp ? (
                              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                                {formatTimestamp(line.timeMs!)}
                              </span>
                            ) : (
                              <span className="text-xs text-neutral-600 italic">Not stamped</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Studio Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStudioIndex(0)}
                      className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restart Stamping from Beginning</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyStudioToLrc}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      <Check className="w-4 h-4" />
                      <span>Apply Studio Timestamps to Editor</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIVE PREVIEW & TEST */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">Testing:</span>
                  <span className="font-bold text-white">{title || 'Untitled'} - {artist || 'Unknown'}</span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">
                    {previewLines.length} lines
                  </span>
                </div>
                <div className="text-neutral-400">
                  Click any line to seek audio and verify sync precision
                </div>
              </div>

              {previewLines.length === 0 ? (
                <div className="py-16 text-center text-neutral-500">
                  <p>No timestamped LRC lines found to test.</p>
                  <p className="text-xs text-neutral-600 mt-1">Add timestamps in Editor tab first.</p>
                </div>
              ) : (
                <div
                  ref={previewContainerRef}
                  className="h-80 overflow-y-auto p-6 space-y-6 text-center scroll-smooth bg-neutral-950/80 rounded-2xl border border-white/10 mask-fade"
                >
                  {previewLines.map((line, idx) => {
                    const isActive = idx === activeLyricIndex;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (onSeek) onSeek(line.timeMs / 1000);
                        }}
                        className={`cursor-pointer transition-all duration-300 py-1.5 rounded-lg ${
                          isActive
                            ? 'text-2xl sm:text-3xl font-extrabold text-[#FFFF00] scale-105 drop-shadow-md bg-white/5'
                            : 'text-base sm:text-lg font-medium text-neutral-400 hover:text-white'
                        }`}
                      >
                        <p>{line.text}</p>
                        <span className="text-[10px] font-mono text-neutral-600 opacity-60">
                          {formatTimestamp(line.timeMs)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DATABASE MANAGER */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              {/* Search Database */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lyrics by song title, artist, or language..."
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#8ECAE6]"
                />
              </div>

              {/* Records List */}
              {isLoadingDb ? (
                <div className="py-12 flex justify-center text-neutral-400">
                  <div className="w-6 h-6 border-2 border-[#8ECAE6] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredDbRecords.length === 0 ? (
                <div className="py-12 text-center text-neutral-500">
                  <p>No database records found matching "{searchQuery}".</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {filteredDbRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-3.5 bg-neutral-950/70 border border-white/10 rounded-xl hover:border-white/20 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{record.title}</h4>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-300 border border-white/10">
                            {record.language || 'Nepali'}
                          </span>
                          {record.syncedLyrics && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#8ECAE6]/20 text-[#8ECAE6]">
                              SYNCED LRC
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5 truncate">
                          {record.artist} {record.album ? `• ${record.album}` : ''} • Source: {record.source}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSelectRecordForEdit(record)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#8ECAE6]" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(record.id, record.title)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors"
                          title="Delete from database"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-neutral-950/80">
          <button
            type="button"
            onClick={handleResetForm}
            className="px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            Clear Form
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveLyrics}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8ECAE6] to-[#219EBC] hover:opacity-95 text-neutral-950 font-bold text-xs shadow-lg shadow-[#8ECAE6]/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{editingRecordId ? 'Update Lyrics in Database' : 'Save Lyrics to Database'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
