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
      yearLabel: "Year",
      toggleLanguage: "Switch language",
      closeOverlay: "Close details",
      skipToContent: "Skip to main content",
      globeDescription: "Interactive 3D globe showing CO2 emissions by country",
      openInNewTab: "(opens in a new tab)",
      switchToEnglish: "Switch to English",
      switchToFrench: "Switch to French",
      barChartDesc: "Bar chart of top 10 emitters",
      barChartRole: "bar chart",
      bubbleChartDesc: "Bubble chart showing emissions by sector",
      bubbleChartRole: "bubble chart",
      stackedAreaChartDesc: "Stacked area chart showing emissions by sector",
      stackedAreaChartRole: "stacked area chart",
      globeRoleDesc: "interactive 3D globe"
    },
    globe: {
      drag: "Drag to rotate",
      zoom: "Scroll to zoom"
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
      yearLabel: "Année",
      toggleLanguage: "Changer de langue",
      closeOverlay: "Fermer les détails",
      skipToContent: "Aller au contenu principal",
      globeDescription: "Globe 3D interactif montrant les émissions de CO2 par pays",
      openInNewTab: "(ouvre un nouvel onglet)",
      switchToEnglish: "Passer en anglais",
      switchToFrench: "Passer en français",
      barChartDesc: "Graphique à barres des 10 plus gros émetteurs",
      barChartRole: "graphique à barres",
      bubbleChartDesc: "Graphique à bulles montrant les émissions par secteur",
      bubbleChartRole: "graphique à bulles",
      stackedAreaChartDesc: "Graphique en aires empilées montrant les émissions par secteur",
      stackedAreaChartRole: "graphique en aires empilées",
      globeRoleDesc: "globe 3D interactif"
    },
    globe: {
      drag: "Glisser pour tourner",
      zoom: "Défiler pour zoomer"
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
    if (typeof key !== 'string') return '';
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    // Security: Ensure we only return strings or numbers (safe primitives)
    if (typeof value !== 'string' && typeof value !== 'number') {
        return key;
    }
    return value;
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
