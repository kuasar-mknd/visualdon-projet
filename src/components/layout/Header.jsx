import React from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '../../context/LanguageContext';

const Header = ({ year }) => {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <header className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4 glass-panel-light p-4 rounded-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
          {t('title')}
        </h1>
        <p className="text-slate-500 mt-0.5 text-sm font-normal">{t('subtitle')}</p>
      </div>
      
      <div className="flex items-center gap-4">
          <button 
              onClick={toggleLanguage}
              aria-label={t('aria.toggleLanguage')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all duration-300 text-xs font-semibold text-slate-600 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none"
          >
              {language === 'en' ? 'FR' : 'EN'}
          </button>
          <div className="text-right bg-white/50 px-4 py-1.5 rounded-xl border border-slate-100 shadow-sm">
              <div className="text-3xl font-mono font-bold text-blue-600 leading-none">{year || '...'}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold leading-none">{t('year')}</div>
          </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

// Optimization: Memoize to prevent re-renders when parent re-renders but props are same.
export default React.memo(Header);
