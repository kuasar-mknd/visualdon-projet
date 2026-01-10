import { useState, useEffect } from 'react';
import * as d3 from 'd3';

// Helper to fetch with timeout
function fetchWithTimeout(promise, ms = 10000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms))
  ]);
}

// Optimization: Custom row converter to replace d3.autoType
// significantly faster as it avoids regex for every field and only converts known numeric columns.
const fastRowConverter = (obj) => {
  const numericKeys = [
    'Year', 'Total', 'Coal', 'Oil', 'Gas',
    'Cement', 'Flaring', 'Other', 'Per Capita', 'UN M49'
  ];

  for (const key of numericKeys) {
    const val = obj[key];
    if (val === undefined) continue;

    if (val === "") {
      obj[key] = null;
    } else if (val === "NaN" || val === "NA") {
      obj[key] = NaN;
    } else {
      obj[key] = +val;
    }
  }
  return obj;
};

// Helper to safely parse CSV without using new Function (eval) which violates CSP
// d3.csv uses d3-dsv's objectConverter which uses new Function
async function safeCsv(url, rowConverter) {
  const text = await fetchWithTimeout(d3.text(url));
  const rows = d3.csvParseRows(text);

  if (rows.length === 0) return [];

  const header = rows[0];
  const body = rows.slice(1);

  // Optimization: Pre-filter safe headers once instead of checking every key in every row
  const safeHeaders = header
    .map((key, index) => ({ key, index }))
    .filter(({ key }) => key !== '__proto__' && key !== 'constructor' && key !== 'prototype');

  const data = body.map(row => {
    const obj = {};
    for (let j = 0; j < safeHeaders.length; j++) {
      const { key, index } = safeHeaders[j];
      obj[key] = row[index];
    }
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
        const manifest = await fetchWithTimeout(d3.json('/data/manifest.json'));
        if (!manifest || !manifest.emissions || !manifest.perCapita) {
          throw new Error('Invalid manifest');
        }

        // Parallelize fetching
        const [emissions, geoJson, perCapita] = await Promise.all([
          safeCsv(`/data/${manifest.emissions}`, fastRowConverter),
          fetchWithTimeout(d3.json('/data/countries-coastline-10km.geo.json')),
          safeCsv(`/data/${manifest.perCapita}`, fastRowConverter),
        ]);

        // Security Enhancement: Validate GeoJSON structure
        if (!geoJson || geoJson.type !== 'FeatureCollection' || !Array.isArray(geoJson.features)) {
          throw new Error('Invalid GeoJSON data');
        }

        setData({
          emissions,
          geoJson,
          perCapita,
          loading: false,
        });
      } catch (err) {
        // Log only the message to avoid leaking potential data structure details in the error object
        console.error("Error loading data:", err.message);
        setData(prev => ({ ...prev, loading: false }));
      }
    }

    loadData();
  }, []);

  return data;
}
