import React, { useState, useEffect, useMemo } from 'react';
import Globe from './components/Globe';
import TopCountriesChart from './components/TopCountriesChart';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Controls from './components/controls/Controls';
import CountryDetailsOverlay from './components/overlay/CountryDetailsOverlay';
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
      <Header year={year} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-140px)]">
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
           
           <CountryDetailsOverlay 
              selectedCountry={selectedCountry}
              selectedCountryName={selectedCountryName}
              displayCountry={displayCountry}
              onClose={() => setSelectedCountry(null)}
              year={year}
              emissions={emissions}
           />
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
