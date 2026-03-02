/**
 * Centralized secure logger utility.
 * Sanitizes log messages to prevent injection and limits stack trace exposure
 * in production environments.
 */

// Helper to sanitize log messages
const sanitizeLog = (message) => {
  if (typeof message !== 'string') {
    try {
      message = JSON.stringify(message);
    } catch (e) { // eslint-disable-line no-unused-vars
      return '[Unserializable Object]';
    }
  }

  // Truncate to 500 characters
  let sanitized = message.length > 500 ? message.substring(0, 500) + '... [TRUNCATED]' : message;

  // Remove control characters to prevent log injection
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  return sanitized;
};

// Helper to safely extract error messages
const safeError = (error) => {
  if (error instanceof Error) {
    if (import.meta.env.DEV) {
      return error;
    }
    // In production, suppress stack trace and return sanitized message
    return new Error(sanitizeLog(error.message));
  }
  return sanitizeLog(error);
};

export const logger = {
  info: (message, ...optionalParams) => {
    console.log(sanitizeLog(message), ...optionalParams.map(p => typeof p === 'string' ? sanitizeLog(p) : p));
  },
  warn: (message, ...optionalParams) => {
    console.warn(sanitizeLog(message), ...optionalParams.map(p => typeof p === 'string' ? sanitizeLog(p) : p));
  },
  error: (message, error) => {
    if (error !== undefined) {
      console.error(sanitizeLog(message), safeError(error));
    } else {
      console.error(safeError(message));
    }
  }
};
