import React, { useState } from 'react';
import { Language, TRANSLATIONS } from '../utils/translations';
import {
  Copy,
  Share2,
  Smartphone,
  Monitor,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface PlatformGuideProps {
  lang: Language;
}

export const PlatformGuide: React.FC<PlatformGuideProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [activeGuide, setActiveGuide] = useState<string>('youtube');

  const guides = [
    {
      id: 'youtube',
      name: 'YouTube',
      mobile: [
        'Open YouTube or YouTube Shorts app.',
        'Find the video you wish to download and tap the "Share" button beneath it.',
        'Tap "Copy Link" from the share sheet.',
        'Return to OmniMedia Downloader and hit "Paste".',
      ],
      desktop: [
        'Open your web browser and go to YouTube.',
        'Navigate to the video or Short.',
        'Copy the URL directly from your browser address bar or right-click video -> "Copy video URL".',
        'Paste in OmniMedia Downloader and select quality.',
      ],
      tips: 'Works for YouTube Shorts, long-form videos up to 4K, and MP3 music extraction.',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      mobile: [
        'Open the Facebook app and locate any Reel or Watch video.',
        'Tap the "Share" icon (arrow) at bottom right.',
        'Select "Copy Link" from the menu options.',
        'Paste inside OmniMedia Downloader.',
      ],
      desktop: [
        'Open Facebook on your browser.',
        'Click the three dots (...) at the top right of the post or right-click video timestamp.',
        'Click "Copy link".',
        'Paste into the downloader.',
      ],
      tips: 'Supports public Reels, Watch videos, and community group video clips in HD 1080p.',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      mobile: [
        'Open Instagram and view any Reel, Post, or Carousel video.',
        'Tap the paper plane (Share) icon on the right side.',
        'Tap "Copy Link" at the bottom of the sharing list.',
        'Paste into OmniMedia Downloader.',
      ],
      desktop: [
        'Open Instagram on your browser.',
        'Open the Reel or Post.',
        'Copy the URL from the browser address bar (e.g. instagram.com/reel/...).',
        'Paste into the app.',
      ],
      tips: 'Extracts full HD Reels without watermark and allows separating audio tracks into MP3.',
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      mobile: [
        'Open Pinterest and tap the Video Pin you like.',
        'Tap the "Share" button at the bottom right.',
        'Choose "Copy link" (or "pin.it" short link).',
        'Paste it into OmniMedia Downloader.',
      ],
      desktop: [
        'Open Pinterest and click on the Pin.',
        'Copy the URL from your browser address bar or click the share arrow -> "Copy link".',
        'Paste into OmniMedia Downloader.',
      ],
      tips: 'Downloads full-resolution video Pins, Idea Pins, and high-res cover photos.',
    },
    {
      id: 'twitter',
      name: 'Twitter / X',
      mobile: [
        'Open the X / Twitter app and find the tweet with video.',
        'Tap the Share button at the bottom right of the post.',
        'Tap "Copy Link".',
        'Paste into OmniMedia Downloader.',
      ],
      desktop: [
        'Navigate to the tweet on x.com.',
        'Click the share button under the tweet or copy the URL from the address bar.',
        'Paste into OmniMedia Downloader.',
      ],
      tips: 'Converts GIFs to MP4 and downloads 1080p 60FPS video feeds.',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      mobile: [
        'Open TikTok and find the video you want.',
        'Tap the "Share" button (arrow icon) on the right.',
        'Tap "Copy Link".',
        'Paste into OmniMedia Downloader.',
      ],
      desktop: [
        'Open TikTok on your web browser.',
        'Click the "Copy link" button next to the video description.',
        'Paste into OmniMedia Downloader.',
      ],
      tips: 'Auto-removes TikTok watermark and extracts trending sound clips directly into MP3.',
    },
  ];

  const currentGuide = guides.find((g) => g.id === activeGuide) || guides[0];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {t.guide.title}
        </h2>
        <p className="mt-2 text-balance text-xs text-slate-400 sm:text-sm">
          {t.guide.subtitle}
        </p>
      </div>

      {/* 3 Step Overview Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-xs">
            1
          </div>
          <h3 className="mt-2 text-sm font-bold text-white">{t.guide.step1}</h3>
          <p className="mt-1 text-xs text-slate-400">{t.guide.step1Desc}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-xs">
            2
          </div>
          <h3 className="mt-2 text-sm font-bold text-white">{t.guide.step2}</h3>
          <p className="mt-1 text-xs text-slate-400">{t.guide.step2Desc}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-xs">
            3
          </div>
          <h3 className="mt-2 text-sm font-bold text-white">{t.guide.step3}</h3>
          <p className="mt-1 text-xs text-slate-400">{t.guide.step3Desc}</p>
        </div>
      </div>

      {/* Detailed platform breakdown */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-md sm:p-6">
        {/* Platform selector row */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
          {guides.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGuide(g.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeGuide === g.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Device toggle */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-bold text-white">
            {currentGuide.name} Guide
          </span>
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                device === 'mobile'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile App</span>
            </button>
            <button
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                device === 'desktop'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>PC / Browser</span>
            </button>
          </div>
        </div>

        {/* Steps List */}
        <div className="mt-4 space-y-2.5">
          {(device === 'mobile' ? currentGuide.mobile : currentGuide.desktop).map(
            (step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg border border-slate-800/80 bg-slate-950/40 p-3 text-xs"
              >
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[11px] font-bold text-indigo-400">
                  {idx + 1}
                </div>
                <span className="text-slate-300">{step}</span>
              </div>
            )
          )}
        </div>

        {/* Helpful Tip */}
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-indigo-900/30 bg-indigo-950/20 p-3 text-xs text-indigo-300">
          <Info className="h-4 w-4 shrink-0 text-indigo-400" />
          <span>Tip: {currentGuide.tips}</span>
        </div>
      </div>
    </div>
  );
};
