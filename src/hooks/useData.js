import { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { validateManifest, validateGeoJson } from '../utils/security';

// Helper to fetch with timeout
function fetchWithTimeout(promise, ms = 10000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms))
  ]);
}

// Helper to verify SHA-256 integrity of fetched content
async function verifyIntegrity(text, expectedHash) {
  if (!expectedHash) return; // Skip if no hash provided (dev mode/legacy)

  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  if (hashHex !== expectedHash) {
    throw new Error(`Integrity check failed! Calculated: ${hashHex}, Expected: ${expectedHash}`);
  }
}

// Helper to safely fetch and verify JSON content (e.g., GeoJSON)
async function safeJson(url, expectedHash) {
  const text = await fetchWithTimeout(d3.text(url));
  if (expectedHash) await verifyIntegrity(text, expectedHash);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Failed to parse JSON from ${url}`);
  }
}

// Helper to safely parse CSV without using new Function (eval) which violates CSP
// Optimized for "Structure of Arrays" style processing where possible
async function safeCsv(url, expectedHash) {
  const text = await fetchWithTimeout(d3.text(url));
  if (expectedHash) await verifyIntegrity(text, expectedHash);

  const rows = d3.csvParseRows(text);
  if (rows.length === 0) return [];

  const header = rows[0];
  const body = rows.slice(1);

  // Filter safe headers
  const safeHeaders = header
    .map((key, index) => ({ key, index }))
    .filter(({ key }) => key !== '__proto__' && key !== 'constructor' && key !== 'prototype');

  // Optimization: Pre-classify columns to avoid branch checks inside the main loop.
  // We identify which indices map to strings (direct assignment) and which to numbers (parsing).
  const stringCols = [];
  const numberCols = [];

  for (const { key, index } of safeHeaders) {
    if (key === 'Country' || key === 'ISO 3166-1 alpha-3') {
      stringCols.push({ key, index });
    } else {
      numberCols.push({ key, index });
    }
  }

  // Branch-less Row Builder Loop
  // This avoids `if (key === ...)` for every single cell in the CSV (millions of checks).
  const data = body.map(row => {
    const obj = {};

    // Fast path: String columns (Direct assignment)
    for (let i = 0; i < stringCols.length; i++) {
        const { key, index } = stringCols[i];
        obj[key] = row[index];
    }

    // Fast path: Numeric columns (Parse & Assign)
    for (let i = 0; i < numberCols.length; i++) {
        const { key, index } = numberCols[i];
        const val = row[index];
        if (val === '') {
            obj[key] = null;
        } else {
            const num = +val;
            // Handle NaN cases (e.g. text in numeric column) by keeping original string
            if (isNaN(num) && val !== 'NaN') {
                obj[key] = val;
            } else {
                obj[key] = num;
            }
        }
    }
    return obj;
  });

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
        const manifest = await fetchWithTimeout(d3.json('/data/manifest.json'));

        if (!validateManifest(manifest)) {
          throw new Error('Invalid manifest structure or missing security hashes');
        }

        const [emissions, geoJson, perCapita] = await Promise.all([
          safeCsv(`/data/${manifest.emissions}`, manifest.emissionsHash),
          safeJson('/data/countries-coastline-10km.geo.json', manifest.geoJsonHash),
          safeCsv(`/data/${manifest.perCapita}`, manifest.perCapitaHash),
        ]);

        if (!validateGeoJson(geoJson)) {
          throw new Error('Invalid GeoJSON data structure');
        }

        setData({
          emissions,
          geoJson,
          perCapita,
          loading: false,
        });
      } catch (err) {
        console.error("Error loading data:", err.message);
        setData(prev => ({ ...prev, loading: false }));
      }
    }

    loadData();
  }, []);

  return data;
}
