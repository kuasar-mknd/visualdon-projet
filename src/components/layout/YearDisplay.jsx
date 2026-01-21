import React from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '../../context/LanguageContext';

const YearDisplay = ({ year }) => {
    const { t } = useLanguage();
    return (
        <div
            className="text-right bg-white/50 px-4 py-1.5 rounded-xl border border-slate-100 shadow-sm"
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            <div className="text-3xl font-mono font-bold text-blue-600 leading-none tabular-nums">{year || '...'}</div>
            <div className="text-xs text-slate-600 uppercase tracking-widest font-semibold leading-none">{t('year')}</div>
        </div>
    );
};

YearDisplay.propTypes = {
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default React.memo(YearDisplay);
