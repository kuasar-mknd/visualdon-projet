import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import CountryChart from '../CountryChart';
import { useLanguage } from '../../context/LanguageContext';
import { sanitizeString } from '../../utils/security';

const CountryDetailsOverlay = ({ selectedCountry, selectedCountryName, displayCountry, onClose, countryData }) => {
  const { t } = useLanguage();

  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Focus management
  useEffect(() => {
    let timer;
    if (selectedCountry) {
      // Store current focus
      previousFocusRef.current = document.activeElement;

      // Move focus to close button
      // Use setTimeout to ensure visibility transition has started (removing 'invisible' class)
      // otherwise focus() might fail on a hidden element.
      timer = setTimeout(() => {
          closeButtonRef.current?.focus();
      }, 100);
    } else {
      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
    return () => clearTimeout(timer);
  }, [selectedCountry]);

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
      aria-describedby="overlay-description"
      className={`absolute bottom-0 left-0 right-0 top-0 bg-white/80 backdrop-blur-xl border-t border-white/50 shadow-2xl transition-all duration-500 ease-in-out overflow-hidden flex flex-col will-change-[transform,opacity] ${selectedCountry ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-[110%] opacity-0 pointer-events-none invisible'}`}
    >
        {/* Hidden description for screen readers */}
        <p id="overlay-description" className="sr-only">
          {t('aria.overlayDescription') || 'Detailed emissions data for the selected country.'}
        </p>
        <div className="flex justify-between items-start gap-4 p-6 shrink-0">
            <h2 id="overlay-title" className="text-2xl font-bold text-slate-800 flex items-center gap-4 flex-1 min-w-0">
                <span className="w-1.5 h-8 bg-blue-500 rounded-full shrink-0 shadow-sm" aria-hidden="true"></span>
                <span className="truncate">{sanitizeString(selectedCountryName) || displayCountry}</span>
            </h2>
            <button 
                ref={closeButtonRef}
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white text-slate-600 hover:text-slate-800 border border-slate-200/50 rounded-xl transition-all font-semibold shrink-0 whitespace-nowrap text-sm shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none cursor-pointer"
                aria-label={t('aria.closeOverlay')}
            >
                <span aria-hidden="true">✕</span>
                <span>{t('close')}</span>
            </button>
        </div>
        <div className="flex-1 px-6 pb-6 overflow-auto">
            <CountryChart 
                countryCode={displayCountry} 
                data={countryData}
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
  countryData: PropTypes.arrayOf(PropTypes.object).isRequired,
};

// Optimization: Memoize to prevent re-renders when parent re-renders (animation loop)
// especially since this component is often hidden but still in the DOM tree.
export default React.memo(CountryDetailsOverlay);
