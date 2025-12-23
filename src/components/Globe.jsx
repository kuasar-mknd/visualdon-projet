import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { useLanguage } from '../context/LanguageContext';
import { fetchCountryDetails } from '../services/countryService';
import GlobeLegend from './globe/GlobeLegend';
import GlobeTooltip from './globe/GlobeTooltip';

// Create a custom interpolator for better visibility and meaning
// Low emissions: Blue/Green, Medium: Yellow/Orange, High: Red
const customInterpolator = t => {
  if (t < 0.33) {
    // Blue to Green (0 to 0.33)
    return d3.interpolateRgb("#3b82f6", "#10b981")(t * 3);
  } else if (t < 0.66) {
    // Green to Yellow (0.33 to 0.66)
    return d3.interpolateRgb("#10b981", "#fbbf24")((t - 0.33) * 3);
  } else {
    // Yellow to Orange to Red (0.66 to 1)
    return d3.interpolateRgb("#fbbf24", "#ef4444")((t - 0.66) * 3);
  }
};

const Globe = ({ data, geoJson, category, maxVal, onCountrySelect }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [rotation, setRotation] = useState([0, 0]);
  const [scale, setScale] = useState(250); // Initial scale
  const [hoveredCountryName, setHoveredCountryName] = useState(null);
  const [hoveredCountryId, setHoveredCountryId] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const { language } = useLanguage();

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width);
        setHeight(entry.contentRect.height);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Projection
  const projection = useMemo(() => {
    return d3.geoOrthographic()
      .scale(scale)
      .translate([width / 2, height / 2])
      .rotate(rotation);
  }, [width, height, rotation, scale]);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  // Optimization: Memoize path strings to avoid re-calculating d3.geoPath (expensive)
  // when only data changes (e.g. during animation), but rotation/zoom (projection) is constant.
  // This separates geometry calculation from styling.
  const pathStrings = useMemo(() => {
    if (!geoJson || !pathGenerator) return [];
    return geoJson.features.map(feature => pathGenerator(feature));
  }, [geoJson, pathGenerator]);

  // Color scale - from light (low emissions) to red (high emissions)
  const colorScale = useMemo(() => {
    // Optimization: Use passed maxVal instead of recalculating max from data every render
    // This improves performance (O(1)) and ensures a stable color scale across years
    const max = maxVal || 100;
    
    // Use log scale for better distribution
    return d3.scaleSequentialLog(customInterpolator)
        .domain([0.1, max])
        .clamp(true);
  }, [maxVal]);

  // Drag & Zoom handling
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    // Zoom behavior - works with mouse wheel AND touch pinch
    const zoom = d3.zoom()
      .scaleExtent([1, 5]) // Relative scale extent
      .filter((event) => {
        // Allow zoom on wheel events (desktop)
        if (event.type === 'wheel') return true;
        // Allow zoom on touch events with 2+ fingers (mobile pinch)
        if (event.type.startsWith('touch') && event.touches && event.touches.length >= 2) return true;
        // Block zoom on single touch (to allow drag rotation)
        return false;
      })
      .on("zoom", (event) => {
         // Only update scale if it's a zoom event (not a drag)
         if (event.sourceEvent && (event.sourceEvent.type === 'wheel' || 
             (event.sourceEvent.touches && event.sourceEvent.touches.length >= 2))) {
           setScale(event.transform.k * 250);
         }
      });
    
    // Drag behavior - works with mouse and single-finger touch
    const drag = d3.drag()
      .filter((event) => {
        // Allow drag on mouse events
        if (event.type.startsWith('mouse')) return true;
        // Allow drag on single-touch events
        if (event.type.startsWith('touch') && (!event.touches || event.touches.length === 1)) return true;
        return false;
      })
      .on("start", () => svg.style("cursor", "grabbing"))
      .on("drag", (event) => {
        setRotation(curr => {
            const sensitivity = 0.25;
            return [curr[0] + event.dx * sensitivity, curr[1] - event.dy * sensitivity];
        });
      })
      .on("end", () => svg.style("cursor", "grab"));
      
    // Initialize zoom transform to match current scale
    svg.call(zoom.transform, d3.zoomIdentity.scale(scale / 250));

    // Apply behaviors
    svg.call(drag);
    svg.call(zoom);
    
    // Disable double click zoom to prevent conflict
    svg.on("dblclick.zoom", null);

  }, [width, height]);  


  // Optimize data lookup
  const dataMap = useMemo(() => {
    if (!data) return new Map();
    const map = new Map();
    data.forEach(d => {
        // data is already filtered by year in App.jsx
        map.set(d["ISO 3166-1 alpha-3"], d);
    });
    return map;
  }, [data]);

  // Create a map of features by ID for quick highlight lookup
  const featureMap = useMemo(() => {
      if (!geoJson) return new Map();
      const map = new Map();
      geoJson.features.forEach(f => {
          map.set(f.properties.A3 || f.id, f);
      });
      return map;
  }, [geoJson]);

  // Derived hovered value
  const hoveredValue = useMemo(() => {
      if (!hoveredCountryId) return null;
      const countryData = dataMap.get(hoveredCountryId);
      return countryData ? parseFloat(countryData[category]) : null;
  }, [hoveredCountryId, dataMap, category]);

  // Handle mouse enter with debounce for API calls
  const handleMouseEnter = useCallback((countryId, featureName) => {
      setHoveredCountryId(countryId);

      // Clear any pending fetch
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

      // Debounce the expensive fetch/update
      hoverTimeoutRef.current = setTimeout(async () => {
          const name = await fetchCountryDetails(countryId, language);
          setHoveredCountryName(name || featureName);
      }, 150); // 150ms debounce
  }, [language]);

  const handleMouseLeave = useCallback(() => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setHoveredCountryName(null);
      setHoveredCountryId(null);
  }, []);

  // Optimization: Pre-calculate colors to separate style from geometry.
  // This ensures that when dragging/zooming (changing pathStrings), we don't re-calculate
  // lookups and color scales (O(N) operations).
  const colors = useMemo(() => {
    if (!geoJson || !dataMap) return [];
    return geoJson.features.map(feature => {
        const countryId = feature.properties.A3 || feature.id;
        const countryData = dataMap.get(countryId);
        // dataMap values are already typed by d3.autoType (numbers or null)
        const value = countryData ? countryData[category] : 0;
        return (value > 0) ? colorScale(value) : '#475569';
    });
  }, [geoJson, dataMap, category, colorScale]);

  // Base paths - Does NOT depend on hoveredCountryId anymore
  // This ensures the main globe doesn't re-render 200 paths when one is hovered
  const paths = useMemo(() => {
    if (!geoJson || !pathStrings.length) return [];
    return geoJson.features.map((feature, i) => {
        const countryId = feature.properties.A3 || feature.id;
        return (
            <path
                key={countryId || i}
                d={pathStrings[i]}
                fill={colors[i]}
                stroke="#0f172a" // Fixed stroke for base layer
                strokeWidth="0.5"
                className="transition-colors duration-300 hover:opacity-80 cursor-pointer focus:outline-none"
                role="button"
                tabIndex="0"
                aria-label={feature.properties.NAME || countryId}
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
                onFocus={() => handleMouseEnter(countryId, feature.properties.NAME)}
                onBlur={handleMouseLeave}
                onMouseEnter={() => handleMouseEnter(countryId, feature.properties.NAME)}
                onMouseLeave={handleMouseLeave}
            >
            </path>
        );
    });
  }, [geoJson, pathStrings, colors, onCountrySelect, handleMouseEnter, handleMouseLeave]);

  // Separate Highlight Path
  const highlightPath = useMemo(() => {
      if (!hoveredCountryId || !pathGenerator) return null;
      const feature = featureMap.get(hoveredCountryId);
      if (!feature) return null;

      const d = pathGenerator(feature);
      if (!d) return null;

      return (
          <path
              d={d}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              filter="url(#highlight-glow)"
              className="pointer-events-none" // Let events pass through to base path
          />
      );
  }, [hoveredCountryId, pathGenerator, featureMap]);

  if (!data || !geoJson || !width) return <div ref={containerRef} className="w-full h-full bg-slate-100" />;

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-50 overflow-hidden cursor-grab active:cursor-grabbing">
       <svg ref={svgRef} width={width} height={height} style={{background: 'radial-gradient(circle at 50% 50%, #f8fafc 0%, #e2e8f0 100%)'}}>
          <defs>
            {/* Ocean Gradient - gives depth to the water */}
            <radialGradient id="oceanGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#dbeafe" stopOpacity="1" />
                <stop offset="100%" stopColor="#bfdbfe" stopOpacity="1" />
            </radialGradient>
            
            {/* Atmosphere Glow - outer glow */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>

            {/* Highlight Glow - makes focused country pop against any background */}
            <filter id="highlight-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="white" floodOpacity="0.8"/>
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="black" floodOpacity="0.4"/>
            </filter>

            {/* Sphere Shading - inner shadow to make it look round */}
            <radialGradient id="sphereShadow" cx="50%" cy="50%" r="50%">
                <stop offset="80%" stopColor="#000000" stopOpacity="0" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
            </radialGradient>
          </defs>

          <g>
            {/* 1. Ocean Sphere */}
            <path 
                d={pathGenerator({type: "Sphere"})} 
                fill="url(#oceanGradient)" 
                stroke="none"
            />

            {/* 2. Atmosphere / Glow Effect (behind the globe) */}
            <circle cx={width/2} cy={height/2} r={projection.scale()} fill="#60a5fa" opacity="0.1" filter="url(#glow)" />

            {/* 3. Landmasses */}
            {paths}

            {/* 3.5 Highlight Overlay */}
            {highlightPath}

            {/* 4. Shading Overlay (on top of land) */}
            <path 
                d={pathGenerator({type: "Sphere"})} 
                fill="url(#sphereShadow)" 
                style={{pointerEvents: 'none'}} 
            />
          </g>
       </svg>
       
       <GlobeTooltip
          countryName={hoveredCountryName}
          value={hoveredValue}
          category={category}
       />

     <GlobeLegend />
  </div>
  );
};

Globe.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    "ISO 3166-1 alpha-3": PropTypes.string,
  })).isRequired,
  geoJson: PropTypes.shape({
    type: PropTypes.string,
    features: PropTypes.arrayOf(PropTypes.object)
  }),
  category: PropTypes.string.isRequired,
  maxVal: PropTypes.number,
  onCountrySelect: PropTypes.func.isRequired,
};

export default React.memo(Globe);
