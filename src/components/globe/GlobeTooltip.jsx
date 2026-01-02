import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '../../context/LanguageContext';

const GlobeTooltip = ({ countryName, value, category }) => {
  const { t } = useLanguage();

  if (!countryName) return null;

  return (
    <div className="absolute top-4 right-4 bg-white/90 text-slate-800 px-4 py-3 rounded-xl border border-slate-200 shadow-xl pointer-events-none backdrop-blur-md min-w-[200px] z-10">
      <div className="font-bold text-lg mb-1 text-blue-600">
        {countryName}
      </div>
      {value !== null ? (
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-mono font-bold text-slate-800">{value.toFixed(2)}</span>
          <span className="text-sm text-slate-500">
            {category === 'Per Capita' ? 'tCO₂/hab' : 'MtCO₂'}
          </span>
        </div>
      ) : (
        <div className="text-sm text-slate-500 italic">{t('noData')}</div>
      )}
    </div>
  );
};

GlobeTooltip.propTypes = {
  countryName: PropTypes.string,
  value: PropTypes.number,
  category: PropTypes.string.isRequired,
};

export default memo(GlobeTooltip);
