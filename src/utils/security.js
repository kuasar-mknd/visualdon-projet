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
  return /^[a-zA-Z]{2,3}$/.test(code);
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

  // Validate hash format (SHA-256 hex string)
  const hashKeys = ['emissionsHash', 'perCapitaHash', 'geoJsonHash'];
  const isHashValid = hashKeys.every(key => /^[a-fA-F0-9]{64}$/.test(manifest[key]));

  return isHashValid;
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

  // Check at least one feature structure if not empty
  if (geoJson.features.length > 0) {
    const firstFeature = geoJson.features[0];
    if (!firstFeature || typeof firstFeature !== 'object') return false;
    if (firstFeature.type !== 'Feature') return false;
    if (!firstFeature.geometry || typeof firstFeature.geometry !== 'object') return false;
  }

  return true;
};

/**
 * Validates if a year is valid.
 * @param {number|string} year - The year to validate.
 * @param {number} min - Minimum allowed year.
 * @param {number} max - Maximum allowed year.
 * @returns {boolean} - True if valid.
 */
export const isValidYear = (year, min = 1750, max = new Date().getFullYear() + 5) => {
  const y = parseInt(year, 10);
  if (isNaN(y)) return false;
  return y >= min && y <= max;
};
