import React, { useMemo } from 'react';
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
                className="country-path transition-colors duration-300 hover:opacity-80 cursor-pointer outline-none focus:outline-none focus:opacity-100 focus:stroke-white focus:stroke-[1.5px]"
                role="button"
                tabIndex="0"
                aria-label={feature.properties.NAME || countryId}
                data-id={countryId}
                data-name={feature.properties.NAME}
                onClick={(e) => {
                  e.stopPropagation();
                  onCountrySelect(countryId);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onCountrySelect(countryId);
                  }
                }}
                onFocus={() => onHover(countryId, feature.properties.NAME)}
                onBlur={onLeave}
                onMouseEnter={() => onHover(countryId, feature.properties.NAME)}
                onMouseLeave={onLeave}
            />
        );
    });
  }, [geoJson, onCountrySelect, onHover, onLeave]);

  return <g>{paths}</g>;
};

GlobePaths.propTypes = {
  geoJson: PropTypes.object,
  onCountrySelect: PropTypes.func.isRequired,
  onHover: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired,
};

export default React.memo(GlobePaths);
