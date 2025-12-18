import { useState, useEffect } from 'react';
import * as d3 from 'd3';

// Helper to safely parse CSV without using new Function (eval) which violates CSP
// d3.csv uses d3-dsv's objectConverter which uses new Function
async function safeCsv(url, rowConverter) {
  const text = await d3.text(url);
  const rows = d3.csvParseRows(text);

  if (rows.length === 0) return [];

  const header = rows[0];
  const body = rows.slice(1);

  const data = body.map(row => {
    const obj = {};
    header.forEach((key, i) => {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return;
      }
      obj[key] = row[i];
    });
    return rowConverter ? rowConverter(obj) : obj;
  });

  // Attach columns property as d3.csv does, in case it's used
  data.columns = header;
  return data;
}

export function useData() {
  const [data, setData] = useState({
    emissions: null,
    geoJson: null,
    perCapita: null,
    loading: true,
  });

  useEffect(() => {
    Promise.all([
      safeCsv('/data/GCB_latest_MtCO2_flat-clean.csv', d3.autoType),
      d3.json('/data/countries-coastline-10km.geo.json'),
      safeCsv('/data/GCB_latest_percapita_flat-clean.csv', d3.autoType),
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
