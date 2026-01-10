import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * GlobePaths - Renders the static SVG paths for the countries.
 *
 * Performance Note:
 * This component is extracted from Globe.jsx to prevent unnecessary React reconciliation
 * of ~200 path elements on every animation frame (200ms). By using React.memo,
 * this component only re-renders when the GeoJSON data or event handlers change,
 * bypassing the virtual DOM diffing process completely during the timeline animation loop.
 */
const GlobePaths = ({
  geoJson,
  onPathClick,
  onPathKeyDown,
  onPathFocus,
  onPathBlur
}) => {
  return useMemo(() => {
    if (!geoJson) return null;

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
                onClick={onPathClick}
                onKeyDown={onPathKeyDown}
                onFocus={onPathFocus}
                onBlur={onPathBlur}
                onMouseEnter={onPathFocus}
                onMouseLeave={onPathFocus} // Preserving existing behavior from Globe.jsx
            >
            </path>
        );
    });
  }, [geoJson, onPathClick, onPathKeyDown, onPathFocus, onPathBlur]);
};

GlobePaths.propTypes = {
    geoJson: PropTypes.object,
    onPathClick: PropTypes.func.isRequired,
    onPathKeyDown: PropTypes.func.isRequired,
    onPathFocus: PropTypes.func.isRequired,
    onPathBlur: PropTypes.func.isRequired
};

export default React.memo(GlobePaths);
