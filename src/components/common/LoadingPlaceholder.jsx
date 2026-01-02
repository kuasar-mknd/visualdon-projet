import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const LoadingPlaceholder = () => {
  const { t } = useLanguage();
  return (
    <div className='flex items-center justify-center w-full h-full text-slate-400'>
      <div className='animate-pulse'>{t('loading')}...</div>
    </div>
  );
};
