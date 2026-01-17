import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

const GlobePaths = ({ geoJson, onCountrySelect, onHover, onLeave }) => {

  const handleInteraction = useCallback((e) => {
    // console.log('Interaction:', e.type, e.target.tagName); // Debug

    const target = e.target.closest('path.country-path');
    if (!target) return;

    const countryId = target.getAttribute('data-id');
    const countryName = target.getAttribute('data-name');

    if (!countryId) return;

    switch(e.type) {
        case 'click':
            e.stopPropagation();
            onCountrySelect(countryId);
            break;
        case 'keydown':
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCountrySelect(countryId);
            }
            break;
        case 'focus':
             onHover(countryId, countryName);
             break;
        case 'mouseover':
             onHover(countryId, countryName);
             break;
        case 'blur':
             onLeave();
             break;
        case 'mouseout':
             onLeave();
             break;
    }
  }, [onCountrySelect, onHover, onLeave]);

  // Optimization: Render static paths once.
  // Event listeners are delegated to the parent group, removing ~200 listeners per event type
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
        onClick={handleInteraction}
        onKeyDown={handleInteraction}
        onFocus={handleInteraction}
        onBlur={handleInteraction}
        onMouseOver={handleInteraction}
        onMouseOut={handleInteraction}
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
