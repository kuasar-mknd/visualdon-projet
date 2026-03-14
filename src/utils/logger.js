/**
 * Centralized logging utility to ensure consistent log sanitization and suppression of stack traces in production.
 */

// Define environment flag (fallback to production mode if undefined for safety)
const IS_DEV = import.meta && import.meta.env ? import.meta.env.DEV : process.env.NODE_ENV === 'development';

/**
 * Sanitizes input string to prevent control character injection and excessive log lengths.
 * @param {any} input - The input to sanitize.
 * @returns {string} - The sanitized string.
 */
const sanitizeLogInput = (input) => {
  let strInput;
  try {
    if (typeof input === 'object' && input !== null) {
      if (input instanceof Error) {
          strInput = input.message;
      } else {
          strInput = JSON.stringify(input);
      }
    } else {
      strInput = String(input ?? '');
    }
  } catch {
    strInput = String(input ?? '');
  }

  // eslint-disable-next-line no-control-regex
  const noControlChars = strInput.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  if (noControlChars.length > 500) {
    return noControlChars.substring(0, 500) + '... [TRUNCATED]';
  }

  return noControlChars;
};

const formatMessage = (message, meta) => {
    const safeMessage = sanitizeLogInput(message);
    if (meta !== undefined) {
        const safeMeta = sanitizeLogInput(meta);
        return `${safeMessage} | ${safeMeta}`;
    }
    return safeMessage;
};

export const logger = {
  info: (message, meta) => {
    console.info(formatMessage(message, meta));
  },
  warn: (message, meta) => {
    console.warn(formatMessage(message, meta));
  },
  error: (message, errorOrMeta) => {
    // Suppress stack trace in production (already handled by sanitizeLogInput which only extracts .message)
    const safeMessage = formatMessage(message, errorOrMeta);
    console.error(safeMessage);

    // In DEV, if it's an Error object, we can optionally log it separately to keep the trace
    if (IS_DEV && errorOrMeta instanceof Error) {
        console.error(errorOrMeta);
    }
  }
};
