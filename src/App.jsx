import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { max } from 'd3';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoadingPlaceholder from './components/common/LoadingPlaceholder';
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

  // Optimization: Calculate global stats (max emissions & year range) in a single pass O(N)
  // Replaces separate d3.max and reduce calls (2*O(N))
  const { yearRange, maxEmissions } = useMemo(() => {
    if (!emissions || emissions.length === 0) {
      return { yearRange: { min: 0, max: 0 }, maxEmissions: 100 };
    }

    let min = Infinity;
    let max = -Infinity;
    let maxEm = 0;

    for (const d of emissions) {
      if (d.Year != null) {
          if (d.Year < min) min = d.Year;
          if (d.Year > max) max = d.Year;
      }
      const val = d.Total || 0;
      if (val > maxEm) maxEm = val;
    }

    if (min === Infinity) return { yearRange: { min: 0, max: 0 }, maxEmissions: 100 };

    return {
        yearRange: { min, max },
        maxEmissions: maxEm || 100
    };
  }, [emissions]);

  const maxPerCapita = useMemo(() => {
    if (!perCapita) return 10;
    return max(perCapita, d => d['Per Capita'] || 0) || 10;
  }, [perCapita]);

  const [displayCountry, setDisplayCountry] = useState(null);
  const [selectedCountryName, setSelectedCountryName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [category, setCategory] = useState('Total'); // 'Total' or 'Per Capita'

  const currentMaxVal = category === 'Per Capita' ? maxPerCapita : maxEmissions;
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

  // Helper to group data by year
  const groupDataByYear = useCallback((data) => {
    if (!data) return new Map();

    const grouped = new Map();
    // Single pass to group by year and exclude WLD
    for (const d of data) {
      if (d["ISO 3166-1 alpha-3"] === "WLD") continue;
      
      const year = d.Year;
      if (!grouped.has(year)) {
        grouped.set(year, { list: [], map: new Map() });
      }
      const entry = grouped.get(year);
      entry.list.push(d);
      entry.map.set(d["ISO 3166-1 alpha-3"], d);
    }

    // Sort lists by Total descending to optimize downstream charts
    for (const entry of grouped.values()) {
      entry.list.sort((a, b) => (b.Total || 0) - (a.Total || 0));
    }

    return grouped;
  }, []);

  // Optimization: Pre-group data by year for BOTH datasets once on load.
  // This avoids O(N) iteration every time the user switches categories.
  // This significantly improves responsiveness when toggling metrics.
  const emissionsByYear = useMemo(() => groupDataByYear(emissions), [emissions, groupDataByYear]);
  const perCapitaByYear = useMemo(() => groupDataByYear(perCapita), [perCapita, groupDataByYear]);

  const dataByYear = category === 'Per Capita' ? perCapitaByYear : emissionsByYear;

  // Memoize filtered data for performance
  // Optimization: Extract pre-indexed structures (O(1)) instead of reconstructing them.
  const emptyData = useMemo(() => ({ list: [], map: new Map() }), []);
  const { list: currentYearList, map: currentYearMap } = dataByYear.get(year) || emptyData;

  // Optimization: Group emissions by country code for O(1) lookup in CountryDetailsOverlay
  const emissionsByCountry = useMemo(() => {
    if (!emissions) return new Map();
    const grouped = new Map();
    for (const d of emissions) {
      const iso = d["ISO 3166-1 alpha-3"];
      if (!grouped.has(iso)) {
        grouped.set(iso, []);
      }
      grouped.get(iso).push(d);
    }
    return grouped;
  }, [emissions]);

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
      <div className="h-screen w-full">
        <LoadingPlaceholder />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 p-2 md:p-4 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only absolute top-4 left-4 z-[100] px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition-transform"
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
                  displayCategory={category}
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
                displayCategory={category}
                maxVal={currentMaxVal}
                onCountrySelect={setSelectedCountry}
             />

             <CountryDetailsOverlay
                selectedCountry={selectedCountry}
                selectedCountryName={selectedCountryName}
                displayCountry={displayCountry}
                onClose={handleCloseOverlay}
                countryData={displayCountry ? emissionsByCountry.get(displayCountry) || [] : []}
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
