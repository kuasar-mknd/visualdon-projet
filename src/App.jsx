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

  // Memoize filtered data for performance
  const currentYearData = useMemo(() => {
      if (!activeData) return [];
      return activeData.filter(d => d.Year === year);
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
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="text-2xl animate-pulse">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-emerald-400">
            {t('title')}
          </h1>
          <p className="text-slate-400 mt-2">{t('subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
                onClick={toggleLanguage}
                className="px-3 py-1 rounded border border-slate-600 hover:bg-slate-800 transition-colors text-sm font-medium"
            >
                {language === 'en' ? 'FR' : 'EN'}
            </button>
            <div className="text-right">
                <div className="text-4xl font-mono font-bold text-emerald-400">{year}</div>
                <div className="text-sm text-slate-500">{t('year')}</div>
            </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls & Charts */}
        <div className="lg:col-span-4 space-y-6 h-[600px] flex flex-col">
          
          {/* Controls */}
          <div className="bg-slate-800/50 p-6 rounded-xl backdrop-blur-sm border border-slate-700 shadow-xl">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  isPlaying 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'
                }`}
              >
                {isPlaying ? t('pause') : t('play')}
              </button>
              
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Total">{t('total')}</option>
                <option value="Per Capita">{t('perCapita')}</option>
              </select>
            </div>

            <input
              type="range"
              min={yearRange.min}
              max={yearRange.max}
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>{yearRange.min}</span>
              <span>{yearRange.max}</span>
            </div>
          </div>

          {/* Top Countries Chart */}
          <div className="bg-slate-800/50 p-6 rounded-xl backdrop-blur-sm border border-slate-700 shadow-xl flex-1 min-h-0">
             <TopCountriesChart 
                data={activeData} 
                year={year} 
                category={category === 'Per Capita' ? 'Total' : category} 
             />
          </div>

        </div>

        {/* Middle: Globe */}
        <div className="lg:col-span-8 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700 shadow-xl overflow-hidden relative">
           <Globe 
              data={currentYearData} 
              geoJson={geoJson} 
              year={year}
              category={category === 'Per Capita' ? 'Total' : category}
              onCountrySelect={setSelectedCountry}
           />
           
           {/* Country Analysis Overlay */}
           <div className={`absolute bottom-0 left-0 right-0 top-0 bg-slate-900/85 backdrop-blur-md border-t-2 border-blue-500 shadow-2xl transition-transform duration-500 ease-in-out overflow-hidden flex flex-col ${selectedCountry ? 'translate-y-0 pointer-events-auto' : 'translate-y-full pointer-events-none'}`}>
              <div className="flex justify-between items-start gap-4 p-4 shrink-0">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-1 h-8 bg-linear-to-b from-blue-500 to-emerald-400 rounded-full shrink-0"></span>
                      <span className="truncate">{selectedCountryName || displayCountry}</span>
                  </h2>
                  <button 
                      onClick={() => setSelectedCountry(null)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg transition-all font-semibold shrink-0 whitespace-nowrap text-sm"
                      aria-label="Fermer"
                  >
                      <span>✕</span>
                      <span>{t('close')}</span>
                  </button>
              </div>
              <div className="flex-1 px-4 pb-4 overflow-auto">
                  <CountryChart 
                      countryCode={displayCountry} 
                      year={year} 
                      emissionsData={emissions}
                  />
              </div>
           </div>
        </div>

      </main>
      
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
