import React, { useState } from 'react';
import eshuLogoImage from '../../assets/images/eshu_logo_1787596023085.jpg';
import { 
  Settings, 
  Palette, 
  Volume2, 
  Sliders, 
  ShieldCheck, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  Heart, 
  ExternalLink, 
  Radio, 
  Coffee, 
  Github, 
  Disc3, 
  Check, 
  FileText,
  Info,
  Youtube,
  LogIn,
  LogOut,
  FolderSync
} from 'lucide-react';
import { EchoSettings, ThemeMode, EqualizerPreset, YouTubeUserProfile } from '../../types';
import { exportEchoBackup, importEchoBackup } from '../../services/echoStorage';

interface SettingsScreenProps {
  settings: EchoSettings;
  onUpdateSettings: (newSettings: EchoSettings) => void;
  onClearCache: () => void;
  onResetStats: () => void;
  seedColor?: string;
  onOpenBackupModal?: () => void;
  youtubeUser?: YouTubeUserProfile | null;
  onOpenYouTubeAuth?: () => void;
  onLogoutYouTube?: () => void;
  onSyncYouTubePlaylists?: () => void;
  isSyncingYouTube?: boolean;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onClearCache,
  onResetStats,
  seedColor = '#FF5252',
  youtubeUser = null,
  onOpenYouTubeAuth,
  onLogoutYouTube,
  onSyncYouTubePlaylists,
  isSyncingYouTube = false,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const themeOptions: { id: ThemeMode; label: string; bg: string; border: string }[] = [
    { id: 'echo-coral', label: 'Eshu Coral', bg: 'bg-neutral-950', border: 'border-[#FF5252]' },
    { id: 'amoled-noir', label: 'AMOLED Noir', bg: 'bg-black', border: 'border-white/40' },
    { id: 'material-dynamic', label: 'Material Dynamic', bg: 'bg-[#0f172a]', border: 'border-blue-500' },
    { id: 'liquid-glass', label: 'Liquid Glass', bg: 'bg-[#030712]', border: 'border-indigo-500' },
    { id: 'solarized', label: 'Solarized Dark', bg: 'bg-[#002b36]', border: 'border-teal-500' },
    { id: 'clean-light', label: 'Clean Light', bg: 'bg-[#FAFAFA]', border: 'border-neutral-300' },
  ];

  const seedColors = [
    { hex: '#FF5252', label: 'Eshu Coral' },
    { hex: '#1DB954', label: 'Spotify Green' },
    { hex: '#00BCD4', label: 'Ocean Cyan' },
    { hex: '#7C4DFF', label: 'Deep Violet' },
    { hex: '#FF9800', label: 'Sunset Gold' },
    { hex: '#FF4081', label: 'Pink Neon' },
    { hex: '#00E676', label: 'Mint Glow' },
  ];

  const handleExport = () => {
    const dataStr = exportEchoBackup();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eshu_music_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importEchoBackup(content);
      setImportStatus(res.message);
      setTimeout(() => setImportStatus(null), 4000);
      if (res.success) {
        window.location.reload();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 pb-32 animate-fadeIn max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-white/10 shadow-2xl">
        <div 
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ backgroundColor: seedColor }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-neutral-200 mb-3">
            <Settings className="w-3.5 h-3.5" style={{ color: seedColor }} />
            <span>Preferences & Settings</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Eshu Music Settings
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
            Customize streaming bitrates, audio DSP, SponsorBlock auto-skip, themes, and backup migration.
          </p>
        </div>
      </div>

      {/* YouTube Account & Library Sync Section */}
      <section className="p-6 rounded-3xl bg-neutral-900/80 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF0000] flex items-center justify-center shadow-lg">
              <Youtube className="w-6 h-6 fill-white text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>YouTube Account & Playlist Sync</span>
                {youtubeUser && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                    Connected
                  </span>
                )}
              </h2>
              <p className="text-xs text-neutral-400">
                Log in to import your personal YouTube and YouTube Music playlists directly into your library.
              </p>
            </div>
          </div>
        </div>

