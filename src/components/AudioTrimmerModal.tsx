import React, { useState, useRef, useEffect } from 'react';
import { MediaItem } from '../types';
import { Language, TRANSLATIONS } from '../utils/translations';
import { createSyntheticAudioBlob, triggerBrowserDownload, sanitizeFilename } from '../utils/mediaExporter';
import {
  X,
  Play,
  Pause,
  Scissors,
  Download,
  Loader2,
  Volume2,
  Clock,
  Music,
} from 'lucide-react';

interface AudioTrimmerModalProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSaveToHistory: (info: {
    media: MediaItem;
    format: string;
    quality: string;
    fileName: string;
    sizeMb: number;
    type: 'audio';
  }) => void;
}

export const AudioTrimmerModal: React.FC<AudioTrimmerModalProps> = ({
  media,
  isOpen,
  onClose,
  lang,
  onSaveToHistory,
}) => {
  const t = TRANSLATIONS[lang];
  const maxDuration = media ? media.duration : 60;

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(Math.min(30, maxDuration));
  const [bitrate, setBitrate] = useState<'320' | '256' | '192' | '128'>('320');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (media) {
      setStartTime(0);
      setEndTime(Math.min(30, media.duration));
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [media]);

  if (!isOpen || !media) return null;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlayPreview = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = startTime;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    setCurrentTime(cur);
    if (cur >= endTime) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current.currentTime = startTime;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const segmentDuration = Math.max(1, endTime - startTime);

    // Simulate audio rendering
    await new Promise((r) => setTimeout(r, 800));

    // Synthesize real playable audio blob for the selected length
    const blob = createSyntheticAudioBlob(segmentDuration, 440);
    const cleanName = sanitizeFilename(media.title);
    const fileName = `[Trimmed_${formatSeconds(startTime)}-${formatSeconds(endTime)}]_${cleanName}_${bitrate}kbps.mp3`;

    triggerBrowserDownload(blob, fileName);

    const estSize = Math.round(((segmentDuration / 60) * (Number(bitrate) / 8) * 0.06) * 100) / 100 || 1.2;

    onSaveToHistory({
      media,
      format: 'MP3',
      quality: `${bitrate} kbps Trimmed`,
      fileName,
      sizeMb: estSize,
      type: 'audio',
    });

    setIsExporting(false);
    onClose();
  };

  const selectedDuration = Math.max(0, endTime - startTime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Scissors className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.trimmer.title}</h3>
              <p className="text-xs text-slate-400">{t.trimmer.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Media info */}
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
          <img
            src={media.thumbnailUrl}
            alt=""
            className="h-12 w-12 rounded object-cover"
          />
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-xs font-semibold text-white">{media.title}</h4>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
              <span>{media.author}</span>
              <span>·</span>
              <span>Total: {media.durationFormatted}</span>
            </div>
          </div>
        </div>

        {/* Waveform / Visual preview */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span>{t.trimmer.selectedSegment}:</span>
              <span className="font-mono font-bold text-white tabular-nums">
                {formatSeconds(selectedDuration)}
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              {formatSeconds(startTime)} — {formatSeconds(endTime)}
            </div>
          </div>

          {/* Visual Waveform Bar Simulation */}
          <div className="relative h-16 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2 flex items-center gap-1">
            {Array.from({ length: 48 }).map((_, idx) => {
              const fraction = idx / 48;
              const isSelected = fraction >= startTime / maxDuration && fraction <= endTime / maxDuration;
              const height = 15 + Math.sin(idx * 0.4) * 20 + Math.cos(idx * 0.9) * 12;
              return (
                <div
                  key={idx}
                  className="flex-1 rounded-full transition-colors"
                  style={{
                    height: `${Math.max(12, Math.min(50, height))}px`,
                    backgroundColor: isSelected ? '#6366f1' : '#334155',
                  }}
                />
              );
            })}
          </div>

          {/* Range Sliders */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-[11px] font-medium text-slate-400">
                {t.trimmer.startPoint}: <span className="font-mono text-white">{formatSeconds(startTime)}</span>
              </label>
              <input
                type="range"
                min={0}
                max={Math.max(0, endTime - 1)}
                value={startTime}
                onChange={(e) => setStartTime(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400">
                {t.trimmer.endPoint}: <span className="font-mono text-white">{formatSeconds(endTime)}</span>
              </label>
              <input
                type="range"
                min={startTime + 1}
                max={maxDuration}
                value={endTime}
                onChange={(e) => setEndTime(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Bitrate Selector */}
        <div className="mt-5">
          <label className="text-xs font-medium text-slate-400">{t.trimmer.bitrate}:</label>
          <div className="mt-1.5 grid grid-cols-4 gap-2">
            {(['320', '256', '192', '128'] as const).map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setBitrate(rate)}
                className={`rounded-lg border py-1.5 text-xs font-mono transition-all ${
                  bitrate === rate
                    ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                }`}
              >
                {rate} kbps
              </button>
            ))}
          </div>
        </div>

        {/* Hidden Audio element for preview */}
        <audio
          ref={audioRef}
          src={media.sampleAudioUrl || 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3'}
          onTimeUpdate={handleTimeUpdate}
        />

        {/* Action Controls */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            onClick={handlePlayPreview}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlaying ? 'Pause Clip' : 'Play Trimmed'}</span>
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t.trimmer.exportingBtn}</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>{t.trimmer.exportBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
