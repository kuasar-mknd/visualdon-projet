/**
 * Centralized secure logging utility.
 * Sanitizes inputs (truncating, removing control characters).
 * Suppresses stack traces by extracting the .message property from Error objects.
 */

const sanitizeLog = (input) => {
  if (input instanceof Error) {
    input = input.message;
  } else if (typeof input === 'object' && input !== null) {
    try {
      input = JSON.stringify(input);
    } catch {
      input = String(input ?? '');
    }
  } else {
    input = String(input ?? '');
  }

  // Truncate to 500 characters
  if (input.length > 500) {
    input = input.substring(0, 500) + '...';
  }

  // Remove control characters to prevent log injection
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
};

const formatMessage = (args) => {
  return args.map(sanitizeLog).join(' ');
};

const logger = {
  info: (...args) => {
    console.info(formatMessage(args));
  },
  warn: (...args) => {
    console.warn(formatMessage(args));
  },
  error: (...args) => {
    console.error(formatMessage(args));
  }
};

export default logger;
