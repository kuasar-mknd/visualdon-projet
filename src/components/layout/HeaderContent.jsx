import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const HeaderContent = () => {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
          {t('title')}
        </h1>
        <p className="text-slate-600 mt-0.5 text-sm font-normal">{t('subtitle')}</p>
      </div>

      <div className="flex items-center gap-4">
          <div
            role="group"
            aria-label={t('aria.toggleLanguage')}
            className="flex p-1 bg-slate-100/50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
              <button
                  onClick={() => language !== 'en' && toggleLanguage()}
                  aria-current={language === 'en'}
                  lang="en"
                  aria-label={t('aria.switchToEnglish')}
                  title="English"
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 outline-none cursor-pointer ${
                    language === 'en'
                      ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                  EN
              </button>
              <button
                  onClick={() => language !== 'fr' && toggleLanguage()}
                  aria-current={language === 'fr'}
                  lang="fr"
                  aria-label={t('aria.switchToFrench')}
                  title="Français"
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 outline-none cursor-pointer ${
                    language === 'fr'
                      ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                  FR
              </button>
          </div>
      </div>
    </>
  );
};

export default React.memo(HeaderContent);
