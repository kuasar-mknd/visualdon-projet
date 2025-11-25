import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    title: "CO2 Emissions History",
    subtitle: "Visualizing global carbon footprint evolution",
    total: "Total",
    perCapita: "Per Capita",
    play: "Play",
    pause: "Pause",
    year: "Year",
    selected: "Selected",
    loading: "Loading...",
    source: "Source: Global Carbon Budget",
    top10: "Top 10 Emitters",
    emissionsBySector: "Emissions by Sector",
    close: "Close",
    noData: "No data",
    emissionsLabel: "CO2 Emissions",
    legend: {
      low: "Low",
      moderate: "Moderate",
      medium: "Medium",
      high: "High"
    },
    sectors: {
      Coal: "Coal",
      Oil: "Oil",
      Gas: "Gas",
      Cement: "Cement",
      Flaring: "Flaring",
      Other: "Other"
    }
  },
  fr: {
    title: "Histoire des Émissions de CO2",
    subtitle: "Visualisation de l'évolution de l'empreinte carbone mondiale",
    total: "Total",
    perCapita: "Par Habitant",
    play: "Lecture",
    pause: "Pause",
    year: "Année",
    selected: "Sélectionné",
    loading: "Chargement...",
    source: "Source: Global Carbon Budget",
    top10: "Top 10 Émetteurs",
    emissionsBySector: "Émissions par Secteur",
    close: "Fermer",
    noData: "Pas de données",
    emissionsLabel: "Émissions CO₂",
    legend: {
      low: "Faibles",
      moderate: "Modérées",
      medium: "Moyennes",
      high: "Élevées"
    },
    sectors: {
      Coal: "Charbon",
      Oil: "Pétrole",
      Gas: "Gaz",
      Cement: "Ciment",
      Flaring: "Torcharge",
      Other: "Autre"
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('fr'); // Default to French as requested

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'fr' : 'en');
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
