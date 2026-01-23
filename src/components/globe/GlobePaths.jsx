import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const GlobePaths = ({ geoJson, onCountrySelect, onHover, onLeave }) => {
  // Optimization: Render static paths once.
  // Dependencies reduced to just geoJson because handlers are delegated.
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

  const handleClick = (e) => {
     const target = e.target.closest('[data-id]');
     if (target) {
         e.stopPropagation();
         onCountrySelect(target.getAttribute('data-id'));
     }
  };

  const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
          const target = e.target.closest('[data-id]');
          if (target) {
              e.preventDefault();
              onCountrySelect(target.getAttribute('data-id'));
          }
      }
  };

  const handleHover = (e) => {
       const target = e.target.closest('[data-id]');
       if (target) {
           onHover(target.getAttribute('data-id'), target.getAttribute('data-name'));
       }
  };

  const handleLeave = (e) => {
       const target = e.target.closest('[data-id]');
       if (target) {
           onLeave();
       }
  };

  return (
    <g
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseOver={handleHover}
      onMouseOut={handleLeave}
      onFocus={handleHover}
      onBlur={handleLeave}
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
