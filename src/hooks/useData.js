import { useState, useEffect } from 'react';
import * as d3 from 'd3';

// Helper to fetch with timeout
function fetchWithTimeout(promise, ms = 10000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms))
  ]);
}

// Optimization: Custom row converter that is faster than d3.autoType
// d3.autoType uses regex to infer types for every value. We know the schema.
function fastRowConverter(d) {
  for (const key in d) {
    // Skip known string columns
    if (key === 'Country' || key === 'ISO 3166-1 alpha-3') continue;

    const val = d[key];
    if (val === '') {
      d[key] = null;
    } else {
      // Unary plus is the fastest way to convert valid numeric strings
      const num = +val;
      // If it's NaN (e.g. "NA" or text), keep original string (match d3.autoType behavior partially)
      // But for our dataset, we expect numbers.
      // If result is NaN, check if it was actually a non-empty string that isn't a number.
      if (isNaN(num) && val !== 'NaN') {
         // keep string
      } else {
         d[key] = num;
      }
    }
  }
  return d;
}

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
    // Optimization: Manual loop is faster than reduce/forEach for hot paths
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