        {youtubeUser ? (
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <img 
                src={youtubeUser.picture} 
                alt={youtubeUser.name} 
                className="w-11 h-11 rounded-full border border-white/20 object-cover shadow-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
                }}
              />
              <div>
                <h3 className="text-sm font-bold text-white">{youtubeUser.name}</h3>
                <p className="text-xs text-neutral-400">{youtubeUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={onSyncYouTubePlaylists}
                disabled={isSyncingYouTube}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-black transition-all active:scale-95 shadow-md disabled:opacity-50"
                style={{ backgroundColor: seedColor }}
              >
                <FolderSync className={`w-3.5 h-3.5 ${isSyncingYouTube ? 'animate-spin' : ''}`} />
                <span>{isSyncingYouTube ? 'Syncing...' : 'Sync Playlists'}</span>
              </button>

              <button
                onClick={onLogoutYouTube}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-300 border border-white/10 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-300">
              Sign in with your Google account to authorize read-only access to your public and private YouTube playlists.
            </div>

            <button
              onClick={onOpenYouTubeAuth}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm text-white bg-[#FF0000] hover:bg-[#E60000] transition-all active:scale-95 shadow-lg shadow-red-900/30 flex-shrink-0 w-full sm:w-auto justify-center"
            >
              <Youtube className="w-4 h-4 fill-white" />
              <span>Connect YouTube</span>
            </button>
          </div>
        )}
      </section>

      {/* 1. Appearance & Themes */}
      <section className="p-6 rounded-3xl bg-neutral-900/80 border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center">
            <Palette className="w-4 h-4 text-white" style={{ color: seedColor }} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">Appearance & Color Palette</h2>
            <p className="text-xs text-neutral-400">Choose theme mode and signature accent brand seed</p>
          </div>
        </div>

