/**
 * Centralized logging utility for safe, sanitized logging.
 * Prevents log injection, stack trace leaks, and un-serializable object crashes.
 */

// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F-\u009F]/g;
const MAX_LOG_LENGTH = 500;

/**
 * Sanitizes a single argument for logging.
 * @param {*} arg - The argument to sanitize.
 * @returns {string} - The sanitized string representation.
 */
const sanitizeArg = (arg) => {
  let str = '';

  if (arg instanceof Error) {
    // Only extract message to prevent stack trace leaks
    str = arg.message;
  } else if (typeof arg === 'object' && arg !== null) {
    try {
      str = String(JSON.stringify(arg) ?? '');
    } catch {
      // Handle cyclic references or BigInts
      str = '[Unserializable Object]';
    }
  } else {
    str = String(arg ?? '');
  }

  // Remove control characters to prevent log injection
  str = str.replace(CONTROL_CHAR_REGEX, '');

  // Truncate to prevent DoS via massive logs
  if (str.length > MAX_LOG_LENGTH) {
    str = str.substring(0, MAX_LOG_LENGTH) + '... [TRUNCATED]';
  }

  return str;
};

/**
 * Sanitizes an array of arguments for logging.
 * @param {Array} args - The arguments to sanitize.
 * @returns {Array<string>} - The sanitized arguments.
 */
const sanitizeArgs = (args) => {
  return args.map(sanitizeArg);
};

export const logger = {
  info: (...args) => {
    console.info(...sanitizeArgs(args));
  },
  warn: (...args) => {
    console.warn(...sanitizeArgs(args));
  },
  error: (...args) => {
    console.error(...sanitizeArgs(args));
  },
  debug: (...args) => {
    console.debug(...sanitizeArgs(args));
  }
};
