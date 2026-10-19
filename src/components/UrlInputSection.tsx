import React, { useState } from 'react';
import { detectPlatform, PLATFORMS_DATA } from '../utils/platformDetector';
import { Language, TRANSLATIONS } from '../utils/translations';
import { Clipboard, X, ArrowRight, Loader2, Link2, Sparkles } from 'lucide-react';
import { SupportedPlatform } from '../types';

interface UrlInputSectionProps {
  url: string;
  onUrlChange: (newUrl: string) => void;
  onSubmit: (urlToResolve: string) => void;
  isLoading: boolean;
  lang: Language;
}

export const UrlInputSection: React.FC<UrlInputSectionProps> = ({
  url,
  onUrlChange,
  onSubmit,
  isLoading,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const detected = detectPlatform(url);
  const platformMeta = PLATFORMS_DATA[detected];
  const [clipboardError, setClipboardError] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      setClipboardError(null);
      const text = await navigator.clipboard.readText();
      if (text) {
        onUrlChange(text.trim());
      }
    } catch {
      setClipboardError('Clipboard permission denied. Please paste manually.');
      setTimeout(() => setClipboardError(null), 3500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && url.trim() && !isLoading) {
      onSubmit(url.trim());
    }
  };

  const samplePlatforms: SupportedPlatform[] = [
    'youtube',
    'facebook',
    'instagram',
    'pinterest',
    'twitter',
    'tiktok',
    'reddit',
    'soundcloud',
  ];

  return (
    <div className="w-full">
      {/* Hero Headline */}
      <div className="mb-6 text-center">
        <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t.heroTag}</span>
        </div>
        <h1 className="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {t.heroTitle}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-balance text-sm text-slate-400 sm:text-base">
          {t.heroSubtitle}
        </p>
      </div>

      {/* Main URL Input Box Container */}
      <div className="relative mx-auto max-w-3xl rounded-xl border border-slate-800 bg-slate-900/90 p-2 shadow-2xl shadow-indigo-950/20 backdrop-blur-md transition-all focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex flex-1 items-center">
            <div className="pointer-events-none pl-3 text-slate-500">
              <Link2 className="h-5 w-5" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.inputPlaceholder}
              className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              autoComplete="off"
              spellCheck="false"
            />
            {url && (
              <button
                type="button"
                onClick={() => onUrlChange('')}
                className="mr-2 rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                title={t.clearBtn}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 px-1 sm:px-0">
            {/* Quick Paste Button */}
            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-700 hover:text-white"
            >
              <Clipboard className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">{t.pasteBtn}</span>
            </button>

            {/* Analyze & Download Primary CTA */}
            <button
              type="button"
              disabled={isLoading || !url.trim()}
              onClick={() => onSubmit(url.trim())}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="whitespace-nowrap">{t.analyzingBtn}</span>
                </>
              ) : (
                <>
                  <span className="whitespace-nowrap">{t.analyzeBtn}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic detected platform indicator */}
        {url.trim() && detected !== 'generic' && (
          <div className="mt-2 flex items-center justify-between border-t border-slate-800/70 pt-2 px-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Detected:</span>
              <span className={`font-semibold ${platformMeta.badgeClass} rounded px-1.5 py-0.5 border`}>
                {platformMeta.name}
              </span>
              <span className="text-slate-500 hidden sm:inline">· {platformMeta.domain}</span>
            </div>
            <span className="text-slate-500">
              Supports: {platformMeta.supportedTypes.slice(0, 2).join(', ')}
            </span>
          </div>
        )}
      </div>

      {clipboardError && (
        <p className="mt-2 text-center text-xs text-amber-400">{clipboardError}</p>
      )}

      {/* Quick Test Samples Bar */}
      <div className="mx-auto mt-4 max-w-3xl">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="shrink-0 font-medium text-slate-500">{t.quickTest}</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {samplePlatforms.map((plat) => {
              const meta = PLATFORMS_DATA[plat];
              return (
                <button
                  key={plat}
                  type="button"
                  onClick={() => {
                    onUrlChange(meta.sampleUrl);
                    onSubmit(meta.sampleUrl);
                  }}
                  className="rounded-md border border-slate-800 bg-slate-900/60 px-2 py-1 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                >
                  {meta.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
