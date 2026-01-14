import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

const GlobePaths = ({ geoJson, onCountrySelect, onHover, onLeave }) => {
  // Optimization: Event delegation handlers to reduce closure creation per path (200+ closures -> 4)
  const handleClick = useCallback((e) => {
    const target = e.target.closest('path.country-path');
    if (target && target.dataset.id) {
        e.stopPropagation();
        onCountrySelect(target.dataset.id);
    }
  }, [onCountrySelect]);

  const handleKeyDown = useCallback((e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const target = e.target.closest('path.country-path');
    if (target && target.dataset.id) {
        e.preventDefault();
        onCountrySelect(target.dataset.id);
    }
  }, [onCountrySelect]);

  const handleOver = useCallback((e) => {
     const target = e.target.closest('path.country-path');
     if (target && target.dataset.id) {
         onHover(target.dataset.id, target.dataset.name);
     }
  }, [onHover]);

  const handleOut = useCallback(() => {
      // When moving between paths, this fires for the leaving path
      onLeave();
  }, [onLeave]);

  // Optimization: Render static paths once.
  // Dependencies reduced: paths only update when geoJson changes, not when handlers change.
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

  return (
    <g
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseOver={handleOver}
        onMouseOut={handleOut}
        onFocus={handleOver}
        onBlur={handleOut}
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
