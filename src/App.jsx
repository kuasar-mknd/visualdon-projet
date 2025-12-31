import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Controls from './components/controls/Controls';
import { useData } from './hooks/useData';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { fetchCountryDetails } from './services/countryService';

// Lazy load heavy visualization components
const Globe = React.lazy(() => import('./components/Globe'));
const TopCountriesChart = React.lazy(() => import('./components/TopCountriesChart'));
const CountryDetailsOverlay = React.lazy(() => import('./components/overlay/CountryDetailsOverlay'));

function AppContent() {
  const { emissions, geoJson, perCapita, loading } = useData();
  const [year, setYear] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Optimization: Single pass data processing O(N)
  // Calculates stats (min/max year, max value) and groups by year simultaneously.
  const processDataset = useCallback((data, valueKey) => {
    if (!data || data.length === 0) {
      return {
        grouped: new Map(),
        stats: { minYear: 0, maxYear: 0, maxValue: 10 }
      };
    }

    const grouped = new Map();
    let minYear = Infinity;
    let maxYear = -Infinity;
    let maxValue = 0;

    // Use a manual loop for better performance than forEach/reduce
    for (let i = 0; i < data.length; i++) {
        const d = data[i];

        // Stats Calculation
        const y = d.Year;
        if (y != null) {
            if (y < minYear) minYear = y;
            if (y > maxYear) maxYear = y;
        }
        const val = d[valueKey] || 0;
        if (val > maxValue) maxValue = val;

        // Grouping Logic
        if (d["ISO 3166-1 alpha-3"] === "WLD") continue;

        if (!grouped.has(y)) {
            grouped.set(y, { list: [], map: new Map() });
        }
        const entry = grouped.get(y);
        entry.list.push(d);
        entry.map.set(d["ISO 3166-1 alpha-3"], d);
    }

    if (minYear === Infinity) minYear = 0;
    if (maxYear === -Infinity) maxYear = 0;
    if (maxValue === 0) maxValue = 100; // Default fallback

    return {
        grouped,
        stats: { minYear, maxYear, maxValue }
    };
  }, []);

  const emissionsData = useMemo(() => processDataset(emissions, 'Total'), [emissions, processDataset]);
  const perCapitaData = useMemo(() => processDataset(perCapita, 'Per Capita'), [perCapita, processDataset]);

  const yearRange = useMemo(() => ({
      min: emissionsData.stats.minYear,
      max: emissionsData.stats.maxYear
  }), [emissionsData.stats]);

  const maxEmissions = emissionsData.stats.maxValue;
  const maxPerCapita = perCapitaData.stats.maxValue;

  const [displayCountry, setDisplayCountry] = useState(null);
  const [selectedCountryName, setSelectedCountryName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [category, setCategory] = useState('Total'); // 'Total' or 'Per Capita'

  const currentMaxVal = category === 'Per Capita' ? maxPerCapita : maxEmissions;
  const dataByYear = category === 'Per Capita' ? perCapitaData.grouped : emissionsData.grouped;

  const { t, language } = useLanguage();

  // Animation loop
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setYear(prev => {
          if (prev >= yearRange.max) {
            setIsPlaying(false);
            return yearRange.max;
          }
          return prev + 1;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, yearRange.max]);

  // Update year to max available when data loads (if currently at default or old max)
  useEffect(() => {
    if (yearRange.max > 0 && (year === null || year > yearRange.max || year < yearRange.min)) {
       setYear(yearRange.max);
    }
  }, [yearRange, year]);

  // Memoize filtered data for performance
  // Optimization: Extract pre-indexed structures (O(1)) instead of reconstructing them.
  const emptyData = useMemo(() => ({ list: [], map: new Map() }), []);
  const { list: currentYearList, map: currentYearMap } = dataByYear.get(year) || emptyData;

  // Update displayCountry when selectedCountry changes to a valid value
  useEffect(() => {
    if (selectedCountry) {
      setDisplayCountry(selectedCountry);
    }
  }, [selectedCountry]);

  // Fetch translated country name when displayCountry changes
  useEffect(() => {
    if (!displayCountry) return;
    
    fetchCountryDetails(displayCountry, language).then(name => {
      if (name) setSelectedCountryName(name);
    });
  }, [displayCountry, language]);

  // Stable handlers
  const handleCloseOverlay = useCallback(() => {
    setSelectedCountry(null);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent text-slate-800" role="status" aria-live="polite">
        <div className="text-2xl font-light tracking-widest animate-pulse uppercase">{t('loading')}</div>
        <span className="sr-only">{t('loading')}</span>
      </div>
    );
  }

  // Loading fallback component
  const LoadingPlaceholder = () => (
    <div className="flex items-center justify-center w-full h-full text-slate-400">
      <div className="animate-pulse">{t('loading')}...</div>
    </div>
  );

  return (
    <div className="min-h-screen text-slate-800 p-2 md:p-4 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only absolute top-4 left-4 z-[100] px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform"
      >
        {t('aria.skipToContent')}
      </a>

      <Header year={year} />

      <div id="main-content" tabIndex="-1" className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-140px)] outline-none">
        {/* Left Column: Controls & Charts */}
        <div className="lg:col-span-4 space-y-4 flex flex-col h-full">
          
          <Controls 
            isPlaying={isPlaying} 
            setIsPlaying={setIsPlaying}
            category={category}
            setCategory={setCategory}
            year={year}
            setYear={setYear}
            yearRange={yearRange}
          />

          {/* Top Countries Chart */}
          <div className="glass-panel-light p-4 rounded-2xl flex-1 min-h-0 relative overflow-hidden">
             <Suspense fallback={<LoadingPlaceholder />}>
               <TopCountriesChart
                  data={currentYearList}
                  year={year}
                  category={category === 'Per Capita' ? 'Total' : category}
                  isPlaying={isPlaying}
                  onCountrySelect={setSelectedCountry}
               />
             </Suspense>
          </div>

        </div>

        {/* Middle: Globe */}
        <div className="lg:col-span-8 glass-panel-light rounded-2xl overflow-hidden relative shadow-xl border-white/50">
           {/* Removed year prop as it caused unnecessary re-renders and wasn't used by Globe */}
           <Suspense fallback={<LoadingPlaceholder />}>
             <Globe
                data={currentYearMap}
                geoJson={geoJson}
                category={category === 'Per Capita' ? 'Total' : category}
                maxVal={currentMaxVal}
                onCountrySelect={setSelectedCountry}
             />

             <CountryDetailsOverlay
                selectedCountry={selectedCountry}
                selectedCountryName={selectedCountryName}
                displayCountry={displayCountry}
                onClose={handleCloseOverlay}
                emissions={emissions}
             />
           </Suspense>
        </div>

      </div>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
