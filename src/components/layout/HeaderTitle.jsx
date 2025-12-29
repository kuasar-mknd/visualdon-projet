import React, { memo } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const HeaderTitle = () => {
  const { t } = useLanguage();
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
        {t('title')}
      </h1>
      <p className="text-slate-500 mt-0.5 text-sm font-normal">{t('subtitle')}</p>
    </div>
  );
};

export default memo(HeaderTitle);
