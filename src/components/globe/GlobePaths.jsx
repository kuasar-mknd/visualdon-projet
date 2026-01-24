import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

const GlobePaths = ({ geoJson, onCountrySelect, onHover, onLeave }) => {
  // Optimization: Render static paths once.
  const paths = useMemo(() => {
    if (!geoJson) return [];

    return geoJson.features.map((feature, i) => {
        const countryId = feature.properties.A3 || feature.id;
        return (
            <path
                key={countryId || i}
                stroke="#0f172a"
                strokeWidth="0.5"
                className="country-path transition-colors duration-300 hover:opacity-80 cursor-pointer focus:outline-none focus:opacity-100 focus:stroke-white focus:stroke-[1.5px]"
                role="button"
                tabIndex="0"
                aria-label={feature.properties.NAME || countryId}
                data-id={countryId}
                data-name={feature.properties.NAME}
            />
        );
    });
  }, [geoJson]);

  // Optimization: Event Delegation
  // Attach listeners to the parent group instead of individual paths to reduce memory overhead.
  const handleClick = useCallback((e) => {
      const target = e.target.closest('[data-id]');
      if (target) {
          e.stopPropagation();
          onCountrySelect(target.dataset.id);
      }
  }, [onCountrySelect]);

  const handleKeyDown = useCallback((e) => {
      const target = e.target.closest('[data-id]');
      if (target && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onCountrySelect(target.dataset.id);
      }
  }, [onCountrySelect]);

  const handleMouseOver = useCallback((e) => {
      const target = e.target.closest('[data-id]');
      if (target) {
          onHover(target.dataset.id, target.dataset.name);
      }
  }, [onHover]);

  const handleMouseOut = useCallback((e) => {
      const target = e.target.closest('[data-id]');
      if (target) {
          onLeave();
      }
  }, [onLeave]);

  const handleFocus = useCallback((e) => {
       const target = e.target.closest('[data-id]');
       if (target) {
           onHover(target.dataset.id, target.dataset.name);
       }
  }, [onHover]);

  return (
      <g
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onFocus={handleFocus}
        onBlur={onLeave}
      >
        {paths}
      </g>
  );
};

GlobePaths.propTypes = {
  geoJson: PropTypes.object,
  onCountrySelect: PropTypes.func.isRequired,
  onHover: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired,
};

export default React.memo(GlobePaths);
