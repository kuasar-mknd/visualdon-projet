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
    async function loadData() {
      try {
        // First load the manifest to get current filenames
        // Use a cache-busting strategy or check if we can rely on browser caching.
        // For now, we fetch manifest.json.
        const manifest = await d3.json('/data/manifest.json');
        if (!manifest || !manifest.emissions || !manifest.perCapita) {
          throw new Error('Invalid manifest');
        }

        // Parallelize fetching
        const [emissions, geoJson, perCapita] = await Promise.all([
          safeCsv(`/data/${manifest.emissions}`, d3.autoType),
          d3.json('/data/countries-coastline-10km.geo.json'),
          safeCsv(`/data/${manifest.perCapita}`, d3.autoType),
        ]);

        setData({
          emissions,
          geoJson,
          perCapita,
          loading: false,
        });
      } catch (err) {
        console.error("Error loading data:", err);
        setData(prev => ({ ...prev, loading: false }));
      }
    }

    loadData();
  }, []);

  return data;
}
