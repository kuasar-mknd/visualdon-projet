import React, { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';

const LanguageContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
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
    },
    aria: {
      play: "Play animation",
      pause: "Pause animation",
      selectCategory: "Select emission category",
      selectYear: "Select year",
      toggleLanguage: "Switch language",
      closeOverlay: "Close details",
      skipToContent: "Skip to main content"
    },
    footer: {
      github: "GitHub",
      githubAria: "GitHub Repository (opens in a new tab)"
    },
    chart: {
      selectCountryPrompt: "Select a country to view details",
      selectViewMode: "Select view mode",
      bubbles: "Bubbles",
      stackedChart: "Stacked Chart",
      splitBySector: "Split by Sector",
      hoverBubbles: "Hover over bubbles or legend",
      hoverZones: "Hover over zones or legend"
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
    },
    aria: {
      play: "Démarrer l'animation",
      pause: "Mettre en pause l'animation",
      selectCategory: "Sélectionner la catégorie d'émission",
      selectYear: "Sélectionner l'année",
      toggleLanguage: "Changer de langue",
      closeOverlay: "Fermer les détails",
      skipToContent: "Aller au contenu principal"
    },
    footer: {
      github: "GitHub",
      githubAria: "Dépôt GitHub (s'ouvre dans un nouvel onglet)"
    },
    chart: {
      selectCountryPrompt: "Sélectionnez un pays pour voir les détails",
      selectViewMode: "Sélectionner le mode d'affichage",
      bubbles: "Bulles",
      stackedChart: "Graphique empilé",
      splitBySector: "Séparer par secteur",
      hoverBubbles: "Survolez les bulles ou la légende",
      hoverZones: "Survolez les zones ou la légende"
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

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => useContext(LanguageContext);
