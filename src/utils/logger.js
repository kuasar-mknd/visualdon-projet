
/**
 * Centralized logging utility for the application.
 * Ensures consistent log formatting, sanitization, and level control.
 * In production, it suppresses debug logs and stack traces to prevent data leakage.
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = import.meta.env.DEV ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

/**
 * Sanitizes log messages to prevent log injection and reduce noise.
 * Truncates long strings and removes control characters.
 * @param {any} message - The message to sanitize.
 * @returns {string} - The sanitized message.
 */
const sanitizeMessage = (message) => {
  if (typeof message === 'string') {
    // Truncate to 500 chars to prevent DoS via massive log entries
    const truncated = message.length > 500 ? message.substring(0, 500) + '...' : message;
    // Remove control characters (except newline/tab) to prevent log forging
    // eslint-disable-next-line no-control-regex
    return truncated.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '');
  }
  if (message instanceof Error) {
    return message.message; // Only log message, not stack trace by default
  }
  try {
    return JSON.stringify(message).substring(0, 500);
  } catch {
    return '[Circular/Unserializable]';
  }
};

const logger = {
  debug: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.debug(`[DEBUG] ${sanitizeMessage(message)}`, ...args);
    }
  },
  info: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.info(`[INFO] ${sanitizeMessage(message)}`, ...args);
    }
  },
  warn: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${sanitizeMessage(message)}`, ...args);
    }
  },
  error: (message, error = null) => {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      const sanitizedMsg = sanitizeMessage(message);
      if (error && import.meta.env.DEV) {
        // In development, show full error object with stack
        console.error(`[ERROR] ${sanitizedMsg}`, error);
      } else {
        // In production, only show sanitized message
        console.error(`[ERROR] ${sanitizedMsg}`);
      }
    }
  },
};

export default logger;
