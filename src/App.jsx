import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import Globe3D from './components/Globe3D';
import TopCountriesChart from './components/TopCountriesChart';
import CountryChart from './components/CountryChart';
import { useData } from './hooks/useData';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import { fetchCountryDetails } from './services/countryService';

function AppContent() {
  const { emissions, geoJson, perCapita, loading } = useData();
  const [year, setYear] = useState(2021);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [displayCountry, setDisplayCountry] = useState(null);
  const [selectedCountryName, setSelectedCountryName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [category, setCategory] = useState('Total'); // 'Total' or 'Per Capita'
  const { t, language, toggleLanguage } = useLanguage();

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
  }, [isPlaying]);

  const activeData = category === 'Per Capita' ? perCapita : emissions;

  // Calculate year range dynamically from data
  const yearRange = useMemo(() => {
    if (!emissions || emissions.length === 0) {
      return { min: 1750, max: 2021 }; // Default fallback
    }
    const years = emissions.map(d => d.Year).filter(y => y != null);
    return {
      min: Math.min(...years),
      max: Math.max(...years)
    };
  }, [emissions]);

  // Update year to max available when data loads (if currently at default or old max)
  useEffect(() => {
    if (yearRange.max > 2021 && year === 2021) {
       setYear(yearRange.max);
    }
  }, [yearRange.max, year]);

  // Memoize filtered data for performance - exclude Global only
  // Components will handle NaN/empty values themselves
  const currentYearData = useMemo(() => {
      if (!activeData) return [];
      
      return activeData
        .filter(d => d.Year === year)
        .filter(d => d["ISO 3166-1 alpha-3"] !== "WLD"); // Exclude Global only
  }, [activeData, year]);

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


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent text-slate-800">
        <div className="text-2xl font-light tracking-widest animate-pulse uppercase">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <ErrorBoundary>
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <Globe3D 
              onCountrySelect={setSelectedCountry} 
              data={currentYearData}
              geoJson={geoJson}
            />
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* UI Overlay - Pointer events disabled by default, enabled on interactive elements */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col p-4 md:p-6">
        
        {/* Header */}
        <header className="flex justify-between items-start pointer-events-auto">
          <div className="glass-panel-light p-4 rounded-2xl backdrop-blur-md bg-white/80 shadow-lg">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              {t('title')}
            </h1>
            <p className="text-slate-500 mt-0.5 text-sm font-normal">{t('subtitle')}</p>
          </div>
          
          <div className="flex flex-col items-end gap-4">
             <div className="flex gap-2">
                <button 
                    onClick={toggleLanguage}
                    className="px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-md border border-slate-200 hover:bg-white transition-all text-xs font-semibold text-slate-600 shadow-sm"
                >
                    {language === 'en' ? 'FR' : 'EN'}
                </button>
             </div>
             <div className="glass-panel-light px-6 py-3 rounded-2xl backdrop-blur-md bg-white/80 shadow-lg text-center">
                <div className="text-4xl font-mono font-bold text-blue-600 leading-none">{year}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold leading-none mt-1">{t('year')}</div>
            </div>
          </div>
        </header>

        {/* Main Content Area - Floating Panels */}
        <div className="flex-1 flex items-center justify-between mt-4 pointer-events-none">
            
            {/* Left Panel: Controls & Charts */}
            <div className="w-full max-w-md pointer-events-auto space-y-4">
                {/* Controls */}
                <div className="glass-panel-light p-4 rounded-2xl backdrop-blur-md bg-white/80 shadow-lg">
                    <div className="flex gap-3 mb-4">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`flex-1 py-2 px-4 rounded-xl font-semibold tracking-wide transition-all shadow-sm ${
                        isPlaying 
                            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                            : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                        }`}
                    >
                        {isPlaying ? t('pause') : t('play')}
                    </button>
                    
                    <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium shadow-sm"
                    >
                        <option value="Total">{t('total')}</option>
                        <option value="Per Capita">{t('perCapita')}</option>
                    </select>
                    </div>

                    <div className="px-1">
                    <input
                        type="range"
                        min={yearRange.min}
                        max={yearRange.max}
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
                        <span>{yearRange.min}</span>
                        <span>{yearRange.max}</span>
                    </div>
                    </div>
                </div>

                {/* Top Countries Chart */}
                <div className="glass-panel-light p-4 rounded-2xl backdrop-blur-md bg-white/80 shadow-lg h-[300px] overflow-hidden relative">
                    <TopCountriesChart 
                        data={activeData} 
                        year={year} 
                        category={category === 'Per Capita' ? 'Total' : category} 
                    />
                </div>
            </div>

            {/* Right Panel: Country Details (Slide-in) */}
            <div className={`w-full max-w-md pointer-events-auto transition-all duration-500 transform ${selectedCountry ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
                <div className="glass-panel-light p-0 rounded-2xl backdrop-blur-md bg-white/90 shadow-2xl overflow-hidden h-[500px] flex flex-col border border-white/60">
                    <div className="flex justify-between items-start gap-4 p-5 shrink-0 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3 flex-1 min-w-0">
                            <span className="w-1 h-6 bg-blue-500 rounded-full shrink-0 shadow-sm"></span>
                            <span className="truncate">{selectedCountryName || displayCountry}</span>
                        </h2>
                        <button 
                            onClick={() => setSelectedCountry(null)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg transition-all font-semibold shrink-0 text-xs"
                        >
                            <span>✕</span>
                            <span>{t('close')}</span>
                        </button>
                    </div>
                    <div className="flex-1 p-4 overflow-auto">
                        <CountryChart 
                            countryCode={displayCountry} 
                            year={year} 
                            emissionsData={emissions}
                        />
                    </div>
                </div>
            </div>
        </div>

        <footer className="mt-auto pt-4 text-center text-slate-400 text-xs pointer-events-auto">
          <p className="bg-white/50 inline-block px-3 py-1 rounded-full backdrop-blur-sm">{t('source')}</p>
        </footer>
      </div>
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
