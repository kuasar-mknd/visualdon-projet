import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import PlayControls from './PlayControls';
import Timeline from './Timeline';
import { isValidYear } from '../../utils/security';

const Controls = ({ isPlaying, setIsPlaying, category, setCategory, year, setYear, yearRange }) => {

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is interacting with an input, select, or textarea
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
        return;
      }

      // Ignore if a modal/dialog is open (e.g. CountryDetailsOverlay)
      if (document.querySelector('[role="dialog"]')) {
        return;
      }

      switch (e.code) {
        case 'Space':
          // Prevent default scroll behavior, but only if not on a button (native behavior)
          if (e.target.tagName !== 'BUTTON') {
            e.preventDefault();
            setIsPlaying(prev => !prev);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setYear(prev => {
             const current = prev || yearRange.min;
             const next = Math.max(yearRange.min, current - 1);
             return isValidYear(next) ? next : current;
          });
          break;
        case 'ArrowRight':
          e.preventDefault();
          setYear(prev => {
             const current = prev || yearRange.min;
             const next = Math.min(yearRange.max, current + 1);
             return isValidYear(next) ? next : current;
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsPlaying, setYear, yearRange]);

  return (
    <div className="glass-panel-light p-4 rounded-2xl shrink-0">
      <PlayControls
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        category={category}
        setCategory={setCategory}
      />

      <Timeline
        year={year}
        setYear={setYear}
        yearRange={yearRange}
      />
    </div>
  );
};

Controls.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  setIsPlaying: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
  setCategory: PropTypes.func.isRequired,
  year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  setYear: PropTypes.func.isRequired,
  yearRange: PropTypes.shape({
    min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

// Optimization: Memoize to prevent re-renders when parent re-renders but props are same.
export default React.memo(Controls);
