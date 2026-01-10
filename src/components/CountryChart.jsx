import React, { useState, Suspense } from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '../context/LanguageContext';
import { useResizeObserver } from '../hooks/useResizeObserver';

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

// Optimization: Define padding outside the component to ensure stability across renders
// This prevents unnecessary re-renders of child charts that depend on this object.
const padding = {top: 60, right: 160, bottom: 60, left: 70};

const CountryChart = ({ countryCode, data: emissionData }) => {
  const { t } = useLanguage();
  const [split, setSplit] = useState(false);
  const [viewMode, setViewMode] = useState('bubbles'); // 'bubbles' or 'lines'

<<<<<<< HEAD
  // Optimization: Replaced manual ResizeObserver logic with a reusable hook
  // This reduces code duplication and ensures consistent behavior.
  const [containerRef, dimensions] = useResizeObserver({
    debounceTime: 100,
    defaultDimensions: { width: 500, height: 500 }
  });
=======
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });

  // Handle Resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
       if (containerRef.current) {
          setDimensions({
            width: containerRef.current.clientWidth || 500,
            height: containerRef.current.clientHeight || 500
          });
       }
    };

    updateDimensions();
    
    // Optimization: Use ResizeObserver only, removing redundant window resize listener
    // ResizeObserver is more efficient as it monitors the specific element size
    // Added debounce to prevent excessive updates during resizing
    let timeoutId;
    const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;

        // Optimization: Ignore insignificant resize events (< 5px) to prevent layout thrashing
        // and unnecessary D3 redraws during mobile scrolling or minor layout shifts.
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;

        if (Math.abs(newWidth - dimensions.width) < 5 && Math.abs(newHeight - dimensions.height) < 5) {
            return;
        }

        clearTimeout(timeoutId);
        timeoutId = setTimeout(updateDimensions, 100);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [containerRef.current]);

  const emissionData = React.useMemo(() => {
      if (!countryCode || !emissionsData) return [];
      return emissionsData.filter(e => e["ISO 3166-1 alpha-3"] === countryCode);
  }, [countryCode, emissionsData]);
>>>>>>> origin/bolt-frontend-opt-batch-1-17348910179708092052

  // Transform data for charts
  const chartData = React.useMemo(() => {
    if (viewMode !== 'bubbles' || !emissionData || !emissionData.length) return [];
    
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
    if (viewMode !== 'lines' || !emissionData || !emissionData.length) return [];
    return emissionData.map(d => +d.Year).sort((a, b) => a - b);
  }, [emissionData, viewMode]);

  if (!countryCode) {
    return (
      <div
        className="flex items-center justify-center h-full text-slate-400"
        role="status"
        aria-live="polite"
      >
        <p className="text-lg">{t('chart.selectCountryPrompt')}</p>
      </div>
    );
  }

  if (!emissionData || emissionData.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full text-slate-500"
        role="status"
        aria-live="polite"
      >
        <p className="text-lg">{t('noData')}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div role="group" aria-label={t('chart.selectViewMode')} className="flex gap-2">
          <button
            onClick={() => setViewMode('bubbles')}
            aria-pressed={viewMode === 'bubbles'}
            className={`px-4 py-2 rounded-lg font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none ${
              viewMode === 'bubbles'
                ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            🫧 {t('chart.bubbles')}
          </button>
          <button
            onClick={() => setViewMode('lines')}
            aria-pressed={viewMode === 'lines'}
            className={`px-4 py-2 rounded-lg font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none ${
              viewMode === 'lines'
                ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            📈 {t('chart.stackedChart')}
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
            <span className="text-slate-300 font-medium">{t('chart.splitBySector')}</span>
          </label>
        )}

        <div className="text-xs text-slate-500 italic ml-auto">
          {viewMode === 'bubbles' ? t('chart.hoverBubbles') : t('chart.hoverZones')}
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
  data: PropTypes.arrayOf(PropTypes.shape({
    Year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    "ISO 3166-1 alpha-3": PropTypes.string,
  })),
};

export default React.memo(CountryChart);
