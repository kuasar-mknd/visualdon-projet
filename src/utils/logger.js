/**
 * Centralized logging utility for safe and secure log output.
 */

const IS_DEV = import.meta.env.DEV;

/**
 * Sanitizes log input to prevent injection attacks and limit data exposure.
 * Truncates to 500 characters and removes control characters.
 * @param {any} input - The input to sanitize.
 * @returns {string} - The sanitized string.
 */
const sanitizeLogInput = (input) => {
  if (input === null || input === undefined) return '';

  // Convert objects/errors to string representations safely
  let strInput;
  if (input instanceof Error) {
    strInput = input.message;
  } else if (typeof input === 'object') {
    try {
      strInput = JSON.stringify(input);
    } catch {
      strInput = '[Unserializable Object]';
    }
  } else {
    strInput = String(input);
  }

  // Ensure strInput is a string in case JSON.stringify returned undefined
  strInput = String(strInput || '');

  // Truncate
  if (strInput.length > 500) {
    strInput = strInput.substring(0, 500) + '...[TRUNCATED]';
  }

  // Remove control characters (except common whitespace like tab/newline if needed, but here we strip them for safety in single-line logs)
  // eslint-disable-next-line no-control-regex
  return strInput.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
};

const logger = {
  info: (...args) => {
    const sanitizedArgs = args.map(sanitizeLogInput);
    console.info(...sanitizedArgs);
  },
  warn: (...args) => {
    const sanitizedArgs = args.map(sanitizeLogInput);
    console.warn(...sanitizedArgs);
  },
  error: (...args) => {
    const sanitizedArgs = args.map(sanitizeLogInput);

    // In production, suppress detailed error objects (like stack traces)
    if (!IS_DEV) {
      console.error(...sanitizedArgs);
    } else {
      // In dev, we can log the raw error for debugging purposes if needed
      // But we still log the sanitized version as the primary message
      console.error(...sanitizedArgs);

      // If the last argument is an Error object, log it for local debugging
      const lastArg = args[args.length - 1];
      if (lastArg instanceof Error) {
        console.error('[DEV ONLY STACK]', lastArg);
      }
    }
  }
};

export default logger;
