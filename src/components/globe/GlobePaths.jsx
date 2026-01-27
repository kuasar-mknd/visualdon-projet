import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const GlobePaths = ({ geoJson, onCountrySelect, onHover, onLeave }) => {
  // Optimization: Render static paths once.
  // Removed event handlers from dependency array as they are now handled via delegation
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

  const handleInteraction = (e, type) => {
      const target = e.target.closest('path[data-id]');
      if (!target) return;

      const { id, name } = target.dataset;

      if (type === 'click') {
          e.stopPropagation();
          onCountrySelect(id);
      } else if (type === 'hover') {
          onHover(id, name);
      }
  };

  return (
      <g
        onClick={(e) => handleInteraction(e, 'click')}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleInteraction(e, 'click');
            }
        }}
        onMouseOver={(e) => handleInteraction(e, 'hover')}
        onFocus={(e) => handleInteraction(e, 'hover')}
        onMouseOut={onLeave}
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
