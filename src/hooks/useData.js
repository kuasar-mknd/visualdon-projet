import { useState, useEffect } from 'react';
import { text, json, csvParseRows } from 'd3';
import { validateManifest, validateGeoJson, isValidFilename, validateCountryData } from '../utils/security';

// Helper to fetch with timeout
function fetchWithTimeout(promise, ms = 10000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms))
  ]);
}

// Optimization: Custom row builder that combines object creation and type conversion
// This avoids creating an intermediate object with all string values, saving one iteration over keys per row.
function fastRowBuilder(row, headers) {
  const d = {};
  for (let j = 0; j < headers.length; j++) {
    const { key, index } = headers[j];
    const val = row[index];

    // Skip known string columns (assign directly)
    if (key === 'Country' || key === 'ISO 3166-1 alpha-3') {
        d[key] = val;
        continue;
    }

    if (val === '') {
      d[key] = null;
    } else {
      // Unary plus is the fastest way to convert valid numeric strings
      const num = +val;
      // If it's NaN (e.g. "NA" or text), keep original string
      if (isNaN(num) && val !== 'NaN') {
         d[key] = val;
      } else {
         d[key] = num;
      }
    }
  }
  return d;
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
  // We fetch as text first to verify the hash of the raw content
  const t = await fetchWithTimeout(text(url));

  if (expectedHash) {
    await verifyIntegrity(t, expectedHash);
  }

  // Then parse the verified text
  try {
    return JSON.parse(t);
  } catch {
    throw new Error(`Failed to parse JSON from ${url}`);
  }
}

// Helper to safely parse CSV without using new Function (eval) which violates CSP
// d3.csv uses d3-dsv's objectConverter which uses new Function
async function safeCsv(url, rowBuilder, expectedHash) {
  const t = await fetchWithTimeout(text(url));

  // Verify integrity if hash is provided
  if (expectedHash) {
    await verifyIntegrity(t, expectedHash);
  }

  const rows = csvParseRows(t);

  if (rows.length === 0) return [];

  const header = rows[0];
  const body = rows.slice(1);

  // Optimization: Pre-filter safe headers once instead of checking every key in every row
  const safeHeaders = header
    .map((key, index) => ({ key, index }))
    .filter(({ key }) => key !== '__proto__' && key !== 'constructor' && key !== 'prototype');

  // Optimization: Use rowBuilder to combine object creation and value conversion
  const data = body.map(row => {
    if (rowBuilder) {
        return rowBuilder(row, safeHeaders);
    }

    // Fallback if no builder provided (should not happen in current usage)
    const obj = {};
    for (let j = 0; j < safeHeaders.length; j++) {
      const { key, index } = safeHeaders[j];
      obj[key] = row[index];
    }
    return obj;
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
        const manifest = await fetchWithTimeout(json('/data/manifest.json'));

        // Security Enhancement: Validate manifest structure
        if (!validateManifest(manifest)) {
          throw new Error('Invalid manifest structure or missing security hashes');
        }

        // Sentinel Security: Validate filenames to prevent path traversal
        if (!isValidFilename(manifest.emissions) || !isValidFilename(manifest.perCapita)) {
             throw new Error('Invalid filenames in manifest');
        }

        // Sentinel Security: Validate version format (alphanumeric, dots, dashes)
        if (!/^[a-zA-Z0-9.\-_]+$/.test(manifest.version)) {
             throw new Error('Invalid manifest version format');
        }

        // Parallelize fetching
        // Note: verifyIntegrity uses crypto.subtle which is available in secure contexts (HTTPS/localhost)
        const [emissions, geoJson, perCapita] = await Promise.all([
          safeCsv(`/data/${manifest.emissions}`, fastRowBuilder, manifest.emissionsHash),
          safeJson('/data/countries-coastline-10km.geo.json', manifest.geoJsonHash),
          safeCsv(`/data/${manifest.perCapita}`, fastRowBuilder, manifest.perCapitaHash),
        ]);

        // Security Enhancement: Validate GeoJSON structure
        if (!validateGeoJson(geoJson)) {
          throw new Error('Invalid GeoJSON data structure');
        }

        // Sentinel Security: Validate loaded data rows structure (checking first row as sample)
        if (emissions.length > 0 && !validateCountryData(emissions[0])) {
           console.warn("Emissions data failed validation check");
        }
        if (perCapita.length > 0 && !validateCountryData(perCapita[0])) {
           console.warn("Per Capita data failed validation check");
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
