import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import CountryChart from '../CountryChart';
import { useLanguage } from '../../context/LanguageContext';

const CountryDetailsOverlay = ({ selectedCountry, selectedCountryName, displayCountry, onClose, year, emissions }) => {
  const { t } = useLanguage();

  // Close overlay on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedCountry) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCountry, onClose]);

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="overlay-title"
      className={`absolute bottom-0 left-0 right-0 top-0 bg-white/80 backdrop-blur-xl border-t border-white/50 shadow-2xl transition-all duration-500 ease-in-out overflow-hidden flex flex-col ${selectedCountry ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-[110%] opacity-0 pointer-events-none invisible'}`}
    >
        <div className="flex justify-between items-start gap-4 p-6 shrink-0">
            <h2 id="overlay-title" className="text-2xl font-bold text-slate-800 flex items-center gap-4 flex-1 min-w-0">
                <span className="w-1.5 h-8 bg-blue-500 rounded-full shrink-0 shadow-sm"></span>
                <span className="truncate">{selectedCountryName || displayCountry}</span>
            </h2>
            <button 
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white text-slate-500 hover:text-slate-800 border border-slate-200/50 rounded-xl transition-all font-semibold shrink-0 whitespace-nowrap text-sm shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none"
                aria-label={t('aria.closeOverlay')}
            >
                <span>✕</span>
                <span>{t('close')}</span>
            </button>
        </div>
        <div className="flex-1 px-6 pb-6 overflow-auto">
            <CountryChart 
                countryCode={displayCountry} 
                year={year} 
                emissionsData={emissions}
            />
        </div>
    </div>
  );
};

CountryDetailsOverlay.propTypes = {
  selectedCountry: PropTypes.string,
  selectedCountryName: PropTypes.string,
  displayCountry: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  emissions: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default CountryDetailsOverlay;
