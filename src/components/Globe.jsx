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
    
    // Drag behavior
    const drag = d3.drag()
      .on("drag", (event) => {
        setRotation(curr => {
            const sensitivity = 0.25;
            return [curr[0] + event.dx * sensitivity, curr[1] - event.dy * sensitivity];
        });
      });

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 5]) // Relative scale extent
      .on("zoom", (event) => {
         setScale(event.transform.k * 250);
      });
      
    // Initialize zoom transform to match current scale
    svg.call(zoom.transform, d3.zoomIdentity.scale(scale / 250));

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

  // Fetch country name on hover
  const handleMouseEnter = async (countryId) => {
      const name = await fetchCountryDetails(countryId, language);
      setHoveredCountryName(name);
  };

  const handleMouseLeave = () => {
      setHoveredCountryName(null);
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
  }, [geoJson, pathGenerator, dataMap, category, colorScale, onCountrySelect, language]); // Add language dependency

  if (!data || !geoJson || !width) return <div ref={containerRef} className="w-full h-[600px] bg-slate-800" />;

  return (
    <div ref={containerRef} className="w-full h-[600px] relative bg-slate-800 overflow-hidden">
       <svg ref={svgRef} width={width} height={height} style={{background: 'radial-gradient(circle at 30% 30%, #1e3a8a 0%, #0f172a 50%, #020617 100%)'}}>
          <g>
            {paths}
          </g>
       </svg>
       {/* Tooltip for hovered country */}
       {hoveredCountryName && (
           <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded pointer-events-none backdrop-blur-sm">
               {hoveredCountryName}
           </div>
       )}
       
       {/* Color Legend */}
       <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
           <div className="font-semibold mb-2">Émissions CO₂</div>
           <div className="flex items-center gap-2 mb-1">
               <div className="w-4 h-4 rounded" style={{background: '#3b82f6'}}></div>
               <span>Faibles</span>
           </div>
           <div className="flex items-center gap-2 mb-1">
               <div className="w-4 h-4 rounded" style={{background: '#10b981'}}></div>
               <span>Modérées</span>
           </div>
           <div className="flex items-center gap-2 mb-1">
               <div className="w-4 h-4 rounded" style={{background: '#fbbf24'}}></div>
               <span>Moyennes</span>
           </div>
           <div className="flex items-center gap-2 mb-1">
               <div className="w-4 h-4 rounded" style={{background: '#ef4444'}}></div>
               <span>Élevées</span>
           </div>
           <div className="flex items-center gap-2">
               <div className="w-4 h-4 rounded bg-slate-600"></div>
               <span>Pas de données</span>
           </div>
       </div>
    </div>
  );
};

export default Globe;
