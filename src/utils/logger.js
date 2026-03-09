/**
 * Centralized logging utility for the application.
 * Sanitizes inputs, truncates long strings, removes control characters to prevent log injection,
 * and suppresses stack traces in production environments.
 */

// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F-\u009F]/g;

const sanitizeInput = (input) => {
  let strInput;
  if (typeof input === 'string') {
    strInput = input;
  } else if (input instanceof Error) {
    // Only include message to avoid stack trace leakage if not explicitly handled below
    strInput = input.message;
  } else {
    try {
      strInput = JSON.stringify(input);
    } catch {
      strInput = String(input);
    }
  }

  // Cast final output to string safely
  strInput = String(strInput || '');

  // Remove control characters
  strInput = strInput.replace(CONTROL_CHAR_REGEX, '');

  // Truncate to 500 characters
  if (strInput.length > 500) {
    strInput = strInput.substring(0, 500) + '... [TRUNCATED]';
  }

  return strInput;
};

const formatMessage = (args) => {
  return args.map(arg => sanitizeInput(arg)).join(' ');
};

const logger = {
  info: (...args) => {
    console.info(formatMessage(args));
  },
  warn: (...args) => {
    console.warn(formatMessage(args));
  },
  error: (...args) => {
    const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;

    // Check if any argument is an Error to selectively log stack traces in DEV only
    const errors = args.filter(arg => arg instanceof Error);
    const sanitizedMsg = formatMessage(args);

    if (isDev && errors.length > 0) {
      console.error(sanitizedMsg);
      errors.forEach(err => {
         if (err.stack) console.error(err.stack);
      });
    } else {
      console.error(sanitizedMsg);
    }
  }
};

export default logger;
