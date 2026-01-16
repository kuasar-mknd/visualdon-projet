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
  const keysValid = requiredKeys.every(key =>
    Object.prototype.hasOwnProperty.call(manifest, key) &&
    typeof manifest[key] === 'string' &&
    manifest[key].length > 0
  );

  if (!keysValid) return false;

  // Security Enhancement: Validate Hash Format (SHA-256 Hex)
  const hashRegex = /^[a-f0-9]{64}$/i;
  if (!hashRegex.test(manifest.emissionsHash)) return false;
  if (!hashRegex.test(manifest.perCapitaHash)) return false;
  // geoJsonHash might be empty if file missing (as per update-data.js logic), but if present should be valid
  if (manifest.geoJsonHash && manifest.geoJsonHash.length > 0 && !hashRegex.test(manifest.geoJsonHash)) return false;

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

  // Security Enhancement: Validate features structure
  // Iterate all features to ensure no malformed data that could crash D3
  for (const feature of geoJson.features) {
      if (!feature || typeof feature !== 'object') return false;
      if (feature.type !== 'Feature') return false;
      if (!feature.geometry || typeof feature.geometry !== 'object') return false;
      if (!feature.properties || typeof feature.properties !== 'object') return false;

      // Check geometry type
      const validGeometries = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection'];
      if (!validGeometries.includes(feature.geometry.type)) return false;
  }

  return true;
};

/**
 * Validates if a year is within a safe range.
 * @param {number|string} year - The year to validate.
 * @returns {boolean} - True if valid.
 */
export const isValidYear = (year) => {
    const y = parseInt(year, 10);
    if (isNaN(y)) return false;

    const currentYear = new Date().getFullYear();
    const minYear = 1750;
    const maxYear = currentYear + 5; // Allow slightly into future for projections or data updates

    return y >= minYear && y <= maxYear;
};
