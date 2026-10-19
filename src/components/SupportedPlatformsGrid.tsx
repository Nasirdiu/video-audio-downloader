import React from 'react';
import { SupportedPlatform } from '../types';
import { PLATFORMS_DATA } from '../utils/platformDetector';
import { Language } from '../utils/translations';
import {
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  Video,
  Music,
  Share2,
  Tv,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface SupportedPlatformsGridProps {
  lang: Language;
  onSelectSample: (url: string) => void;
}

export const SupportedPlatformsGrid: React.FC<SupportedPlatformsGridProps> = ({
  lang,
  onSelectSample,
}) => {
  const platforms: SupportedPlatform[] = [
    'youtube',
    'facebook',
    'instagram',
    'pinterest',
    'twitter',
    'tiktok',
    'reddit',
    'threads',
    'vimeo',
    'linkedin',
    'soundcloud',
    'twitch',
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {lang === 'en' ? 'Supported Social Platforms' : 'সমর্থিত সোশ্যাল প্ল্যাটফর্মসমূহ'}
        </h2>
        <p className="mt-2 text-balance text-xs text-slate-400 sm:text-sm">
          {lang === 'en'
            ? 'Fast, high-fidelity video extraction and MP3 audio conversion across 12+ major networks.'
            : '১২টিরও বেশি শীর্ষ প্ল্যাটফর্ম থেকে দ্রুত ও নিখুঁত ভিডিও এবং MP3 অডিও ডাউনলোড সুবিধা।'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {platforms.map((platformKey) => {
          const meta = PLATFORMS_DATA[platformKey];
          return (
            <div
              key={platformKey}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all hover:border-slate-700 hover:bg-slate-800/40"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`rounded border px-2 py-0.5 text-xs font-bold ${meta.badgeClass}`}>
                    {meta.name}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {meta.domain.split('/')[0]}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="text-xs font-medium text-slate-300">
                    {meta.supportedTypes.slice(0, 3).join(' · ')}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-2">
                    {meta.sampleTitle}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => onSelectSample(meta.sampleUrl)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-indigo-500 hover:bg-indigo-600 hover:text-white"
                >
                  <span>{lang === 'en' ? 'Try Sample Link' : 'টেস্ট লিংক ব্যবহার করুন'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
