/**
 * Centralized logging utility to prevent data leaks and sanitize log outputs.
 *
 * Security Enhancements:
 * 1. Sanitizes string inputs to remove control characters (prevents log injection).
 * 2. Truncates excessively long logs to prevent DoS via log bloat.
 * 3. Safely serializes objects, handling circular references and un-serializable types.
 * 4. Suppresses full error stack traces in production to prevent leaking system details.
 */

const MAX_LOG_LENGTH = 500;
const IS_DEV = import.meta.env.DEV;

/**
 * Safely converts any input into a sanitized string.
 * @param {*} input - The value to sanitize.
 * @returns {string} The sanitized string representation.
 */
const sanitizeLogInput = (input) => {
  let strInput = '';

  if (input === null || input === undefined) {
    return String(input);
  }

  if (input instanceof Error) {
    // In production, only log the error message, not the full stack trace
    strInput = IS_DEV ? (input.stack || input.message) : input.message;
  } else if (typeof input === 'object') {
    try {
      // Attempt safe stringification
      strInput = JSON.stringify(input, (key, value) => {
        if (typeof value === 'function' || typeof value === 'symbol') {
          return `[${typeof value}]`;
        }
        return value;
      });
    } catch {
      strInput = '[Unserializable Object]';
    }
  } else {
    strInput = String(input);
  }

  // Ensure it's a string, just in case
  strInput = String(strInput || '');

  // Remove control characters to prevent log injection
  // eslint-disable-next-line no-control-regex
  strInput = strInput.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  // Truncate long strings
  if (strInput.length > MAX_LOG_LENGTH) {
    return strInput.substring(0, MAX_LOG_LENGTH) + '... [TRUNCATED]';
  }

  return strInput;
};

/**
 * Formats multiple arguments into a single sanitized string.
 * @param {Array} args - Arguments passed to the logger.
 * @returns {string} Formatted log string.
 */
const formatArgs = (args) => {
  return args.map(sanitizeLogInput).join(' ');
};

const logger = {
  info: (...args) => {
    console.log(formatArgs(args));
  },
  warn: (...args) => {
    console.warn(formatArgs(args));
  },
  error: (...args) => {
    console.error(formatArgs(args));
  }
};

export default logger;
