/**
 * Centralized logging utility for the application.
 * Sanitizes log outputs to prevent data leaks (e.g. truncated long strings, control chars removed).
 * In production, error stack traces are suppressed.
 */

const MAX_LOG_LENGTH = 500;

/**
 * Sanitizes any data into a safe string representation for logging.
 *
 * @param {any} data - The data to sanitize
 * @returns {string} - The sanitized string representation
 */
const sanitizeForLog = (data) => {
  if (data === null || data === undefined) {
    return String(data);
  }

  let strOutput;

  try {
    if (typeof data === 'object') {
      if (data instanceof Error) {
        // Only log the message in production, keep stack trace in dev
        strOutput = import.meta.env.DEV ? data.stack || data.message : data.message;
      } else {
        strOutput = JSON.stringify(data);
      }
    } else {
      strOutput = String(data);
    }
  } catch {
    strOutput = '[Un-serializable Data]';
  }

  // Fallback if stringification results in undefined/null somehow
  strOutput = String(strOutput || '');

  // Remove control characters (e.g. \n, \r, \t, etc) to prevent log injection
  // eslint-disable-next-line no-control-regex
  strOutput = strOutput.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');

  // Truncate overly long messages
  if (strOutput.length > MAX_LOG_LENGTH) {
    strOutput = strOutput.substring(0, MAX_LOG_LENGTH) + '... [TRUNCATED]';
  }

  return strOutput;
};

const formatLogArgs = (args) => {
  return args.map(sanitizeForLog).join(' ');
};

export const logger = {
  info: (...args) => {
    console.log(formatLogArgs(args));
  },
  warn: (...args) => {
    console.warn(formatLogArgs(args));
  },
  error: (...args) => {
    console.error(formatLogArgs(args));
  }
};
