import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

const GlobePaths = ({ geoJson, onCountrySelect, onHover, onLeave }) => {

  const handleInteraction = useCallback((e, type) => {
    // Optimization: Event delegation
    const target = e.target.closest('path');
    if (!target) return;

    const countryId = target.getAttribute('data-id');
    const name = target.getAttribute('data-name');

    if (!countryId) return;

    switch (type) {
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
        case 'enter':
        case 'focus':
            onHover(countryId, name);
            break;
        case 'leave':
        case 'blur':
            onLeave();
            break;
        default:
            break;
    }
  }, [onCountrySelect, onHover, onLeave]);

  // Optimization: Render static paths once.
  // We removed individual event listeners, so this useMemo now only depends on geoJson.
  // This significantly reduces re-renders and memory usage (no closure creation per path).
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
            />
        );
    });
  }, [geoJson]);

  return (
    <g
        onClick={(e) => handleInteraction(e, 'click')}
        onKeyDown={(e) => handleInteraction(e, 'keydown')}
        onMouseOver={(e) => handleInteraction(e, 'enter')}
        onMouseOut={(e) => handleInteraction(e, 'leave')}
        onFocus={(e) => handleInteraction(e, 'focus')}
        onBlur={(e) => handleInteraction(e, 'blur')}
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
