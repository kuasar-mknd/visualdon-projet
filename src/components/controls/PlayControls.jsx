import React from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '../../context/LanguageContext';

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const PlayControls = ({ isPlaying, setIsPlaying, category, setCategory }) => {
  const { t } = useLanguage();

  return (
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? t('aria.pause') : t('aria.play')}
          aria-keyshortcuts="Space"
          title={`${isPlaying ? t('pause') : t('play')} (Space)`}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold tracking-wide transition-all duration-300 shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none flex items-center justify-center gap-2 cursor-pointer ${
            isPlaying
              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
              : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
          }`}
        >
          {isPlaying ? (
            <>
              <PauseIcon />
              {t('pause')}
            </>
          ) : (
            <>
              <PlayIcon />
              {t('play')}
            </>
          )}
        </button>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label={t('aria.selectCategory')}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none text-slate-700 font-medium shadow-sm cursor-pointer hover:border-blue-300 transition-colors text-sm"
        >
          <option value="Total">{t('total')}</option>
          <option value="Per Capita">{t('perCapita')}</option>
        </select>
      </div>
  );
};

PlayControls.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  setIsPlaying: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
  setCategory: PropTypes.func.isRequired,
};

export default React.memo(PlayControls);
