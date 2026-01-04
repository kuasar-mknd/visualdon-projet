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
 * Validates if a filename is safe (alphanumeric, dots, dashes, underscores).
 * Prevents path traversal attacks (e.g. "../", "/etc/passwd").
 * @param {string} filename - The filename to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const isValidFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return false;
  // Allow alphanumeric, dot, dash, underscore.
  // Must not contain slash, backslash, or start/end with dot/space.
  return /^[a-zA-Z0-9_.-]+$/.test(filename) && !filename.includes('..');
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
