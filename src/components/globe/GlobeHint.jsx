import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const GlobeHint = () => {
  const { t } = useLanguage();

  return (
    <div
      className="absolute bottom-4 right-4 flex flex-col gap-2 items-end select-none opacity-60 hover:opacity-100 transition-opacity"
      aria-hidden="true"
    >
       <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-white/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/50 shadow-sm cursor-help">
         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
           <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M19 9l3 3-3 3M15 19l-3 3-3-3M2 12h20M12 2v20"/>
         </svg>
         <span>{t('globe.drag')}</span>
       </div>
       <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-white/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/50 shadow-sm cursor-help">
         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
           <circle cx="12" cy="12" r="10"/>
           <path d="M8 12h8"/>
           <path d="M12 8v8"/>
         </svg>
         <span>{t('globe.zoom')}</span>
       </div>
    </div>
  );
};

export default React.memo(GlobeHint);
