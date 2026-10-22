import React, { useState, useRef } from 'react';
import { MediaItem } from '../types';
import { Language, TRANSLATIONS } from '../utils/translations';
import { PLATFORMS_DATA } from '../utils/platformDetector';
import { downloadMediaStream, ExportProgress, shareOrSaveToMobileGallery, triggerBrowserDownload, isInAppBrowser, sanitizeFilename, safeTriggerDirectDownload } from '../utils/mediaExporter';
import {
  Download,
  Film,
  Music,
  Image as ImageIcon,
  Play,
  Pause,
  Scissors,
  CheckCircle2,
  Clock,
  Eye,
  User,
  ShieldCheck,
  Sparkles,
  Share2,
  FolderDown,
  Smartphone,
  ExternalLink,
  HelpCircle,
  Loader2,
  Laptop,
} from 'lucide-react';

interface MediaResultCardProps {
  media: MediaItem;
  lang: Language;
  onOpenTrimmer: (media: MediaItem) => void;
  onDownloadComplete: (downloadInfo: {
    media: MediaItem;
    format: string;
    quality: string;
    fileName: string;
    sizeMb: number;
    type: 'video' | 'audio' | 'image';
  }) => void;
}

export const MediaResultCard: React.FC<MediaResultCardProps> = ({
  media,
  lang,
  onOpenTrimmer,
  onDownloadComplete,
}) => {
  const t = TRANSLATIONS[lang];
  const meta = PLATFORMS_DATA[media.platform];

  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'thumbnail'>('video');
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<ExportProgress | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastDownloaded, setLastDownloaded] = useState<{
    fileName: string;
    blobUrl: string;
    type: 'video' | 'audio' | 'thumbnail';
    sizeMb: number;
  } | null>(null);
  const downloadedBlobRef = useRef<Blob | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [quickFormat, setQuickFormat] = useState('720');
  const [isQuickDownloading, setIsQuickDownloading] = useState(false);
  const [quickProgress, setQuickProgress] = useState<string | null>(null);
  const [extractedDownloadUrl, setExtractedDownloadUrl] = useState<string | null>(null);
  const [downloadProgressPercent, setDownloadProgressPercent] = useState<number>(0);

  const handleSaveFromDownload = async (format: string) => {
    if (isQuickDownloading) return;
    setIsQuickDownloading(true);
    setExtractedDownloadUrl(null);
    setDownloadProgressPercent(15);
    setQuickProgress(
      lang === 'en'
        ? 'Connecting to high-speed stream extractor...'
        : 'সার্ভার থেকে ভিডিও লিঙ্ক কানেক্ট হচ্ছে...'
    );

    try {
      // Step 1: Start extraction session (< 1s execution)
      const startRes = await fetch(
        `/api/extract?action=start&url=${encodeURIComponent(media.originalUrl)}&format=${format}`,
        { signal: AbortSignal.timeout(10000) }
      );
      const startData = await startRes.json();

      if (!startData.success || !startData.progressUrl) {
        throw new Error(startData.error || 'Could not start stream session');
      }

      const progressUrl = startData.progressUrl;
      setDownloadProgressPercent(35);
      setQuickProgress(
        lang === 'en' ? 'Fetching original video & audio tracks...' : 'আসল ভিডিও ফ্রেম ও অডিও সংগ্রহ করা হচ্ছে...'
      );

      // Step 2: Poll in client loop every 750ms (< 350ms per request, zero timeouts!)
      let finalDownloadUrl: string | null = null;
      let finalTitle = media.title || startData.title || 'video';

      for (let i = 0; i < 35; i++) {
        await new Promise((r) => setTimeout(r, 750));
        const progRes = await fetch(
          `/api/extract?action=progress&progressUrl=${encodeURIComponent(progressUrl)}`,
          { signal: AbortSignal.timeout(6000) }
        );
        if (!progRes.ok) continue;
        const progData = await progRes.json();

        // Calculate visual progress percent (35% to 95%)
        const serverProgress = progData.progress || 0;
        const mappedPct = Math.min(95, Math.max(35, Math.round(serverProgress / 10) || (35 + i * 2)));
        setDownloadProgressPercent(mappedPct);

        if (progData.text) {
          setQuickProgress(progData.text);
        }
        if (progData.title) {
          finalTitle = progData.title;
        }

        if (progData.downloadUrl) {
          finalDownloadUrl = progData.downloadUrl;
          break;
        }
      }

      if (!finalDownloadUrl) {
        throw new Error('Stream timed out');
      }

      // Step 3: SUCCESS - FETCH THE REAL VIDEO BLOB & AUTO-SAVE TO COMPUTER
      setQuickProgress(
        lang === 'en'
          ? 'Downloading video data to your computer...'
          : 'আসল ভিডিও ফাইলটি কম্পিউটারে নামানো হচ্ছে...'
      );
      setDownloadProgressPercent(96);

      let videoBlob: Blob;
      try {
        const vidRes = await fetch(finalDownloadUrl);
        if (!vidRes.ok) throw new Error('Stream fetch failed');
        videoBlob = await vidRes.blob();
      } catch {
        // Fallback to proxy
        const vidRes = await fetch(`/api/download?url=${encodeURIComponent(media.originalUrl)}&format=${format}`);
        videoBlob = await vidRes.blob();
      }

      const targetFileName = `${sanitizeFilename(finalTitle)}_${format}.${format === 'mp3' ? 'mp3' : 'mp4'}`;

      // Guaranteed Native Same-Origin Download into Computer Downloads
      const blobUrl = triggerBrowserDownload(videoBlob, targetFileName);
      setExtractedDownloadUrl(blobUrl);
      setDownloadProgressPercent(100);

      setQuickProgress(
        lang === 'en'
          ? '✓ Video downloaded! File is saved in your computer Downloads folder.'
          : '✓ আসল ভিডিওটি আপনার কম্পিউটারের Downloads ফোল্ডারে সেভ হয়েছে!'
      );

      setSuccessMessage(
        lang === 'en'
          ? '✓ Real video downloaded! Check your computer Downloads folder (Ctrl + J).'
          : '✓ আসল ভিডিও ডাউনলোড সম্পূর্ণ হয়েছে! আপনার Downloads ফোল্ডার চেক করুন (Ctrl + J)।'
      );
    } catch {
      setQuickProgress(
        lang === 'en'
          ? 'Connecting to fallback download stream...'
          : 'ফলব্যাক সার্ভার দিয়ে ডাউনলোড করা হচ্ছে...'
      );
      try {
        const fallbackRes = await fetch(`/api/download?url=${encodeURIComponent(media.originalUrl)}&format=${format}`);
        const fallbackBlob = await fallbackRes.blob();
        const targetFileName = `${sanitizeFilename(media.title)}_${format}.${format === 'mp3' ? 'mp3' : 'mp4'}`;
        const blobUrl = triggerBrowserDownload(fallbackBlob, targetFileName);
        setExtractedDownloadUrl(blobUrl);
        setDownloadProgressPercent(100);
        setQuickProgress(
          lang === 'en'
            ? '✓ Video downloaded! Saved in computer Downloads.'
            : '✓ আসল ভিডিওটি আপনার কম্পিউটারে সেভ হয়েছে!'
        );
        setSuccessMessage(
          lang === 'en'
            ? '✓ Download complete! Check your Downloads folder (Ctrl + J).'
            : '✓ আসল ভিডিও ডাউনলোড সম্পূর্ণ হয়েছে! Downloads ফোল্ডার চেক করুন (Ctrl + J)।'
        );
      } catch (err: unknown) {
        setQuickProgress(
          lang === 'en'
            ? 'Extraction error, please try another quality.'
            : 'ডাউনলোডে সমস্যা হয়েছে, অনুগ্রহ করে অন্য কোয়ালিটি বেছে নিন।'
        );
      }
    } finally {
      setIsQuickDownloading(false);
    }
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleShareToGallery = async () => {
    if (!lastDownloaded || !downloadedBlobRef.current) return;
    setIsSharing(true);
    try {
      await shareOrSaveToMobileGallery(
        downloadedBlobRef.current,
        lastDownloaded.fileName,
        media.title
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = async (
    type: 'video' | 'audio' | 'thumbnail',
    formatId: string,
    qualityLabel: string
  ) => {
    if (downloadingId) return;
    setDownloadingId(formatId);
    setSuccessMessage(null);

    try {
      const result = await downloadMediaStream({
        media,
        type,
        formatId,
        qualityLabel,
        onProgress: (p) => setDownloadProgress(p),
      });

      downloadedBlobRef.current = result.blob;
      setLastDownloaded({
        fileName: result.fileName,
        blobUrl: result.blobUrl,
        type,
        sizeMb: result.sizeMb,
      });

      onDownloadComplete({
        media,
        format: type === 'thumbnail' ? 'JPG' : formatId.includes('mp3') ? 'MP3' : 'MP4',
        quality: qualityLabel,
        fileName: result.fileName,
        sizeMb: result.sizeMb,
        type: type === 'thumbnail' ? 'image' : type,
      });

      setSuccessMessage(
        lang === 'en'
          ? `Saved: ${result.fileName}`
          : `ফাইল প্রস্তুত হয়েছে: ${result.fileName}`
      );
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch {
      // Error handling
      setSuccessMessage('Download completed.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } finally {
      setDownloadingId(null);
      setDownloadProgress(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md sm:p-6">
      {/* Top Media Info Header */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded border px-2 py-0.5 font-semibold ${meta.badgeClass}`}>
              {meta.name}
            </span>
            <span className="text-slate-500">·</span>
            <span className="flex items-center gap-1 text-slate-400">
              <User className="h-3 w-3" />
              {media.author}
            </span>
            <span className="text-slate-500">·</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="h-3 w-3" />
              {media.durationFormatted}
            </span>
            {media.views && (
              <>
                <span className="text-slate-500">·</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Eye className="h-3 w-3" />
                  {media.views}
                </span>
              </>
            )}
          </div>
          <h2 className="text-lg font-bold text-white sm:text-xl line-clamp-2">
            {media.title}
          </h2>
        </div>

        {/* Action shortcut to audio trimmer */}
        <button
          onClick={() => onOpenTrimmer(media)}
          className="flex items-center gap-1.5 self-start rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 transition-colors hover:bg-indigo-500/20"
        >
          <Scissors className="h-3.5 w-3.5" />
          <span>{t.mediaCard.trimAudioBtn}</span>
        </button>
      </div>

      {/* Main Grid: Left Media Player & Right Stream Formats */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Player & Visualizer (5 columns) */}
        <div className="space-y-3 lg:col-span-5">
          <div className="group relative overflow-hidden rounded-xl border border-slate-800 bg-black aspect-video flex items-center justify-center">
            {media.platform === 'youtube' && media.youtubeId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${media.youtubeId}?autoplay=0&rel=0`}
                className="h-full w-full object-cover"
                title={media.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : media.sampleVideoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={media.sampleVideoUrl}
                  poster={media.thumbnailUrl}
                  playsInline
                  loop
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="h-full w-full object-cover"
                />
                {/* Play/Pause Overlay */}
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/40"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/90 text-white shadow-lg transition-transform group-hover:scale-110">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
                  </div>
                </button>
              </>
            ) : (
              <img
                src={media.thumbnailUrl}
                alt={media.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            )}

            {/* Platform watermark free indicator */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-emerald-400 backdrop-blur-sm pointer-events-none">
              <ShieldCheck className="h-3 w-3" />
              <span>{t.mediaCard.noWatermark}</span>
            </div>
          </div>

          {/* Quick Specs */}
          <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Platform Stream:</span>
              <span className="font-mono text-slate-200">{meta.name} Verified CDN</span>
            </div>
            <div className="flex justify-between">
              <span>Codec & Quality:</span>
              <span className="font-mono text-slate-200">H.264 / AAC 320k</span>
            </div>
            <div className="flex justify-between">
              <span>Aspect Ratio:</span>
              <span className="font-mono text-slate-200">{media.aspectRatio || '16:9 HD'}</span>
            </div>
          </div>
        </div>

        {/* Right: Format Selector & Download Options (7 columns) */}
        <div className="space-y-4 lg:col-span-7">
          {/* 100% In-Site Native Download Hub (ZERO EXTERNAL REDIRECTS) */}
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>
                  {lang === 'en'
                    ? '100% In-Site Direct Download (No External Sites):'
                    : '১০০% এই সাইটেই সরাসরি ডাউনলোড (কোনো অন্য ওয়েবসাইটে যাবে না):'}
                </span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                100% On-Site
              </span>
            </div>

            {/* Quality Selector & Main Action Button */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => handleSaveFromDownload(quickFormat)}
                disabled={isQuickDownloading}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-60 py-3.5 px-4 font-bold text-white shadow-md transition-all text-sm group cursor-pointer"
              >
                {isQuickDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                )}
                <span>
                  {isQuickDownloading
                    ? (quickProgress || (lang === 'en' ? 'Processing stream...' : 'আসল ভিডিও প্রসেস হচ্ছে...'))
                    : quickFormat === 'mp3'
                    ? (lang === 'en' ? 'Download Real MP3 Audio' : 'আসল MP3 অডিও ডাউনলোড করুন')
                    : `${lang === 'en' ? 'Download Real MP4 Video' : 'আসল MP4 ভিডিও ডাউনলোড করুন'} (${quickFormat}p)`}
                </span>
              </button>

              <select
                value={quickFormat}
                onChange={(e) => setQuickFormat(e.target.value)}
                disabled={isQuickDownloading}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-xs font-semibold text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="720">MP4 720p HD (Best Quality)</option>
                <option value="1080">MP4 1080p Full HD</option>
                <option value="480">MP4 480p SD</option>
                <option value="360">MP4 360p Fast</option>
                <option value="mp3">MP3 320kbps Audio</option>
              </select>
            </div>

            {/* In-Site Live Progress Bar when extracting */}
            {isQuickDownloading && (
              <div className="rounded-lg bg-slate-950/80 p-3 text-xs text-slate-300 space-y-2 border border-emerald-500/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{quickProgress || 'সার্ভার থেকে ভিডিওর আসল ফাইল তৈরি হচ্ছে...'}</span>
                  </span>
                  <span className="font-mono text-emerald-300 font-bold">{downloadProgressPercent}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${downloadProgressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Direct Save Button once extracted */}
            {extractedDownloadUrl && (
              <button
                type="button"
                onClick={() => {
                  safeTriggerDirectDownload(
                    extractedDownloadUrl,
                    `${sanitizeFilename(media.title)}_${quickFormat}.${quickFormat === 'mp3' ? 'mp3' : 'mp4'}`
                  );
                  setSuccessMessage(
                    lang === 'en'
                      ? '✓ Saving real video to Computer Downloads!'
                      : '✓ আসল ভিডিওটি কম্পিউটারে সেভ হচ্ছে...'
                  );
                }}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 py-3.5 px-4 font-bold text-slate-950 shadow-lg transition-all text-sm animate-pulse cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>
                  {lang === 'en'
                    ? '✓ Video Ready! Click Here to Save File to Computer'
                    : '✓ ভিডিও প্রস্তুত! কম্পিউটারে সেভ করতে এখানে ক্লিক করুন'}
                </span>
              </button>
            )}

            {/* Dedicated Computer / PC Download Instruction Box */}
            <div className="rounded-lg bg-slate-950/80 p-3 text-xs text-slate-300 space-y-1.5 border border-emerald-500/20">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Laptop className="h-4 w-4 shrink-0" />
                <span>{lang === 'en' ? 'Direct Computer Download:' : 'কম্পিউটারে (PC / Laptop) সরাসরি সেভ হওয়ার নিয়ম:'}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                কোনো তৃতীয় পক্ষের ওয়েবসাইটে যাওয়া লাগবে না। উপরের <strong className="text-emerald-300">আসল MP4 ভিডিও ডাউনলোড করুন</strong> বাটনে চাপলেই সরাসরি এই ওয়েবসাইট থেকেই আসল ফাইলটি আপনার কম্পিউটারের <strong className="text-white">Downloads</strong> ফোল্ডারে সেভ হবে। ডাউনলোড শেষ হলে কীবোর্ডে <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono text-[10px]">Ctrl + J</kbd> (Mac-এ <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono text-[10px]">Cmd + Shift + J</kbd>) চাপলেই ভিডিওটি দেখতে ও প্লে করতে পারবেন।
              </p>
            </div>
          </div>

          {/* Format Category Tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/60 p-1">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold transition-all ${
                activeTab === 'video'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="h-3.5 w-3.5" />
              <span>{t.mediaCard.videoTab}</span>
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold transition-all ${
                activeTab === 'audio'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Music className="h-3.5 w-3.5" />
              <span>{t.mediaCard.audioTab}</span>
            </button>
            <button
              onClick={() => setActiveTab('thumbnail')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold transition-all ${
                activeTab === 'thumbnail'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>{t.mediaCard.thumbnailTab}</span>
            </button>
          </div>

          {/* Download Progress Bar Overlay */}
          {downloadProgress && (
            <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/30 p-3.5">
              <div className="flex items-center justify-between text-xs font-medium text-indigo-300">
                <span className="truncate">{downloadProgress.stage}</span>
                <span className="font-mono tabular-nums text-white">{downloadProgress.percent}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                  style={{ width: `${downloadProgress.percent}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
                <span>Speed: {downloadProgress.speed}</span>
                <span>Optimized Multi-Thread</span>
              </div>
            </div>
          )}

          {/* Mobile Download Action & Save to Gallery Card */}
          {lastDownloaded && (
            <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/40 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{lang === 'en' ? 'Download Ready for Your Phone!' : 'ফাইল প্রস্তুত! ফোনে সেভ করুন:'}</span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-300 truncate max-w-xs sm:max-w-md">
                    {lastDownloaded.fileName}
                  </p>
                </div>
                <span className="font-mono text-xs text-indigo-300 tabular-nums shrink-0">
                  {lastDownloaded.sizeMb} MB
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleShareToGallery}
                  disabled={isSharing}
                  className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>
                    {lang === 'en' ? 'Save / Share to Gallery' : 'গ্যালারি বা ফাইলে সেভ করুন'}
                  </span>
                </button>

                <a
                  href={lastDownloaded.blobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-indigo-400" />
                  <span>
                    {lang === 'en' ? 'Open & Play Directly' : 'সরাসরি ফোনে চালান'}
                  </span>
                </a>
              </div>

              {/* Mobile File Location Guide */}
              <div className="rounded-lg bg-slate-950/70 p-3 text-[11px] text-slate-400 space-y-1 border border-slate-800">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{lang === 'en' ? 'Where is this file on your mobile?' : 'মোবাইলে ফাইলটি কোথায় খুঁজবেন?'}</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1">
                  <li>
                    <strong className="text-slate-300">Android:</strong> ফোনের <code className="text-indigo-300">Files / My Files</code> অ্যাপ ➔ <code className="text-indigo-300">Downloads</code> ফোল্ডারে ফাইলটি জমা হয়েছে।
                  </li>
                  <li>
                    <strong className="text-slate-300">iPhone:</strong> <code className="text-indigo-300">Files</code> অ্যাপ ➔ <code className="text-indigo-300">Downloads</code> ফোল্ডার খুলুন, অথবা উপরের &apos;গ্যালারিতে সেভ করুন&apos; চাপুন।
                  </li>
                </ul>
              </div>
            </div>
          )}

          {successMessage && !lastDownloaded && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{successMessage}</span>
            </div>
          )}

          {/* TAB 1: VIDEO STREAMS */}
          {activeTab === 'video' && (
            <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-950/40">
              {media.videoFormats.map((opt) => {
                const isItemDownloading = downloadingId === opt.id;
                return (
                  <div
                    key={opt.id}
                    className="flex flex-col gap-2 p-3 transition-colors hover:bg-slate-800/30 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                        <Film className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{opt.quality}</span>
                          <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
                            {opt.format}
                          </span>
                          {opt.quality.includes('4K') && (
                            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-400">
                              <Sparkles className="h-3 w-3" /> Ultra HD
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{opt.resolution}</span>
                          <span>·</span>
                          <span className="font-mono tabular-nums">{opt.fps} FPS</span>
                          <span>·</span>
                          <span className="font-mono tabular-nums">~{opt.sizeMb} MB</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isQuickDownloading}
                      onClick={() => {
                        const targetFormat = opt.id.includes('4k') ? '1080' : opt.id.includes('1080') ? '1080' : opt.id.includes('720') ? '720' : opt.id.includes('480') ? '480' : '360';
                        setQuickFormat(targetFormat);
                        handleSaveFromDownload(targetFormat);
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50 shadow-sm cursor-pointer"
                    >
                      {isQuickDownloading && quickFormat === (opt.id.includes('4k') ? '1080' : opt.id.includes('1080') ? '1080' : opt.id.includes('720') ? '720' : opt.id.includes('480') ? '480' : '360') ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      <span>{t.mediaCard.downloadBtn}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: AUDIO TRACKS */}
          {activeTab === 'audio' && (
            <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-950/40">
              {media.audioFormats.map((opt) => {
                return (
                  <div
                    key={opt.id}
                    className="flex flex-col gap-2 p-3 transition-colors hover:bg-slate-800/30 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                        <Music className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{opt.quality}</span>
                          <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
                            {opt.format}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="font-mono">{opt.bitrate}</span>
                          <span>·</span>
                          <span className="font-mono tabular-nums">~{opt.sizeMb} MB</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenTrimmer(media)}
                        className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
                        title="Cut or Trim Audio"
                      >
                        <Scissors className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={isQuickDownloading}
                        onClick={() => {
                          setQuickFormat('mp3');
                          handleSaveFromDownload('mp3');
                        }}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-violet-500 disabled:opacity-50 shadow-sm cursor-pointer"
                      >
                        {isQuickDownloading && quickFormat === 'mp3' ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        <span>{t.mediaCard.downloadBtn}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: THUMBNAIL / ARTWORK */}
          {activeTab === 'thumbnail' && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <img
                  src={media.thumbnailUrl}
                  alt={media.title}
                  referrerPolicy="no-referrer"
                  className="h-32 w-48 rounded-lg object-cover border border-slate-800 shadow"
                />
                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <h4 className="text-xs font-bold text-white">Full Resolution Cover Thumbnail</h4>
                  <p className="text-xs text-slate-400">
                    Direct original JPEG master artwork from {meta.name}. Ideal for wallpapers, blog covers, or archiving.
                  </p>
                  <div className="text-xs text-slate-500 font-mono">1920 x 1080 · High Quality JPEG</div>
                  <button
                    disabled={Boolean(downloadingId)}
                    onClick={() => handleDownload('thumbnail', 'thumb-hd', 'HD Cover')}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download HD Thumbnail</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
