import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const GlobeLegend = () => {
    const { t } = useLanguage();

    return (
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-4 text-slate-600 text-xs shadow-lg" role="region" aria-label={t('emissionsLabel')}>
             <div className="font-semibold mb-3 text-sm text-slate-700">{t('emissionsLabel')}</div>
             <div className="space-y-2" role="list">
                 <div className="flex items-center gap-3" role="listitem">
                     <div className="w-3 h-3 rounded-full" style={{background: '#3b82f6'}} aria-hidden="true"></div>
                     <span className="text-slate-600">{t('legend.low')}</span>
                 </div>
                 <div className="flex items-center gap-3" role="listitem">
                     <div className="w-3 h-3 rounded-full" style={{background: '#10b981'}} aria-hidden="true"></div>
                     <span className="text-slate-600">{t('legend.moderate')}</span>
                 </div>
                 <div className="flex items-center gap-3" role="listitem">
                     <div className="w-3 h-3 rounded-full" style={{background: '#fbbf24'}} aria-hidden="true"></div>
                     <span className="text-slate-600">{t('legend.medium')}</span>
                 </div>
                 <div className="flex items-center gap-3" role="listitem">
                     <div className="w-3 h-3 rounded-full" style={{background: '#ef4444'}} aria-hidden="true"></div>
                     <span className="text-slate-600">{t('legend.high')}</span>
                 </div>
                 <div className="flex items-center gap-3 pt-1 border-t border-slate-200 mt-1" role="listitem">
                     <div className="w-3 h-3 rounded-full bg-slate-300" aria-hidden="true"></div>
                     <span className="text-slate-400">{t('noData')}</span>
                 </div>
             </div>
         </div>
    );
};

export default GlobeLegend;
