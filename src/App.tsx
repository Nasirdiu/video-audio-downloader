import React, { useState, useEffect } from 'react';
import { MediaItem, DownloadHistoryItem } from './types';
import { resolveMediaUrl } from './utils/mediaResolver';
import { Language, TRANSLATIONS } from './utils/translations';
import { Navbar } from './components/Navbar';
import { UrlInputSection } from './components/UrlInputSection';
import { MediaResultCard } from './components/MediaResultCard';
import { BatchDownloader } from './components/BatchDownloader';
import { AudioTrimmerModal } from './components/AudioTrimmerModal';
import { DownloadHistory } from './components/DownloadHistory';
import { SupportedPlatformsGrid } from './components/SupportedPlatformsGrid';
import { PlatformGuide } from './components/PlatformGuide';
import { AlertCircle, Shield, Zap, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'omnimedia_download_history_v1';

export default function App() {
  // Default language to English first (with local storage persistence)
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('omnimedia_lang_pref');
      if (saved === 'bn' || saved === 'en') return saved as Language;
    } catch {
      // ignore
    }
    return 'en';
  });
  const [currentTab, setCurrentTab] = useState<string>('single');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);

  // Download history
  const [history, setHistory] = useState<DownloadHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Audio Trimmer modal state
  const [isTrimmerOpen, setIsTrimmerOpen] = useState(false);
  const [trimmerTargetMedia, setTrimmerTargetMedia] = useState<MediaItem | null>(null);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Handle URL resolve
  const handleResolve = async (urlToResolve: string) => {
    if (!urlToResolve.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const media = await resolveMediaUrl(urlToResolve.trim());
      setCurrentMedia(media);
      if (currentTab !== 'single') {
        setCurrentTab('single');
      }
    } catch {
      setErrorMessage(
        lang === 'en'
          ? 'Failed to analyze this URL. Please verify the link and try again.'
          : 'এই লিংকটি বিশ্লেষণ করা সম্ভব হয়নি। অনুগ্রহ করে লিংকটি সঠিক কি না যাচাই করে আবার চেষ্টা করুন।'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCompleted = (downloadInfo: {
    media: MediaItem;
    format: string;
    quality: string;
    fileName: string;
    sizeMb: number;
    type: 'video' | 'audio' | 'image';
  }) => {
    const newHistoryItem: DownloadHistoryItem = {
      id: 'dl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: downloadInfo.media.title,
      platform: downloadInfo.media.platform,
      url: downloadInfo.media.originalUrl,
      format: downloadInfo.format,
      quality: downloadInfo.quality,
      fileSizeMb: downloadInfo.sizeMb,
      fileName: downloadInfo.fileName,
      downloadedAt: Date.now(),
      thumbnailUrl: downloadInfo.media.thumbnailUrl,
      type: downloadInfo.type,
    };

    setHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]);
  };

  const handleOpenTrimmer = (media: MediaItem) => {
    setTrimmerTargetMedia(media);
    setIsTrimmerOpen(true);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((it) => it.id !== id));
  };

  const toggleLanguage = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'bn' : 'en';
      try {
        localStorage.setItem('omnimedia_lang_pref', next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background ambient gradient glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[800px] rounded-full bg-indigo-900/15 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 h-80 w-80 rounded-full bg-violet-900/10 blur-[100px]" />
        <div className="absolute bottom-10 -right-40 h-96 w-96 rounded-full bg-blue-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Navigation Bar */}
        <Navbar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          lang={lang}
          onLangToggle={toggleLanguage}
          historyCount={history.length}
        />

        {/* Main Content Viewport */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-10">
          {/* TAB 1: Single Link Downloader (Main flow) */}
          {currentTab === 'single' && (
            <div className="space-y-8">
              {/* URL Input Form */}
              <UrlInputSection
                url={url}
                onUrlChange={setUrl}
                onSubmit={handleResolve}
                isLoading={isLoading}
                lang={lang}
              />

              {/* Error Callout */}
              {errorMessage && (
                <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/20 p-3.5 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Media Result & Format Selector */}
              {currentMedia && (
                <div className="pt-2">
                  <MediaResultCard
                    media={currentMedia}
                    lang={lang}
                    onOpenTrimmer={handleOpenTrimmer}
                    onDownloadComplete={handleDownloadCompleted}
                  />
                </div>
              )}

              {/* Feature Highlights Bento Strip (when no media yet or below result) */}
              {!currentMedia && (
                <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Zap className="h-4 w-4" />
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-white">
                      {lang === 'en' ? 'Ultra-Fast Direct CDN' : 'অতি দ্রুত সরাসরি ডাউনলোড'}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {lang === 'en'
                        ? 'Extract original streams directly with zero throttling and instant packaging.'
                        : 'সোশ্যাল মিডিয়ার মূল সার্ভার থেকে সরাসরি সর্বোচ্চ গতিতে ভিডিও ও অডিও এক্সট্র্যাক্ট করে।'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Shield className="h-4 w-4" />
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-white">
                      {lang === 'en' ? 'Watermark-Free Clean HD' : 'ওয়াটারমার্ক মুক্ত ক্লিন কোয়ালিটি'}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {lang === 'en'
                        ? 'Download TikTok, Instagram, and Facebook Reels in crystal-clear full definition without logos.'
                        : 'TikTok, Instagram রিল বা ভিডিওতে কোনো রকম ওয়াটারমার্ক বা লোগো ছাড়াই সেভ করুন।'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-white">
                      {lang === 'en' ? 'Studio 320kbps MP3 Audio' : 'স্টুডিও কোয়ালিটি 320kbps অডিও'}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {lang === 'en'
                        ? 'Extract pure high-bitrate MP3, WAV, or AAC audio tracks from any video clip.'
                        : 'যেকোনো ভিডিও থেকে ব্যাকগ্রাউন্ড মিউজিক বা ভয়েস আলাদা করে স্পষ্ট MP3 ফাইলে রূপান্তর।'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Batch Downloader */}
          {currentTab === 'batch' && (
            <BatchDownloader
              lang={lang}
              onDownloadFinished={handleDownloadCompleted}
            />
          )}

          {/* TAB 3: Audio Trimmer & Cutter */}
          {currentTab === 'trimmer' && (
            <div className="mx-auto max-w-4xl space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md text-center">
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  {lang === 'en' ? 'Audio Trimmer & Cutter' : 'অডিও ট্রিমার ও কাটার স্টুডিও'}
                </h2>
                <p className="mt-2 text-xs text-slate-400 sm:text-sm max-w-lg mx-auto">
                  {lang === 'en'
                    ? 'Paste any social video link first or select one of your recent downloads to open the interactive audio waveform cutter.'
                    : 'প্রথমে যেকোনো সোশ্যাল ভিডিও লিংক অ্যানালাইজ করুন অথবা নিচের যেকোনো স্যাম্পল থেকে অডিও কাটার চালু করুন।'}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => {
                      handleResolve('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                      setTimeout(() => {
                        if (currentMedia) handleOpenTrimmer(currentMedia);
                      }, 500);
                    }}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    {lang === 'en' ? 'Open Trimmer with YouTube Music' : 'YouTube স্যাম্পল দিয়ে ট্রিমার খুলুন'}
                  </button>

                  <button
                    onClick={() => {
                      handleResolve('https://www.tiktok.com/@creative_creators/video/7391829482910482910');
                      setTimeout(() => {
                        if (currentMedia) handleOpenTrimmer(currentMedia);
                      }, 500);
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    {lang === 'en' ? 'Open Trimmer with TikTok Sound' : 'TikTok সাউন্ড দিয়ে ট্রিমার খুলুন'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Download History & Library */}
          {currentTab === 'history' && (
            <DownloadHistory
              history={history}
              lang={lang}
              onClearHistory={handleClearHistory}
              onDeleteItem={handleDeleteHistoryItem}
            />
          )}

          {/* TAB 5: Supported Platforms Showcase */}
          {currentTab === 'platforms' && (
            <SupportedPlatformsGrid
              lang={lang}
              onSelectSample={(sampleUrl) => {
                setUrl(sampleUrl);
                handleResolve(sampleUrl);
                setCurrentTab('single');
              }}
            />
          )}

          {/* TAB 6: How-To Guide */}
          {currentTab === 'guide' && <PlatformGuide lang={lang} />}
        </main>

        {/* Clean Footer (Anti-Slop: Quiet copyright and site information) */}
        <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="font-semibold text-slate-400">OmniMedia Downloader</span>
              <span>·</span>
              <span>
                {lang === 'en'
                  ? 'High-Performance Video & Audio Extraction Suite'
                  : 'হাই-স্পিড সোশ্যাল ভিডিও ও অডিও ডাউনলোডার'}
              </span>
              <span>·</span>
              <span>
                {lang === 'en' ? 'Created by ' : 'তৈরি করেছেন '}
                <a
                  href="https://nasir369.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-indigo-400 underline decoration-indigo-500/40 underline-offset-2 transition-colors hover:text-indigo-300 hover:decoration-indigo-300"
                >
                  nasir369
                </a>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-slate-500 sm:justify-end">
              <span>YouTube</span>
              <span>·</span>
              <span>Facebook</span>
              <span>·</span>
              <span>Instagram</span>
              <span>·</span>
              <span>Pinterest</span>
              <span>·</span>
              <span>Twitter / X</span>
              <span>·</span>
              <span>TikTok</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Audio Trimmer Modal */}
      <AudioTrimmerModal
        media={trimmerTargetMedia}
        isOpen={isTrimmerOpen}
        onClose={() => setIsTrimmerOpen(false)}
        lang={lang}
        onSaveToHistory={handleDownloadCompleted}
      />
    </div>
  );
}
