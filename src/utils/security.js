/**
 * Security utilities for input validation and sanitization.
 */

/**
 * Validates if a string is a valid ISO 3166-1 alpha-2 or alpha-3 country code.
 * @param {string} code - The country code to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const isValidCountryCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  return /^[a-zA-Z0-9]{2,3}$/.test(code);
};

/**
 * Sanitizes a string to prevent XSS.
 * Removes HTML tags and unsafe characters.
 * @param {string} str - The string to sanitize.
 * @returns {string} - The sanitized string.
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'&]/g, (char) => {
    switch (char) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      case '&': return '&amp;';
      default: return char;
    }
  });
};

/**
 * Validates filename to prevent path traversal.
 * Allows alphanumeric, dots, dashes, and underscores.
 * @param {string} filename - The filename to validate.
 * @returns {boolean} - True if valid.
 */
export const isValidFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return false;
  // Prevent path traversal (..) and special chars
  return /^[a-zA-Z0-9._-]+$/.test(filename) && !filename.includes('..');
};

/**
 * Validates year is within reasonable range.
 * @param {number|string} year - The year to validate.
 * @returns {boolean} - True if valid.
 */
export const isValidYear = (year) => {
  const y = Number(year);
  if (isNaN(y)) return false;
  const currentYear = new Date().getFullYear();
  return y >= 1750 && y <= (currentYear + 5);
};

/**
 * Validates hex color code.
 * @param {string} color - The color string.
 * @returns {boolean} - True if valid hex color.
 */
export const isValidColor = (color) => {
  if (!color || typeof color !== 'string') return false;
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color);
};

/**
 * Validates the manifest.json structure to ensure data integrity.
 * @param {object} manifest - The manifest object to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const validateManifest = (manifest) => {
  if (!manifest || typeof manifest !== 'object') return false;

  // Required keys for a valid manifest
  const requiredKeys = [
    'emissions',
    'perCapita',
    'emissionsHash',
    'perCapitaHash',
    'geoJsonHash',
    'version',
    'lastUpdated'
  ];

  // Validate presence and type of keys
  const hasKeys = requiredKeys.every(key =>
    Object.prototype.hasOwnProperty.call(manifest, key) &&
    typeof manifest[key] === 'string' &&
    manifest[key].length > 0
  );

  if (!hasKeys) return false;

  // Validate Hash Formats (SHA-256 Hex)
  const isHash = (h) => /^[a-fA-F0-9]{64}$/.test(h);

  // Allow empty string if hash is missing (optional but discouraged),
  // but if present, must be valid.
  // The current update-data.js generates hashes, so they should be present.
  if (manifest.emissionsHash && !isHash(manifest.emissionsHash)) return false;
  if (manifest.perCapitaHash && !isHash(manifest.perCapitaHash)) return false;

  return true;
};

/**
 * Validates language code (whitelist).
 * @param {string} lang - The language code.
 * @returns {boolean} - True if valid.
 */
export const isValidLanguage = (lang) => {
  return ['en', 'fr'].includes(lang);
};

/**
 * Validates the GeoJSON structure.
 * @param {object} geoJson - The GeoJSON object to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const validateGeoJson = (geoJson) => {
  if (!geoJson || typeof geoJson !== 'object') return false;

  // Check basic FeatureCollection structure
  if (geoJson.type !== 'FeatureCollection') return false;

  // Check features array
  if (!Array.isArray(geoJson.features)) return false;

  // Validate at least the first feature if exists to ensure basic structure
  if (geoJson.features.length > 0) {
      const feature = geoJson.features[0];
      if (!feature || typeof feature !== 'object') return false;
      if (feature.type !== 'Feature') return false;
      if (!feature.geometry || !feature.properties) return false;
  }

  return true;
};

/**
 * Validates Country Data from API.
 * @param {object} data - The country data object.
 * @returns {boolean} - True if valid.
 */
export const validateCountryData = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;

  // Must have name.common and cca3 (ISO code)
  if (!data.name || typeof data.name !== 'object') return false;
  if (typeof data.name.common !== 'string') return false;
  if (typeof data.cca3 !== 'string') return false;

  return true;
};

/**
 * Validates Cache Structure from localStorage.
 * @param {object} cache - The parsed cache object.
 * @returns {boolean} - True if valid.
 */
export const validateCacheStructure = (cache) => {
    if (!cache || typeof cache !== 'object' || Array.isArray(cache)) return false;

    // Check a sample key if any exist
    const keys = Object.keys(cache);
    if (keys.length === 0) return true; // Empty cache is valid

    // Validate a few random keys to ensure structure
    // We check up to 3 keys to be fast
    for (let i = 0; i < Math.min(keys.length, 3); i++) {
        const key = keys[i];
        if (!isValidCountryCode(key)) return false; // Key must be country code

        const entry = cache[key];
        if (!entry || typeof entry !== 'object') return false;
        if (!entry.data || typeof entry.timestamp !== 'number') return false;
    }

    return true;
};
