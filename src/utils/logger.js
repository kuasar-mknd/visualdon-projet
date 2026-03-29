/**
 * Centralized logging utility for the frontend application.
 * Follows defense-in-depth principles by sanitizing inputs and
 * preventing stack trace leaks from error objects.
 */

// Internal helper to sanitize string inputs
const sanitizeLogInput = (input) => {
  try {
    const str = typeof input === 'string' ? input : String(input ?? '');
    // Remove control characters (except common whitespace like \n, \t)
    // eslint-disable-next-line no-control-regex
    const noControlChars = str.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
    // Truncate to a reasonable length to prevent log flooding
    return noControlChars.length > 500 ? noControlChars.substring(0, 500) + '... [truncated]' : noControlChars;
  } catch {
    return '[Un-serializable Log Input]';
  }
};

// Internal helper to process error objects securely
const processError = (err) => {
  if (err instanceof Error) {
    // Extract only the message to prevent stack trace leaks
    return err.message || 'Unknown Error';
  }
  return typeof err === 'string' ? err : 'Unknown Error';
};

export const logger = {
  /**
   * Logs a warning message safely.
   * @param {string} msg - The main log message.
   * @param {any} [err] - Optional error object or additional info.
   */
  warn: (msg, err) => {
    const safeMsg = sanitizeLogInput(msg);
    if (err !== undefined) {
      const safeErr = sanitizeLogInput(processError(err));
      console.warn(`[WARN] ${safeMsg} | ${safeErr}`);
    } else {
      console.warn(`[WARN] ${safeMsg}`);
    }
  },

  /**
   * Logs an error message safely.
   * @param {string} msg - The main log message.
   * @param {any} [err] - Optional error object or additional info.
   */
  error: (msg, err) => {
    const safeMsg = sanitizeLogInput(msg);
    if (err !== undefined) {
      const safeErr = sanitizeLogInput(processError(err));
      console.error(`[ERROR] ${safeMsg} | ${safeErr}`);
    } else {
      console.error(`[ERROR] ${safeMsg}`);
    }
  }
};

export default logger;
