import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { useLanguage } from '../context/LanguageContext';
import { fetchCountryDetails } from '../services/countryService';

const Globe = ({ data, geoJson, year, category, onCountrySelect }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [rotation, setRotation] = useState([0, 0]);
  const [scale, setScale] = useState(250); // Initial scale
  const [hoveredCountryName, setHoveredCountryName] = useState(null);
  const [hoveredCountryId, setHoveredCountryId] = useState(null);
  const { language, t } = useLanguage();

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

  // Color scale - from light (low emissions) to red (high emissions)
  const colorScale = useMemo(() => {
    if (!data) return d3.scaleSequential(d3.interpolateBlues).domain([0, 100]);
    const max = d3.max(data, d => parseFloat(d[category])) || 100;
    
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
    
    // Use log scale for better distribution
    return d3.scaleSequentialLog(customInterpolator)
        .domain([0.1, max])
        .clamp(true);
  }, [data, category]);

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
      .on("drag", (event) => {
        setRotation(curr => {
            const sensitivity = 0.25;
            return [curr[0] + event.dx * sensitivity, curr[1] - event.dy * sensitivity];
        });
      });
      
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
        if (d.Year === year) {
            map.set(d["ISO 3166-1 alpha-3"], d);
        }
    });
    return map;
  }, [data, year]);

  // Derived hovered value
  const hoveredValue = useMemo(() => {
      if (!hoveredCountryId) return null;
      const countryData = dataMap.get(hoveredCountryId);
      return countryData ? parseFloat(countryData[category]) : null;
  }, [hoveredCountryId, dataMap, category]);

  // Fetch country name on hover
  const handleMouseEnter = async (countryId) => {
      setHoveredCountryId(countryId);
      const name = await fetchCountryDetails(countryId, language);
      setHoveredCountryName(name);
  };

  const handleMouseLeave = () => {
      setHoveredCountryName(null);
      setHoveredCountryId(null);
  };

  const paths = useMemo(() => {
    if (!geoJson || !pathGenerator) return [];
    return geoJson.features.map((feature, i) => {
        const countryId = feature.properties.A3 || feature.id;
        const countryData = dataMap.get(countryId);
        const value = countryData ? parseFloat(countryData[category]) : 0;
        // Use gray for countries with no data
        const fillColor = value > 0 ? colorScale(value) : '#475569';
        
        return (
            <path
                key={countryId || i}
                d={pathGenerator(feature)}
                fill={fillColor}
                stroke="#0f172a"
                strokeWidth="0.5"
                className="transition-colors duration-300 hover:opacity-80 cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    onCountrySelect(countryId);
                }}
                onMouseEnter={() => handleMouseEnter(countryId)}
                onMouseLeave={handleMouseLeave}
            >
            </path>
        );
    });
  }, [geoJson, pathGenerator, dataMap, category, colorScale, onCountrySelect, language]);

  if (!data || !geoJson || !width) return <div ref={containerRef} className="w-full h-full bg-slate-100" />;

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-50 overflow-hidden">
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

            {/* 4. Shading Overlay (on top of land) */}
            <path 
                d={pathGenerator({type: "Sphere"})} 
                fill="url(#sphereShadow)" 
                style={{pointerEvents: 'none'}} 
            />
          </g>
       </svg>
       
       {/* Tooltip for hovered country */}
       {hoveredCountryName && (
           <div className="absolute top-4 right-4 bg-white/90 text-slate-800 px-4 py-3 rounded-xl border border-slate-200 shadow-xl pointer-events-none backdrop-blur-md min-w-[200px]">
               <div className="font-bold text-lg mb-1 text-blue-600">
                   {hoveredCountryName}
               </div>
               {hoveredValue !== null ? (
                   <div className="flex items-baseline gap-2">
                       <span className="text-2xl font-mono font-bold text-slate-800">{hoveredValue.toFixed(2)}</span>
                       <span className="text-sm text-slate-500">
                           {category === 'Per Capita' ? 'tCO₂/hab' : 'MtCO₂'}
                       </span>
                   </div>
               ) : (
                   <div className="text-sm text-slate-400 italic">{t('noData')}</div>
               )}
           </div>
       )}
              {/* Color Legend */}
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-4 text-slate-600 text-xs shadow-lg">
            <div className="font-semibold mb-3 text-sm text-slate-700">{t('emissionsLabel')}</div>
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{background: '#3b82f6'}}></div>
                    <span className="text-slate-600">{t('legend.low')}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{background: '#10b981'}}></div>
                    <span className="text-slate-600">{t('legend.moderate')}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{background: '#fbbf24'}}></div>
                    <span className="text-slate-600">{t('legend.medium')}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{background: '#ef4444'}}></div>
                    <span className="text-slate-600">{t('legend.high')}</span>
                </div>
                <div className="flex items-center gap-3 pt-1 border-t border-slate-200 mt-1">
                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                    <span className="text-slate-400">{t('noData')}</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Globe;
