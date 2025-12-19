import React, { useEffect, useRef, useState, Suspense } from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '../context/LanguageContext';

const BubbleChart = React.lazy(() => import('./charts/BubbleChart'));
const StackedAreaChart = React.lazy(() => import('./charts/StackedAreaChart'));

const colorMapping = {
    'Coal': '#3b82f6', // Blue
    'Oil': '#f97316', // Orange
    'Gas': '#10b981', // Emerald
    'Cement': '#ef4444', // Red
    'Flaring': '#a855f7', // Purple
    'Other': '#eab308' // Yellow
};

const CountryChart = ({ countryCode, emissionsData }) => {
  const containerRef = useRef(null);
  const [split, setSplit] = useState(false);
  const [viewMode, setViewMode] = useState('bubbles'); // 'bubbles' or 'lines'
  const { t } = useLanguage();

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle Resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
       if (containerRef.current) {
          setDimensions({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight || 500
          });
       }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Also use ResizeObserver for more robust detection
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
    };
  }, [containerRef.current]);

  const emissionData = React.useMemo(() => {
      if (!countryCode || !emissionsData) return [];
      return emissionsData.filter(e => e["ISO 3166-1 alpha-3"] === countryCode);
  }, [countryCode, emissionsData]);

  // Transform data for charts
  const chartData = React.useMemo(() => {
    if (viewMode !== 'bubbles' || !emissionData.length) return [];
    
    let data = [];
    emissionData.forEach(yearData => {
      const yearNum = +yearData.Year;
      for (let sector of Object.keys(colorMapping)) {
        const value = +yearData[sector];
        if (value > 0) {
          data.push({
            year: yearNum, 
            sector: sector, 
            value: value, 
            color: colorMapping[sector]
          });
        }
      }
    });
    return data;
  }, [emissionData, viewMode]);

  const years = React.useMemo(() => {
    if (viewMode !== 'lines' || !emissionData.length) return [];
    return emissionData.map(d => +d.Year).sort((a, b) => a - b);
  }, [emissionData, viewMode]);

  if (!countryCode) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <p className="text-lg">Sélectionnez un pays pour voir les détails</p>
      </div>
    );
  }

  const padding = {top: 60, right: 160, bottom: 60, left: 70};

  return (
    <div className="w-full h-full flex flex-col">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('bubbles')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none ${
              viewMode === 'bubbles'
                ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            🫧 Bulles
          </button>
          <button
            onClick={() => setViewMode('lines')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none ${
              viewMode === 'lines'
                ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            📈 Graphique empilé
          </button>
        </div>

        {viewMode === 'bubbles' && (
          <label className="flex items-center gap-3 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
            <input 
              type="checkbox" 
              checked={split} 
              onChange={(e) => setSplit(e.target.checked)}
              className="w-4 h-4 accent-blue-500 cursor-pointer outline-none"
            />
            <span className="text-slate-300 font-medium">Séparer par secteur</span>
          </label>
        )}

        <div className="text-xs text-slate-500 italic ml-auto">
          {viewMode === 'bubbles' ? 'Survolez les bulles ou la légende' : 'Survolez les zones ou la légende'}
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="flex-1 bg-transparent rounded-lg overflow-hidden relative">
        <div ref={containerRef} className="w-full h-full absolute inset-0">
           {dimensions.width > 0 && dimensions.height > 0 && emissionData.length > 0 && (
             <Suspense fallback={<div className="flex items-center justify-center h-full text-slate-400">{t('loading')}...</div>}>
                {viewMode === 'bubbles' ? (
                  <BubbleChart
                    chartData={chartData}
                    width={dimensions.width}
                    height={dimensions.height}
                    padding={padding}
                    split={split}
                    colorMapping={colorMapping}
                  />
                ) : (
                  <StackedAreaChart
                    years={years}
                    emissionData={emissionData}
                    sectors={Object.keys(colorMapping)}
                    width={dimensions.width}
                    height={dimensions.height}
                    padding={padding}
                    colorMapping={colorMapping}
                  />
                )}
             </Suspense>
           )}
        </div>
      </div>
    </div>
  );
};

CountryChart.propTypes = {
  countryCode: PropTypes.string,
  emissionsData: PropTypes.arrayOf(PropTypes.shape({
    Year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    "ISO 3166-1 alpha-3": PropTypes.string,
  })),
};

export default React.memo(CountryChart);