        {/* Theme Mode Grid */}
        <div>
          <label className="text-xs font-bold text-neutral-300 mb-3 block uppercase tracking-wider">
            Theme Style
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {themeOptions.map((opt) => {
              const isSelected = settings.theme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onUpdateSettings({ ...settings, theme: opt.id })}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${opt.bg} ${
                    isSelected ? 'ring-2 ring-white border-transparent' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <span className="text-xs font-bold text-white">{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4" style={{ color: seedColor }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Seed Colors */}
        <div>
          <label className="text-xs font-bold text-neutral-300 mb-3 block uppercase tracking-wider">
            Brand Accent Color
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            {seedColors.map((color) => {
              const isSelected = settings.seedColor === color.hex;
              return (
                <button
                  key={color.hex}
                  onClick={() => onUpdateSettings({ ...settings, seedColor: color.hex })}
                  className="group relative flex items-center gap-2 p-2 rounded-2xl bg-neutral-950 border border-white/10 hover:border-white/30 transition-all"
                >
                  <span 
                    className="w-6 h-6 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-black font-bold" />}
                  </span>
                  <span className="text-xs font-medium text-neutral-300 pr-1">{color.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Audio & Playback */}
      <section className="p-6 rounded-3xl bg-neutral-900/80 border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-white" style={{ color: seedColor }} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">Audio & Playback Engine</h2>
            <p className="text-xs text-neutral-400">Streaming quality, DJ crossfade, and gapless transitions</p>
          </div>
        </div>

        {/* Streaming Quality */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Streaming Bitrate Quality
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'high-256', title: 'High (256 kbps)', desc: 'Audiophile HQ YouTube Stream' },
              { id: 'medium-160', title: 'Normal (160 kbps)', desc: 'Balanced Bandwidth & Fidelity' },
              { id: 'low-96', title: 'Data Saver (96 kbps)', desc: 'Optimized for Low Mobile Data' },
            ].map((q) => {
              const isSelected = settings.audioQuality === q.id || (q.id === 'high-256' && settings.audioQuality === 'high');
              return (
                <button
                  key={q.id}
                  onClick={() => onUpdateSettings({ ...settings, audioQuality: q.id as any })}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-neutral-800 border-white/40 ring-1 ring-white/20' 
                      : 'bg-neutral-950/60 border-white/10 hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{q.title}</span>
                    {isSelected && <Check className="w-4 h-4" style={{ color: seedColor }} />}
                  </div>
                  <p className="text-[11px] text-neutral-400">{q.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* DJ Crossfade Slider */}
        <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-white">DJ Crossfade Transition (Apple Music style)</h4>
            <p className="text-[11px] text-neutral-400">Smooth volume blending between consecutive tracks</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="12"
              step="1"
              value={settings.crossfadeSeconds || 0}
              onChange={(e) => onUpdateSettings({ ...settings, crossfadeSeconds: parseInt(e.target.value) })}
              className="w-28 sm:w-36 cursor-pointer"
              style={{ accentColor: seedColor }}
            />
            <span className="text-xs font-mono font-bold text-white w-10 text-right">
              {settings.crossfadeSeconds}s
            </span>
          </div>
        </div>

        {/* Gapless Playback Toggle */}
        <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/10 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white">Gapless Audio Playback</h4>
            <p className="text-[11px] text-neutral-400">Pre-buffer upcoming track in queue to eliminate silence</p>
          </div>
          <input
            type="checkbox"
            checked={settings.gaplessPlayback ?? true}
            onChange={(e) => onUpdateSettings({ ...settings, gaplessPlayback: e.target.checked })}
            className="w-5 h-5 rounded cursor-pointer accent-[#FF5252]"
            style={{ accentColor: seedColor }}
          />
        </div>
      </section>

      {/* 3. SponsorBlock & Features */}
      <section className="p-6 rounded-3xl bg-neutral-900/80 border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" style={{ color: seedColor }} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">SponsorBlock & Smart Skips</h2>
            <p className="text-xs text-neutral-400">Crowdsourced segment auto-skipping engine</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/10 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white">Enable SponsorBlock Integration</h4>
            <p className="text-[11px] text-neutral-400">Automatically skip promotional sponsors and non-music skits</p>
          </div>
          <input
            type="checkbox"
            checked={settings.sponsorBlockEnabled}
            onChange={(e) => onUpdateSettings({ ...settings, sponsorBlockEnabled: e.target.checked })}
            className="w-5 h-5 rounded cursor-pointer"
            style={{ accentColor: seedColor }}
          />
        </div>

        <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/10 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white">AI Synchronized Lyrics Translation</h4>
            <p className="text-[11px] text-neutral-400">Display bilingual translated lyric subtitles alongside original text</p>
          </div>
          <input
            type="checkbox"
            checked={settings.aiLyricsTranslation}
            onChange={(e) => onUpdateSettings({ ...settings, aiLyricsTranslation: e.target.checked })}
            className="w-5 h-5 rounded cursor-pointer"
            style={{ accentColor: seedColor }}
          />
        </div>

        <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/10 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white">Spotify Canvas Video Visualizations</h4>
            <p className="text-[11px] text-neutral-400">Render looping ambient artwork video clips during playback</p>
          </div>
          <input
            type="checkbox"
            checked={settings.spotifyCanvasEnabled ?? true}
            onChange={(e) => onUpdateSettings({ ...settings, spotifyCanvasEnabled: e.target.checked })}
            className="w-5 h-5 rounded cursor-pointer"
            style={{ accentColor: seedColor }}
          />
        </div>
      </section>

      {/* 4. Backup, Restore & Migration */}
      <section className="p-6 rounded-3xl bg-neutral-900/80 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-white" style={{ color: seedColor }} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">Backup & Migration</h2>
            <p className="text-xs text-neutral-400">Export or import playlists compatible with eshumusic.fun/migrate</p>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-fadeIn">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-900 border border-white/15 text-xs font-bold text-white transition-all shadow-md"
          >
            <Download className="w-4 h-4 text-neutral-300" />
            <span>Export Eshu Backup (.json)</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-900 border border-white/15 text-xs font-bold text-white cursor-pointer transition-all shadow-md">
            <Upload className="w-4 h-4 text-neutral-300" />
            <span>Import Playlists / Backup</span>
            <input
              type="file"
              accept=".json,.backup"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            onClick={onClearCache}
            className="flex items-center gap-2 text-neutral-400 hover:text-amber-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear App Cache</span>
          </button>

          <button
            onClick={onResetStats}
            className="flex items-center gap-2 text-neutral-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Listening Statistics</span>
          </button>
        </div>
      </section>

      {/* 5. About Eshu Music & Credits */}
      <section className="p-6 rounded-3xl bg-neutral-900/80 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-2xl overflow-hidden bg-neutral-900 border border-white/20 p-0.5 flex items-center justify-center shadow-md">
            <img 
              src={eshuLogoImage || '/eshu-logo.png'} 
              alt="Eshu Music" 
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                if ((e.currentTarget as HTMLImageElement).src !== '/eshu-logo.png') {
                  (e.currentTarget as HTMLImageElement).src = '/eshu-logo.png';
                }
              }}
            />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">About Eshu Music</h2>
            <p className="text-xs text-neutral-400">Eshu Music v1.0.0 • Free & Open Source Music Experience</p>
          </div>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          Eshu Music is developed by Yugesh (<a href="https://github.com/yugesh" target="_blank" rel="noreferrer" className="text-white font-bold underline hover:text-[#FF5252]">@yugesh</a>) and built upon the open-source <a href="https://github.com/maxrave-dev/SimpMusic" target="_blank" rel="noreferrer" className="text-white font-bold underline hover:text-[#FF5252]">SimpMusic</a> project. 
          100% free and open source under GPL-3.0 with zero trackers or intrusive ads.
        </p>

        {/* Links & Socials */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <a
            href="https://buymeacoffee.com/yugesh"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold transition-colors"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Buy Me a Coffee</span>
          </a>

          <a
            href="https://github.com/EchoMusicApp/Echo-Music"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>

          <a
            href="https://echomusic.fun"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Website</span>
          </a>
        </div>
      </section>
    </div>
  );
};
