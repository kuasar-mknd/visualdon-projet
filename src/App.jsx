import React, { useState, useEffect, useMemo } from 'react';
import Globe from './components/Globe';
import CountryChart from './components/CountryChart';
import TopCountriesChart from './components/TopCountriesChart';
import { useData } from './hooks/useData';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
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
    <div className="min-h-screen text-slate-800 p-2 md:p-4 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      <header className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4 glass-panel-light p-4 rounded-2xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            {t('title')}
          </h1>
          <p className="text-slate-500 mt-0.5 text-sm font-normal">{t('subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
                onClick={toggleLanguage}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all duration-300 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
                {language === 'en' ? 'FR' : 'EN'}
            </button>
            <div className="text-right bg-white/50 px-4 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                <div className="text-3xl font-mono font-bold text-blue-600 leading-none">{year}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold leading-none">{t('year')}</div>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-140px)]">
        {/* Left Column: Controls & Charts */}
        <div className="lg:col-span-4 space-y-4 flex flex-col h-full">
          
          {/* Controls */}
          <div className="glass-panel-light p-4 rounded-2xl shrink-0">
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold tracking-wide transition-all duration-300 shadow-sm hover:shadow-md ${
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
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium shadow-sm cursor-pointer hover:border-blue-300 transition-colors text-sm"
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
          <div className="glass-panel-light p-4 rounded-2xl flex-1 min-h-0 relative overflow-hidden">
             <TopCountriesChart 
                data={activeData} 
                year={year} 
                category={category === 'Per Capita' ? 'Total' : category} 
             />
          </div>

        </div>

        {/* Middle: Globe */}
        <div className="lg:col-span-8 glass-panel-light rounded-2xl overflow-hidden relative shadow-xl border-white/50">
           <Globe 
              data={currentYearData} 
              geoJson={geoJson} 
              year={year}
              category={category === 'Per Capita' ? 'Total' : category}
              onCountrySelect={setSelectedCountry}
           />
           
           {/* Country Analysis Overlay */}
           <div className={`absolute bottom-0 left-0 right-0 top-0 bg-white/80 backdrop-blur-xl border-t border-white/50 shadow-2xl transition-all duration-500 ease-in-out overflow-hidden flex flex-col ${selectedCountry ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-[110%] opacity-0 pointer-events-none'}`}>
              <div className="flex justify-between items-start gap-4 p-6 shrink-0">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-4 flex-1 min-w-0">
                      <span className="w-1.5 h-8 bg-blue-500 rounded-full shrink-0 shadow-sm"></span>
                      <span className="truncate">{selectedCountryName || displayCountry}</span>
                  </h2>
                  <button 
                      onClick={() => setSelectedCountry(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white text-slate-500 hover:text-slate-800 border border-slate-200/50 rounded-xl transition-all font-semibold shrink-0 whitespace-nowrap text-sm shadow-sm hover:shadow"
                      aria-label="Fermer"
                  >
                      <span>✕</span>
                      <span>{t('close')}</span>
                  </button>
              </div>
              <div className="flex-1 px-6 pb-6 overflow-auto">
                  <CountryChart 
                      countryCode={displayCountry} 
                      year={year} 
                      emissionsData={emissions}
                  />
              </div>
           </div>
        </div>

      </div>
      
      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>{t('source')}</p>
      </footer>
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
