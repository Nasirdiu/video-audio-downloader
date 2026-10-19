import React from 'react';
import { Language, TRANSLATIONS } from '../utils/translations';
import { Languages, DownloadCloud } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  lang: Language;
  onLangToggle: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  lang,
  onLangToggle,
  historyCount,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand wordmark (single element, no chips/pills) */}
        <button
          onClick={() => onTabChange('single')}
          className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-sm shadow-indigo-500/20">
            <DownloadCloud className="h-5 w-5" />
          </div>
          <span className="whitespace-nowrap font-display text-lg font-bold tracking-tight text-white">
            {t.brandName}
          </span>
        </button>

        {/* Zone 2: 4-5 concise single-line nav links with hover underlines */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
          <button
            onClick={() => onTabChange('single')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentTab === 'single' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {t.tabs.single}
          </button>
          <button
            onClick={() => onTabChange('batch')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentTab === 'batch' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {t.tabs.batch}
          </button>
          <button
            onClick={() => onTabChange('trimmer')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentTab === 'trimmer' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {t.tabs.trimmer}
          </button>
          <button
            onClick={() => onTabChange('history')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-white ${
              currentTab === 'history' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <span>{t.tabs.history}</span>
            {historyCount > 0 && (
              <span className="font-mono text-xs tabular-nums text-indigo-400">
                ({historyCount})
              </span>
            )}
          </button>
          <button
            onClick={() => onTabChange('platforms')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentTab === 'platforms' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {t.tabs.platforms}
          </button>
          <button
            onClick={() => onTabChange('guide')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentTab === 'guide' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {t.tabs.guide}
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onLangToggle}
            aria-label="Toggle language between English and Bengali"
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            <Languages className="h-4 w-4 text-indigo-400" />
            <span className="whitespace-nowrap">{lang === 'en' ? 'বাংলা' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="flex overflow-x-auto border-t border-slate-900 px-4 py-2 text-xs md:hidden">
        <div className="flex gap-4">
          <button
            onClick={() => onTabChange('single')}
            className={`whitespace-nowrap ${currentTab === 'single' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            {t.tabs.single}
          </button>
          <button
            onClick={() => onTabChange('batch')}
            className={`whitespace-nowrap ${currentTab === 'batch' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            {t.tabs.batch}
          </button>
          <button
            onClick={() => onTabChange('trimmer')}
            className={`whitespace-nowrap ${currentTab === 'trimmer' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            {t.tabs.trimmer}
          </button>
          <button
            onClick={() => onTabChange('history')}
            className={`whitespace-nowrap ${currentTab === 'history' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            {t.tabs.history} ({historyCount})
          </button>
          <button
            onClick={() => onTabChange('platforms')}
            className={`whitespace-nowrap ${currentTab === 'platforms' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            {t.tabs.platforms}
          </button>
          <button
            onClick={() => onTabChange('guide')}
            className={`whitespace-nowrap ${currentTab === 'guide' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            {t.tabs.guide}
          </button>
        </div>
      </div>
    </header>
  );
};
