import React, { useState, useRef, useEffect } from 'react';
import {
  HardDriveDownload,
  Upload,
  Trash2,
  Play,
  Music,
  Search,
  X,
  CheckCircle2,
  WifiOff,
  Radio,
  FileAudio,
  Info,
  Sparkles,
  Link,
  Download,
  Share2,
  Mic,
  Square,
  FolderDown,
} from 'lucide-react';
import {
  OfflineTrack,
  getAllOfflineTracks,
  saveOfflineTrack,
  deleteOfflineTrack,
  clearAllOfflineTracks,
  downloadAudioFromUrl,
  createStarterOfflineTrack,
  exportOfflineTrackToMobileDevice,
  shareOfflineTrack,
  triggerMobileHaptic,
  formatFileSize,
  formatDuration,
} from '../services/offlineStorage';

interface OfflineLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOfflineMode: boolean;
  activeOfflineTrackId: string | null;
  onToggleOfflineMode: (enabled: boolean) => void;
  onPlayOfflineTrack: (track: OfflineTrack) => void;
  onOfflineTracksCountChange?: (count: number) => void;
  onTracksUpdated?: () => void;
}

export const OfflineLibraryModal: React.FC<OfflineLibraryModalProps> = ({
  isOpen,
  onClose,
  isOfflineMode,
  activeOfflineTrackId,
  onToggleOfflineMode,
  onPlayOfflineTrack,
  onOfflineTracksCountChange,
  onTracksUpdated,
}) => {
  const [tracks, setTracks] = useState<OfflineTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isGeneratingStarter, setIsGeneratingStarter] = useState(false);
  const [trackPendingDeleteId, setTrackPendingDeleteId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const [audioUrlInput, setAudioUrlInput] = useState('');
  const [isDownloadingUrl, setIsDownloadingUrl] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Mobile Microphone Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadTracks = async () => {
    try {
      const stored = await getAllOfflineTracks();
      setTracks(stored);
      if (onOfflineTracksCountChange) {
        onOfflineTracksCountChange(stored.length);
      }
      if (onTracksUpdated) {
        onTracksUpdated();
      }
    } catch (err) {
      console.error('Failed to load offline tracks:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTracks();
    }
  }, [isOpen]);

  // Clean up recording on unmount or modal close
  useEffect(() => {
    if (!isOpen && isRecording) {
      handleStopRecording();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    triggerMobileHaptic(20);
    const validAudioFiles = Array.from(files).filter(
      (f) =>
        f.type.startsWith('audio/') ||
        /\.(mp3|wav|m4a|aac|flac|ogg|opus)$/i.test(f.name)
    );

    if (validAudioFiles.length === 0) {
      alert('Please select valid audio files (MP3, WAV, M4A, FLAC, OGG).');
      setIsUploading(false);
      return;
    }

    let count = 0;
    for (const file of validAudioFiles) {
      count++;
      setUploadProgressText(`Saving song ${count} of ${validAudioFiles.length} to downloads...`);
      try {
        await saveOfflineTrack(file);
      } catch (err) {
        console.error('Error saving audio file:', file.name, err);
      }
    }

    setIsUploading(false);
    setUploadProgressText('');
    await loadTracks();
  };

  const handleCreateStarterTrack = async () => {
    setIsGeneratingStarter(true);
    triggerMobileHaptic(25);
    try {
      await createStarterOfflineTrack();
      await loadTracks();
    } catch (err) {
      console.error('Failed to create sample track:', err);
    } finally {
      setIsGeneratingStarter(false);
    }
  };

  // Mobile Microphone Recording Handler
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const filename = `Voice Note ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.webm`;
          const file = new File([audioBlob], filename, { type: 'audio/webm' });
          await saveOfflineTrack(file, `Recorded Track ${new Date().toLocaleDateString()}`, 'Mobile Mic');
          await loadTracks();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      triggerMobileHaptic(30);

      recordTimerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone permission is needed to record audio. Please allow microphone access.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordTimerRef.current);
      triggerMobileHaptic(40);
    }
  };

  const handleDownloadFromUrl = async () => {
    const trimmed = audioUrlInput.trim();
    if (!trimmed) return;

    setIsDownloadingUrl(true);
    triggerMobileHaptic(25);
    try {
      await downloadAudioFromUrl(trimmed);
      setAudioUrlInput('');
      setShowUrlInput(false);
      setFeedbackMessage('Audio downloaded from link successfully!');
      setTimeout(() => setFeedbackMessage(null), 3500);
      await loadTracks();
    } catch (err: any) {
      console.error('Failed to download audio from url:', err);
      setFeedbackMessage('Failed to download audio from URL. Please ensure the link is a direct public audio file (.mp3, .wav, etc.)');
      setTimeout(() => setFeedbackMessage(null), 4500);
    } finally {
      setIsDownloadingUrl(false);
    }
  };

  const handleExportToDevice = async (t: OfflineTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerMobileHaptic(20);
    await exportOfflineTrackToMobileDevice(t);
  };

  const handleShareToApps = async (t: OfflineTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerMobileHaptic(20);
    await shareOfflineTrack(t);
  };

  const handleBatchExportAll = async () => {
    if (tracks.length === 0) return;
    triggerMobileHaptic(30);
    for (let i = 0; i < tracks.length; i++) {
      setTimeout(() => {
        exportOfflineTrackToMobileDevice(tracks[i]);
      }, i * 300);
    }
  };

  const handleDeleteTrack = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerMobileHaptic(25);
    try {
      await deleteOfflineTrack(id);
      setFeedbackMessage(`Deleted "${title}"`);
      setTimeout(() => setFeedbackMessage(null), 3000);
      setTrackPendingDeleteId(null);
      await loadTracks();
    } catch (err) {
      console.error('Failed to delete track:', err);
    }
  };

  const handleClearAll = async () => {
    if (tracks.length === 0) return;
    triggerMobileHaptic(35);
    try {
      await clearAllOfflineTracks();
      setShowClearConfirm(false);
      setFeedbackMessage('All downloaded songs cleared from device');
      setTimeout(() => setFeedbackMessage(null), 3000);
      await loadTracks();
    } catch (err) {
      console.error('Failed to clear tracks:', err);
    }
  };

  const filteredTracks = tracks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStorageSize = tracks.reduce((acc, t) => acc + t.fileSize, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Downloads
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] sm:text-[10px] font-mono">
                  {tracks.length} {tracks.length === 1 ? 'Song' : 'Songs'}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Downloaded songs saved to your phone storage. Auto-plays when offline.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-close-offline-modal"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Automatic Network Status Banner (No manual toggle required) */}
        <div className="px-3.5 sm:px-6 py-2.5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className={`w-2.5 h-2.5 rounded-full ${isOfflineMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-[11px] sm:text-xs font-medium">
              {isOfflineMode
                ? 'Device Offline • Playing Downloaded Songs'
                : 'Device Online • Plays YouTube Radio (Auto-switches to Downloads if offline)'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono hidden xs:inline">
            Auto-Detecting Network
          </span>
        </div>

        {/* Upload / Record Actions */}
        <div className="p-3 sm:p-4 border-b border-white/10 space-y-2.5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex items-center justify-center gap-3 ${
              isDragging
                ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
                : 'border-white/10 hover:border-emerald-500/50 bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              multiple
              accept="audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg,.opus"
              className="hidden"
            />
            <div className="p-2 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs sm:text-sm font-semibold text-white">
                Add MP3 / Audio Files from Phone
              </div>
              <div className="text-[10px] text-slate-400">
                Import any music file into your local downloads collection
              </div>
            </div>

            {isUploading && (
              <div className="ml-auto text-xs text-emerald-300 font-medium animate-pulse flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                {uploadProgressText}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mic Audio Recorder */}
            {isRecording ? (
              <button
                onClick={handleStopRecording}
                className="flex-1 min-w-[130px] py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer animate-pulse shadow-lg shadow-rose-600/30"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop ({recordingTime}s)</span>
              </button>
            ) : (
              <button
                onClick={handleStartRecording}
                className="flex-1 min-w-[130px] py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                title="Record audio snippet from device microphone"
              >
                <Mic className="w-3.5 h-3.5 text-rose-400" />
                <span>Record Audio</span>
              </button>
            )}

            {/* Direct Audio Link Downloader Toggle */}
            <button
              onClick={() => setShowUrlInput(!showUrlInput)}
              className={`flex-1 min-w-[130px] py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                showUrlInput
                  ? 'bg-blue-600/40 border-blue-500/60 text-blue-200'
                  : 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/30 text-blue-300'
              }`}
              title="Download audio from a direct MP3/WAV web link"
            >
              <Link className="w-3.5 h-3.5 text-blue-400" />
              <span>Download Audio Link</span>
            </button>

            {/* Studio Lo-Fi Ambient Track Generator */}
            <button
              onClick={handleCreateStarterTrack}
              disabled={isGeneratingStarter}
              className="flex-1 min-w-[130px] py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              title="Generates a full rhythm Lo-Fi chill session directly in memory"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>{isGeneratingStarter ? 'Generating...' : 'Studio Chill Track'}</span>
            </button>
          </div>

          {/* Audio URL Input Form */}
          {showUrlInput && (
            <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex flex-col sm:flex-row gap-2 animate-in fade-in duration-200">
              <input
                type="url"
                placeholder="Paste direct audio URL (e.g. https://.../song.mp3)"
                value={audioUrlInput}
                onChange={(e) => setAudioUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleDownloadFromUrl();
                }}
                className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
              />
              <button
                onClick={handleDownloadFromUrl}
                disabled={isDownloadingUrl || !audioUrlInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isDownloadingUrl ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Download Audio</span>
              </button>
            </div>
          )}
        </div>

        {/* Downloaded Track List Section */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Search */}
            <div className="relative flex-1 min-w-[160px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search downloaded songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Storage Info, Batch Export & Clear */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-[11px]">
                {tracks.length} {tracks.length === 1 ? 'song' : 'songs'} ({formatFileSize(totalStorageSize)})
              </span>
              {tracks.length > 0 && (
                <>
                  <button
                    onClick={handleBatchExportAll}
                    className="p-1 sm:px-2 sm:py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    title="Export all downloaded songs to phone storage"
                  >
                    <FolderDown className="w-3 h-3" />
                    <span>Save All</span>
                  </button>

                  {showClearConfirm ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleClearAll}
                        className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px] hover:bg-rose-600 transition-colors cursor-pointer"
                      >
                        Yes, Clear All
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 text-[10px] hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="text-rose-400 hover:text-rose-300 text-[11px] font-medium hover:underline transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Inline Feedback Banner */}
          {feedbackMessage && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {tracks.length === 0 ? (
            <div className="py-8 sm:py-10 text-center flex flex-col items-center justify-center text-slate-500 space-y-2">
              <FileAudio className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.2] opacity-40 text-emerald-400" />
              <p className="text-xs sm:text-sm font-medium text-slate-300">No downloaded songs yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm">
                Click the <strong className="text-emerald-300">Download icon</strong> on the bottom player bar while listening to any station, or add songs from your phone.
              </p>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs">
              No downloaded songs matching "{searchQuery}"
            </div>
          ) : (
            <div className="space-y-1.5 sm:space-y-2">
              {filteredTracks.map((t) => {
                const isPlayingThis = activeOfflineTrackId === t.id && isOfflineMode;
                const isConfirmingDelete = trackPendingDeleteId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      triggerMobileHaptic();
                      onPlayOfflineTrack(t);
                    }}
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer group ${
                      isPlayingThis
                        ? 'bg-emerald-600/20 border-emerald-500/40 text-white shadow-md'
                        : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                        {isPlayingThis ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        ) : (
                          <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current ml-0.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate group-hover:text-emerald-200 transition-colors">
                          {t.title}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-400 truncate flex items-center gap-1.5 sm:gap-2">
                          <span>{t.artist}</span>
                          <span>•</span>
                          <span>{formatDuration(t.duration)}</span>
                          <span>•</span>
                          <span>{formatFileSize(t.fileSize)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Direct Phone Storage Download */}
                      <button
                        onClick={(e) => handleExportToDevice(t, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                        title="Download file to phone storage"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                      </button>

                      {/* Native Share to Apps */}
                      <button
                        onClick={(e) => handleShareToApps(t, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                        title="Share audio file to apps (WhatsApp, Files, Drive)"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete with 2-step in-app confirmation */}
                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleDeleteTrack(t.id, t.title, e)}
                            className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition-all shadow-sm cursor-pointer"
                            title="Confirm delete"
                          >
                            Delete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTrackPendingDeleteId(null);
                            }}
                            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] transition-all cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTrackPendingDeleteId(t.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete song from downloads"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


