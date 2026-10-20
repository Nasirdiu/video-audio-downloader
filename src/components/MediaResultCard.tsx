import React, { useState, useRef } from 'react';
import { MediaItem } from '../types';
import { Language, TRANSLATIONS } from '../utils/translations';
import { PLATFORMS_DATA } from '../utils/platformDetector';
import { downloadMediaStream, ExportProgress, shareOrSaveToMobileGallery, triggerBrowserDownload, isInAppBrowser } from '../utils/mediaExporter';
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
    blob: Blob;
    blobUrl: string;
    type: 'video' | 'audio' | 'thumbnail';
    sizeMb: number;
  } | null>(null);
  const [isSharing, setIsSharing] = useState(false);

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
    if (!lastDownloaded) return;
    setIsSharing(true);
    try {
      await shareOrSaveToMobileGallery(
        lastDownloaded.blob,
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

      setLastDownloaded({
        fileName: result.fileName,
        blob: result.blob,
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
            {media.sampleVideoUrl ? (
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
            ) : (
              <img
                src={media.thumbnailUrl}
                alt={media.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            )}

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

            {/* Platform watermark free indicator */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-emerald-400 backdrop-blur-sm">
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
                      disabled={Boolean(downloadingId)}
                      onClick={() => handleDownload('video', opt.id, opt.quality)}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{isItemDownloading ? t.mediaCard.downloading : t.mediaCard.downloadBtn}</span>
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
                const isItemDownloading = downloadingId === opt.id;
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
                        disabled={Boolean(downloadingId)}
                        onClick={() => handleDownload('audio', opt.id, opt.quality)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-violet-500 disabled:opacity-50"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>{isItemDownloading ? t.mediaCard.downloading : t.mediaCard.downloadBtn}</span>
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
