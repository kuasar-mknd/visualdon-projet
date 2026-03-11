/**
 * Secure logging utility that sanitizes inputs and suppresses stack traces in production.
 */

const isProd = import.meta.env ? !import.meta.env.DEV : true;

/**
 * Sanitizes an input string or object for safe logging.
 * Truncates long strings to prevent DoS via massive logs.
 * Removes control characters to prevent log injection/terminal escape sequence attacks.
 *
 * @param {any} input - The value to sanitize
 * @param {number} maxLength - Maximum allowed length (default 500)
 * @returns {string} Sanitized string representation
 */
const sanitizeLogInput = (input, maxLength = 500) => {
  if (input === null || input === undefined) return '';

  let strInput = '';

  if (typeof input === 'object') {
    if (input instanceof Error) {
        strInput = isProd ? input.message : (input.stack || input.message);
    } else {
        try {
          strInput = JSON.stringify(input);
        } catch {
          // Fallback if un-serializable (e.g., circular ref, BigInt)
          strInput = String(input || '');
        }
    }
  } else {
      strInput = String(input || '');
  }

  // Truncate
  if (strInput.length > maxLength) {
    strInput = strInput.substring(0, maxLength) + '... [TRUNCATED]';
  }

  // Remove control characters (ASCII 0-31 and 127-159)
  // eslint-disable-next-line no-control-regex
  return strInput.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
};

export const logger = {
  info: (...args) => {
    const sanitizedArgs = args.map(arg => sanitizeLogInput(arg));
    console.info(...sanitizedArgs);
  },

  warn: (...args) => {
    const sanitizedArgs = args.map(arg => sanitizeLogInput(arg));
    console.warn(...sanitizedArgs);
  },

  error: (...args) => {
    const sanitizedArgs = args.map(arg => sanitizeLogInput(arg));
    console.error(...sanitizedArgs);
  }
};
