import React, { useState } from 'react';
import { BatchItem, MediaItem } from '../types';
import { detectPlatform, PLATFORMS_DATA } from '../utils/platformDetector';
import { resolveMediaUrl } from '../utils/mediaResolver';
import { downloadMediaStream } from '../utils/mediaExporter';
import { Language, TRANSLATIONS } from '../utils/translations';
import {
  ListPlus,
  Play,
  Trash2,
  CheckCircle,
  Loader2,
  AlertCircle,
  Film,
  Music,
  ExternalLink,
} from 'lucide-react';

interface BatchDownloaderProps {
  lang: Language;
  onDownloadFinished: (item: {
    media: MediaItem;
    format: string;
    quality: string;
    fileName: string;
    sizeMb: number;
    type: 'video' | 'audio' | 'image';
  }) => void;
}

export const BatchDownloader: React.FC<BatchDownloaderProps> = ({
  lang,
  onDownloadFinished,
}) => {
  const t = TRANSLATIONS[lang];
  const [inputText, setInputText] = useState('');
  const [queue, setQueue] = useState<BatchItem[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const handleAddToQueue = async () => {
    const rawLines = inputText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('http://') || l.startsWith('https://'));

    if (rawLines.length === 0) return;

    const newItems: BatchItem[] = rawLines.map((url) => ({
      id: 'batch_' + Math.random().toString(36).substring(2, 9),
      url,
      platform: detectPlatform(url),
      status: 'pending',
      progress: 0,
    }));

    setQueue((prev) => [...prev, ...newItems]);
    setInputText('');

    // Auto resolve pending items
    for (const item of newItems) {
      resolveItem(item.id, item.url);
    }
  };

  const resolveItem = async (id: string, url: string) => {
    setQueue((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: 'resolving' } : it))
    );

    try {
      const media = await resolveMediaUrl(url);
      setQueue((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                status: 'ready',
                media,
                selectedFormat: media.videoFormats[1]?.id || media.videoFormats[0]?.id,
              }
            : it
        )
      );
    } catch {
      setQueue((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, status: 'error', errorMessage: 'Could not resolve stream' } : it
        )
      );
    }
  };

  const handleDownloadSingle = async (item: BatchItem, type: 'video' | 'audio' = 'video') => {
    if (!item.media) return;

    setQueue((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, status: 'downloading', progress: 10 } : it))
    );

    try {
      const formatId = type === 'audio' ? item.media.audioFormats[0].id : (item.selectedFormat || item.media.videoFormats[0].id);
      const qualityLabel = type === 'audio' ? 'MP3 320k' : '1080p Full HD';

      const res = await downloadMediaStream({
        media: item.media,
        type,
        formatId,
        qualityLabel,
        onProgress: (p) => {
          setQueue((prev) =>
            prev.map((it) => (it.id === item.id ? { ...it, progress: p.percent } : it))
          );
        },
      });

      onDownloadFinished({
        media: item.media,
        format: type === 'audio' ? 'MP3' : 'MP4',
        quality: qualityLabel,
        fileName: res.fileName,
        sizeMb: res.sizeMb,
        type,
      });

      setQueue((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, status: 'completed', progress: 100 } : it
        )
      );
    } catch {
      setQueue((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, status: 'error', errorMessage: 'Download failed' } : it
        )
      );
    }
  };

  const handleStartAll = async () => {
    if (isProcessingAll || queue.length === 0) return;
    setIsProcessingAll(true);

    const pendingOrReady = queue.filter(
      (it) => it.status === 'ready' || it.status === 'pending'
    );

    for (const item of pendingOrReady) {
      if (item.status === 'ready' && item.media) {
        await handleDownloadSingle(item, 'video');
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    setIsProcessingAll(false);
  };

  const handleRemove = (id: string) => {
    setQueue((prev) => prev.filter((it) => it.id !== id));
  };

  const handleClearAll = () => {
    setQueue([]);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg backdrop-blur-md sm:p-6">
        <h2 className="text-xl font-bold text-white sm:text-2xl">{t.batch.title}</h2>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">{t.batch.description}</p>

        {/* Textarea */}
        <div className="mt-4 space-y-3">
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.batch.inputPlaceholder}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleAddToQueue}
              disabled={!inputText.trim()}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 disabled:opacity-50"
            >
              <ListPlus className="h-4 w-4" />
              <span>{t.batch.addQueueBtn}</span>
            </button>

            {queue.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-800 px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{t.batch.clearQueue}</span>
                </button>

                <button
                  onClick={handleStartAll}
                  disabled={isProcessingAll}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
                >
                  {isProcessingAll ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span>{t.batch.startAllBtn}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Queue Table */}
      {queue.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 shadow-md">
          <div className="border-b border-slate-800 px-4 py-3 text-xs font-medium text-slate-400">
            <span>{queue.length} {t.batch.itemsCount}</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {queue.map((item) => {
              const meta = PLATFORMS_DATA[item.platform];
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-slate-800/20 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Item Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md border border-slate-800 bg-black">
                      {item.media ? (
                        <img
                          src={item.media.thumbnailUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-600 font-mono">
                          LINK
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded border px-1.5 py-0.2 text-[10px] font-bold ${meta.badgeClass}`}>
                          {meta.name}
                        </span>
                        <span className="truncate text-xs font-semibold text-white">
                          {item.media ? item.media.title : item.url}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        {item.media && <span>{item.media.durationFormatted}</span>}
                        {item.media && <span>·</span>}
                        <span className="truncate text-slate-500 font-mono text-[10px]">
                          {item.url}
                        </span>
                      </div>

                      {/* Downloading progress bar */}
                      {item.status === 'downloading' && (
                        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full bg-indigo-500 transition-all duration-200"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {item.status === 'pending' && (
                      <span className="text-xs text-slate-400">{t.batch.statusPending}</span>
                    )}
                    {item.status === 'resolving' && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>{t.batch.statusResolving}</span>
                      </div>
                    )}
                    {item.status === 'ready' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDownloadSingle(item, 'video')}
                          className="flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500"
                        >
                          <Film className="h-3 w-3" />
                          <span>Video</span>
                        </button>
                        <button
                          onClick={() => handleDownloadSingle(item, 'audio')}
                          className="flex items-center gap-1 rounded-md bg-violet-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-violet-500"
                        >
                          <Music className="h-3 w-3" />
                          <span>MP3</span>
                        </button>
                      </div>
                    )}
                    {item.status === 'completed' && (
                      <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                        <CheckCircle className="h-4 w-4" />
                        <span>{t.batch.statusCompleted}</span>
                      </div>
                    )}
                    {item.status === 'error' && (
                      <div className="flex items-center gap-1 text-xs text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <span>{t.batch.statusError}</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 text-slate-500 hover:text-slate-300"
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
          Queue is empty. Paste several URLs above to download in batch!
        </div>
      )}
    </div>
  );
};
