import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const LanguageToggle = () => {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t('aria.toggleLanguage')}
      className="flex p-1 bg-slate-100/50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
    >
      <button
        onClick={() => language !== 'en' && toggleLanguage()}
        aria-pressed={language === 'en'}
        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 outline-none ${
          language === 'en'
            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => language !== 'fr' && toggleLanguage()}
        aria-pressed={language === 'fr'}
        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 outline-none ${
          language === 'fr'
            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        FR
      </button>
    </div>
  );
};

export default React.memo(LanguageToggle);
