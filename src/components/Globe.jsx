import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { useLanguage } from '../context/LanguageContext';
import { fetchCountryDetails } from '../services/countryService';
import GlobeLegend from './globe/GlobeLegend';
import GlobeTooltip from './globe/GlobeTooltip';

// Create a custom interpolator for better visibility and meaning
const customInterpolator = t => {
  if (t < 0.33) {
    return d3.interpolateRgb("#3b82f6", "#10b981")(t * 3);
  } else if (t < 0.66) {
    return d3.interpolateRgb("#10b981", "#fbbf24")((t - 0.33) * 3);
  } else {
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

  const colorScale = useMemo(() => {
    const max = maxVal || 100;
    return d3.scaleSequentialLog(customInterpolator)
        .domain([0.1, max])
        .clamp(true);
  }, [maxVal]);

  // Drag & Zoom handling
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    const zoom = d3.zoom()
      .scaleExtent([1, 5])
      .filter((event) => {
        if (event.type === 'wheel') return true;
        if (event.type.startsWith('touch') && event.touches && event.touches.length >= 2) return true;
        return false;
      })
      .on("zoom", (event) => {
         if (event.sourceEvent && (event.sourceEvent.type === 'wheel' || 
             (event.sourceEvent.touches && event.sourceEvent.touches.length >= 2))) {
           setScale(event.transform.k * 250);
         }
      });
    
    const drag = d3.drag()
      .filter((event) => {
        if (event.type.startsWith('mouse')) return true;
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
      
    svg.call(zoom.transform, d3.zoomIdentity.scale(scale / 250));
    svg.call(drag);
    svg.call(zoom);
    svg.on("dblclick.zoom", null);

  }, [width, height]);  

  const dataMap = useMemo(() => {
    if (!data) return new Map();
    // Optimization: If data is already a Map (pre-indexed in App), use it directly.
    // This avoids rebuilding the map every frame during animation (O(N) -> O(1)).
    if (data instanceof Map) return data;

    const map = new Map();
    data.forEach(d => {
        map.set(d["ISO 3166-1 alpha-3"], d);
    });
    return map;
  }, [data]);

  const featureMap = useMemo(() => {
      if (!geoJson) return new Map();
      const map = new Map();
      geoJson.features.forEach(f => {
          map.set(f.properties.A3 || f.id, f);
      });
      return map;
  }, [geoJson]);

  const hoveredValue = useMemo(() => {
      if (!hoveredCountryId) return null;
      const countryData = dataMap.get(hoveredCountryId);
      return countryData ? (countryData[category] || 0) : null;
  }, [hoveredCountryId, dataMap, category]);

  const handleMouseEnter = useCallback((countryId, featureName) => {
      setHoveredCountryId(countryId);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(async () => {
          const name = await fetchCountryDetails(countryId, language);
          setHoveredCountryName(name || featureName);
      }, 150);
  }, [language]);

  const handleMouseLeave = useCallback(() => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setHoveredCountryName(null);
      setHoveredCountryId(null);
  }, []);

  // Optimization: Event handlers for paths are now stable using data attributes
  const handlePathFocus = useCallback((e) => {
    const { id, name } = e.currentTarget.dataset;
    handleMouseEnter(id, name);
  }, [handleMouseEnter]);

  const handlePathClick = useCallback((e) => {
    e.stopPropagation();
    const { id } = e.currentTarget.dataset;
    onCountrySelect(id);
  }, [onCountrySelect]);

  const handlePathKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const { id } = e.currentTarget.dataset;
        onCountrySelect(id);
    }
  }, [onCountrySelect]);

  // Optimization: Render static paths once. Attributes 'd' and 'fill' are updated via D3 effects.
  // This avoids O(N) React diffing and DOM operations on every frame during drag or animation.
  const paths = useMemo(() => {
    if (!geoJson) return [];
    return geoJson.features.map((feature, i) => {
        const countryId = feature.properties.A3 || feature.id;
        return (
            <path
                key={countryId || i}
                // Initial empty attributes; populated by D3 effects
                stroke="#0f172a"
                strokeWidth="0.5"
                className="country-path transition-colors duration-300 hover:opacity-80 cursor-pointer focus:outline-none focus:opacity-100 focus:stroke-white focus:stroke-[1.5px]"
                role="button"
                tabIndex="0"
                aria-label={feature.properties.NAME || countryId}
                data-id={countryId}
                data-name={feature.properties.NAME}
                onClick={handlePathClick}
                onKeyDown={handlePathKeyDown}
                onFocus={handlePathFocus}
                onBlur={handleMouseLeave}
                onMouseEnter={handlePathFocus}
                onMouseLeave={handleMouseLeave}
            >
            </path>
        );
    });
  }, [geoJson, handlePathClick, handlePathKeyDown, handlePathFocus, handleMouseLeave]);

  // Effect: Update 'd' attribute (Rotation/Zoom) directly via D3
  // Bypasses React render cycle for high-frequency updates
  useEffect(() => {
      if (!geoJson || !pathGenerator || !svgRef.current) return;
      d3.select(svgRef.current)
        .selectAll("path.country-path")
        .data(geoJson.features)
        .attr("d", pathGenerator);
  }, [geoJson, pathGenerator]);

  // Effect: Update 'fill' attribute (Data/Animation) directly via D3
  // Bypasses React render cycle for high-frequency updates
  useEffect(() => {
      if (!geoJson || !dataMap || !svgRef.current) return;

      d3.select(svgRef.current)
        .selectAll("path.country-path")
        .data(geoJson.features)
        .attr("fill", d => {
            const countryId = d.properties.A3 || d.id;
            const countryData = dataMap.get(countryId);
            const value = countryData ? countryData[category] : 0;
            return (value > 0) ? colorScale(value) : '#475569';
        });
  }, [geoJson, dataMap, category, colorScale]);

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
              className="pointer-events-none"
          />
      );
  }, [hoveredCountryId, pathGenerator, featureMap]);

  if (!data || !geoJson || !width) return <div ref={containerRef} className="w-full h-full bg-slate-100" />;

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-50 overflow-hidden cursor-grab active:cursor-grabbing">
       <svg ref={svgRef} width={width} height={height} style={{background: 'radial-gradient(circle at 50% 50%, #f8fafc 0%, #e2e8f0 100%)'}}>
          <defs>
            <radialGradient id="oceanGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#dbeafe" stopOpacity="1" />
                <stop offset="100%" stopColor="#bfdbfe" stopOpacity="1" />
            </radialGradient>
            
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>

            <filter id="highlight-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="white" floodOpacity="0.8"/>
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="black" floodOpacity="0.4"/>
            </filter>

            <radialGradient id="sphereShadow" cx="50%" cy="50%" r="50%">
                <stop offset="80%" stopColor="#000000" stopOpacity="0" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
            </radialGradient>
          </defs>

          <g>
            <path 
                d={pathGenerator({type: "Sphere"})} 
                fill="url(#oceanGradient)" 
                stroke="none"
            />
            <circle cx={width/2} cy={height/2} r={projection.scale()} fill="#60a5fa" opacity="0.1" filter="url(#glow)" />
            {paths}
            {highlightPath}
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
  data: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.shape({
      "ISO 3166-1 alpha-3": PropTypes.string,
    })),
    PropTypes.instanceOf(Map)
  ]).isRequired,
  geoJson: PropTypes.shape({
    type: PropTypes.string,
    features: PropTypes.arrayOf(PropTypes.object)
  }),
  category: PropTypes.string.isRequired,
  maxVal: PropTypes.number,
  onCountrySelect: PropTypes.func.isRequired,
};

export default React.memo(Globe);
