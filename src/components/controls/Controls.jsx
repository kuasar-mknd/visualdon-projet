import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Controls = ({ isPlaying, setIsPlaying, category, setCategory, year, setYear, yearRange }) => {
  const { t } = useLanguage();

  return (
    <div className="glass-panel-light p-4 rounded-2xl shrink-0">
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold tracking-wide transition-all duration-300 shadow-sm hover:shadow-md ${
            isPlaying 
              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
              : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
          }`}
        >
          {isPlaying ? t('pause') : t('play')}
        </button>
        
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium shadow-sm cursor-pointer hover:border-blue-300 transition-colors text-sm"
          aria-label={t('aria.selectCategory')}
        >
          <option value="Total">{t('total')}</option>
          <option value="Per Capita">{t('perCapita')}</option>
        </select>
      </div>

      <div className="px-1">
        <input
          type="range"
          min={yearRange.min}
          max={yearRange.max}
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          aria-label={t('aria.selectYear')}
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
          <span>{yearRange.min}</span>
          <span>{yearRange.max}</span>
        </div>
      </div>
    </div>
  );
};

export default Controls;
