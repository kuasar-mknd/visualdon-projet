import { useState, useEffect } from 'react';
import * as d3 from 'd3';

export function useData() {
  const [data, setData] = useState({
    emissions: null,
    geoJson: null,
    perCapita: null,
    loading: true,
  });

  useEffect(() => {
    Promise.all([
      d3.csv('/data/GCB2022v27_MtCO2_flat-clean.csv', d3.autoType),
      d3.json('/data/countries-coastline-10km.geo.json'),
      d3.csv('/data/GCB2022v27_percapita_flat-clean.csv', d3.autoType),
    ]).then(([emissions, geoJson, perCapita]) => {
      console.log("Data loaded:", { emissions: emissions.length, geoJson: geoJson.features.length, perCapita: perCapita.length });
      setData({
        emissions,
        geoJson,
        perCapita,
        loading: false,
      });
    }).catch(err => {
      console.error("Error loading data:", err);
      setData(prev => ({ ...prev, loading: false }));
    });
  }, []);

  return data;
}
