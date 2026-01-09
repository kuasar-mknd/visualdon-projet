import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { useLanguage } from '../context/LanguageContext';
import { fetchCountryDetails } from '../services/countryService';
import GlobeLegend from './globe/GlobeLegend';
import GlobeTooltip from './globe/GlobeTooltip';
import GlobePaths from './globe/GlobePaths';

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

  // Optimization: Use Refs for mutable state that updates frequently (animation/interaction)
  // to avoid React re-renders on every frame.
  const widthRef = useRef(0);
  const heightRef = useRef(0);
  const projectionRef = useRef(d3.geoOrthographic());
  const pathGeneratorRef = useRef(d3.geoPath().projection(projectionRef.current));
  const rotationRef = useRef([0, 0]);
  const scaleRef = useRef(250);
  const hoveredCountryIdRef = useRef(null); // Ref to access current hover state in drag loop

  // Optimization: Cache D3 selections to avoid expensive DOM queries during drag/zoom loop
  const countrySelectionRef = useRef(null);
  const sphereSelectionRef = useRef(null);

  // Force update only when dimensions change significantly
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const [hoveredCountryName, setHoveredCountryName] = useState(null);
  const [hoveredCountryId, setHoveredCountryId] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const { language } = useLanguage();

  // Sync ref with state
  useEffect(() => {
    hoveredCountryIdRef.current = hoveredCountryId;
  }, [hoveredCountryId]);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    // Optimization: Debounce resize events to prevent excessive re-renders and projection updates
    // during window resizing operations.
    let timeoutId;

    const resizeObserver = new ResizeObserver(entries => {
      // Get the latest entry
      const entry = entries[entries.length - 1];
      const { width, height } = entry.contentRect;

      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        widthRef.current = width;
        heightRef.current = height;
        setDimensions({ width, height });

        // Update projection center when dimensions settle
        projectionRef.current.translate([width / 2, height / 2]);
      }, 100);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  const colorScale = useMemo(() => {
    const max = maxVal || 100;
    return d3.scaleSequentialLog(customInterpolator)
        .domain([0.1, max])
        .clamp(true);
  }, [maxVal]);

  const featureMap = useMemo(() => {
      if (!geoJson) return new Map();
      const map = new Map();
      geoJson.features.forEach(f => {
          map.set(f.properties.A3 || f.id, f);
      });
      return map;
  }, [geoJson]);

  const dataMap = useMemo(() => {
    if (!data) return new Map();
    if (data instanceof Map) return data;
    const map = new Map();
    data.forEach(d => {
        map.set(d["ISO 3166-1 alpha-3"], d);
    });
    return map;
  }, [data]);

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

  // Optimization: Update cached selections when GlobePaths re-renders (via geoJson/handlers change)
  // This ensures D3 can find the new DOM nodes if they are re-mounted.
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    countrySelectionRef.current = svg.selectAll("path.country-path");
    sphereSelectionRef.current = svg.selectAll("path.sphere-path");
  }, [geoJson, handlePathFocus]); // Re-run if data structure or handlers (language) change

  // Update projection setup (rotation/scale) and paths
  useEffect(() => {
     if (dimensions.width === 0) return;

     projectionRef.current
        .scale(scaleRef.current)
        .translate([dimensions.width / 2, dimensions.height / 2])
        .rotate(rotationRef.current);

     // Initial render of paths
     // Use cached selections if available
     const countrySelection = countrySelectionRef.current || d3.select(svgRef.current).selectAll("path.country-path");
     const sphereSelection = sphereSelectionRef.current || d3.select(svgRef.current).selectAll("path.sphere-path");

     if (!countrySelection.empty()) {
        countrySelection.attr("d", pathGeneratorRef.current);
     }
     if (!sphereSelection.empty()) {
        sphereSelection.attr("d", pathGeneratorRef.current({type: "Sphere"}));
     }
  }, [dimensions, geoJson]); // Depends on dimensions and geoJson (which implies paths exist)

  // Drag & Zoom handling - D3 Controlled
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Update function for high-performance rendering loop
    const updateGlobe = () => {
        const proj = projectionRef.current;
        proj.rotate(rotationRef.current).scale(scaleRef.current);
        const path = pathGeneratorRef.current;

        // Optimization: Use cached selections to avoid expensive DOM querying (selectAll) on every frame
        const countrySelection = countrySelectionRef.current;
        if (countrySelection) {
            countrySelection.attr("d", path);
        } else {
            // Fallback just in case
            d3.select(svgRef.current).selectAll("path.country-path").attr("d", path);
        }

        const sphereSelection = sphereSelectionRef.current;
        if (sphereSelection) {
            sphereSelection.attr("d", path({type: "Sphere"}));
        } else {
             d3.select(svgRef.current).selectAll("path.sphere-path").attr("d", path({type: "Sphere"}));
        }

        // Update highlight path if exists
        const currentHoverId = hoveredCountryIdRef.current;
        if (currentHoverId) {
             const feature = featureMap.get(currentHoverId);
             if (feature) {
                 d3.select(svgRef.current).select(".highlight-path").attr("d", path(feature));
             }
        }
    };

    const zoom = d3.zoom()
      .scaleExtent([1, 5])
      .on("zoom", (event) => {
         if (event.sourceEvent && (event.sourceEvent.type === 'wheel' ||
             (event.sourceEvent.touches && event.sourceEvent.touches.length >= 2))) {
           const newScale = event.transform.k * 250;
           scaleRef.current = newScale;
           updateGlobe();
         }
      });

    const drag = d3.drag()
      .on("start", () => svg.style("cursor", "grabbing"))
      .on("drag", (event) => {
        const sensitivity = 0.25;
        const [r0, r1] = rotationRef.current;
        rotationRef.current = [r0 + event.dx * sensitivity, r1 - event.dy * sensitivity];
        updateGlobe();
      })
      .on("end", () => svg.style("cursor", "grab"));

    // Initialize zoom identity
    svg.call(zoom.transform, d3.zoomIdentity.scale(scaleRef.current / 250));
    svg.call(drag);
    svg.call(zoom);
    svg.on("dblclick.zoom", null);

  }, [dimensions, featureMap]); // Re-bind if dimensions or featureMap changes

  // Effect: Update 'fill' attribute (Data/Animation) directly via D3
  useEffect(() => {
      // Use cached selection if available
      const selection = countrySelectionRef.current || d3.select(svgRef.current).selectAll("path.country-path");

      if (!geoJson || !dataMap || selection.empty()) return;

      selection
        .data(geoJson.features)
        .attr("fill", d => {
            const countryId = d.properties.A3 || d.id;
            const countryData = dataMap.get(countryId);
            const value = countryData ? countryData[category] : 0;
            return (value > 0) ? colorScale(value) : '#475569';
        });
  }, [geoJson, dataMap, category, colorScale]);

  // Effect: Update Highlight Path Position on Interaction
  useEffect(() => {
      if (!hoveredCountryId || !svgRef.current) return;
      const feature = featureMap.get(hoveredCountryId);
      if (!feature) return;

      // We need to update the highlight path's 'd' attribute using the current projection
      // which is stored in projectionRef.current (up to date with drag)
      const d = pathGeneratorRef.current(feature);
      d3.select(svgRef.current).select(".highlight-path").attr("d", d);

  }, [hoveredCountryId, featureMap, dimensions]); // Trigger when hovered country changes

  const highlightPath = useMemo(() => {
      if (!hoveredCountryId) return null;
      // Render an empty path initially; useEffect will set 'd'
      return (
          <path
              className="highlight-path pointer-events-none"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              filter="url(#highlight-glow)"
          />
      );
  }, [hoveredCountryId]);

  if (!data || !geoJson) return <div ref={containerRef} className="w-full h-full bg-slate-100" />;

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-50 overflow-hidden cursor-grab active:cursor-grabbing">
       <svg ref={svgRef} width={dimensions.width} height={dimensions.height} style={{background: 'radial-gradient(circle at 50% 50%, #f8fafc 0%, #e2e8f0 100%)'}}>
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
                className="sphere-path"
                fill="url(#oceanGradient)" 
                stroke="none"
            />
            {/* Center glow - static relative to viewport */}
            <circle cx={dimensions.width/2} cy={dimensions.height/2} r={scaleRef.current} fill="#60a5fa" opacity="0.1" filter="url(#glow)" />

            <GlobePaths
                geoJson={geoJson}
                onPathClick={handlePathClick}
                onPathKeyDown={handlePathKeyDown}
                onPathFocus={handlePathFocus}
                onPathBlur={handleMouseLeave}
            />
            {highlightPath}

            <path 
                className="sphere-path"
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
