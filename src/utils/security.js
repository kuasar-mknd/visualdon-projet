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

  // Validate presence and type of keys
  return requiredKeys.every(key =>
    Object.prototype.hasOwnProperty.call(manifest, key) &&
    typeof manifest[key] === 'string' &&
    manifest[key].length > 0
  );
};

/**
 * Validates a year.
 * @param {number|string} year - The year to validate.
 * @param {number} min - Minimum allowed year (default 1750).
 * @param {number} max - Maximum allowed year (default current year + 1).
 * @returns {boolean} - True if valid.
 */
export const isValidYear = (year, min = 1750, max = new Date().getFullYear() + 1) => {
  const y = Number(year);
  return !isNaN(y) && Number.isInteger(y) && y >= min && y <= max;
};

/**
 * Validates a hex color code.
 * @param {string} color - The color string.
 * @returns {boolean} - True if valid hex color.
 */
export const isValidColor = (color) => {
  if (!color || typeof color !== 'string') return false;
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color);
};

/**
 * Validates if a string contains only safe characters (letters, numbers, spaces, common punctuation).
 * Supports international characters (Unicode).
 * Useful for validating names, titles, etc.
 * @param {string} str - The string to validate.
 * @returns {boolean} - True if valid.
 */
export const isValidCountryName = (str) => {
  if (!str || typeof str !== 'string') return false;
  // Allow letters (unicode), numbers, spaces, hyphens, periods, parentheses, apostrophes, commas
  // Rejects scripts, control characters, etc.
  return /^[\p{L}\p{N}\s\-.,'()]+$/u.test(str);
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

  return true;
};
