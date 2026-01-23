import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '../../context/LanguageContext';

const Timeline = ({ year, setYear, yearRange }) => {
  const { t } = useLanguage();

  // Optimization: Local state for slider to allow immediate UI feedback while debouncing the heavy global update
  const [localYear, setLocalYear] = useState(year || yearRange.min);
  const debounceTimerRef = useRef(null);

  // Sync local state when external year prop changes (e.g. animation)
  useEffect(() => {
    setLocalYear(year);
  }, [year]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleYearChange = useCallback((e) => {
    const val = parseInt(e.target.value, 10);
    setLocalYear(val);

    // Debounce the global state update to prevent excessive re-renders of heavy charts
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      setYear(val);
    }, 50); // 50ms debounce is enough to catch drag events but feel responsive
  }, [setYear]);

  return (
      <div className="px-1 group">
        <input
          type="range"
          min={yearRange.min}
          max={yearRange.max}
          step="1"
          value={localYear || yearRange.min}
          disabled={!year}
          onChange={handleYearChange}
          aria-label={t('aria.selectYear')}
          aria-valuetext={`${t('aria.yearLabel')} ${localYear || yearRange.min}`}
          aria-keyshortcuts="ArrowLeft ArrowRight"
          title={`${t('aria.selectYear')} (←/→)`}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex justify-between items-center text-xs font-mono text-slate-600 mt-2">
          <span>{yearRange.min}</span>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 transition-all duration-200 opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110 group-focus-within:opacity-100 group-focus-within:grayscale-0 group-focus-within:scale-110">
            {localYear || yearRange.min}
          </span>
          <span>{yearRange.max}</span>
        </div>
      </div>
  );
};

Timeline.propTypes = {
  year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  setYear: PropTypes.func.isRequired,
  yearRange: PropTypes.shape({
    min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

export default React.memo(Timeline);
