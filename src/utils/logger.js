/**
 * Utility for centralized logging with sanitization and stack trace suppression.
 */
import { sanitizeString } from './security.js';

const sanitizeData = (data) => {
  if (typeof data === 'string') {
    // Truncate to prevent log injection/flooding
    return sanitizeString(data).substring(0, 500);
  }
  return data;
};

export const logger = {
  info: (msg, ...args) => {
    if (import.meta.env.DEV) {
      console.log(sanitizeData(msg), ...args.map(sanitizeData));
    }
  },
  warn: (msg, ...args) => {
    console.warn(sanitizeData(msg), ...args.map(sanitizeData));
  },
  error: (msg, error) => {
    if (import.meta.env.DEV) {
      console.error(sanitizeData(msg), error);
    } else {
      // In production, suppress stack trace and only log sanitized message
      const safeErrorMsg = error instanceof Error ? error.message : String(error);
      console.error(sanitizeData(msg), sanitizeData(safeErrorMsg));
    }
  }
};
