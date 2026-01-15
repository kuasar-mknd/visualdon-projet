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

  // Validate presence, type, and format of keys
  return requiredKeys.every(key => {
    if (!Object.prototype.hasOwnProperty.call(manifest, key)) return false;
    if (typeof manifest[key] !== 'string') return false;
    if (manifest[key].length === 0) return false;

    // Security Enhancement: Validate hash format (SHA-256 hex string)
    if (key.endsWith('Hash')) {
        return /^[a-f0-9]{64}$/i.test(manifest[key]);
    }

    return true;
  });
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

  // Security Enhancement: Validate at least one feature if present to ensure structure
  if (geoJson.features.length > 0) {
      const firstFeature = geoJson.features[0];
      if (!firstFeature || typeof firstFeature !== 'object') return false;
      if (firstFeature.type !== 'Feature') return false;
      // Geometry and Properties are required by Spec
      if (!Object.prototype.hasOwnProperty.call(firstFeature, 'geometry')) return false;
      if (!Object.prototype.hasOwnProperty.call(firstFeature, 'properties')) return false;
  }

  return true;
};

/**
 * Validates if a year is within a reasonable range.
 * @param {number} year - The year to validate.
 * @returns {boolean} - True if valid.
 */
export const isValidYear = (year) => {
    if (typeof year !== 'number' || isNaN(year)) return false;
    // Data starts around 1750, allow future years slightly for forecasts or clock drift
    const currentYear = new Date().getFullYear();
    return year >= 1750 && year <= currentYear + 5;
};

/**
 * Validates a hex color string.
 * @param {string} color - The color string.
 * @returns {boolean} - True if valid hex color.
 */
export const isValidColor = (color) => {
    if (!color || typeof color !== 'string') return false;
    return /^#[0-9A-F]{6}$/i.test(color);
};
