/**
 * Centralized logging utility for sanitizing and formatting logs safely.
 */

const sanitizeLog = (message) => {
  if (message === null || message === undefined) return '';

  let strMessage = '';

  if (message instanceof Error) {
    strMessage = String(message.message || 'Unknown Error');
  } else if (typeof message === 'object') {
    try {
      strMessage = String(JSON.stringify(message));
    } catch {
      strMessage = String(message);
    }
  } else {
    strMessage = String(message);
  }

  // Remove control characters
  // eslint-disable-next-line no-control-regex
  strMessage = strMessage.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  // Truncate to 500 characters
  if (strMessage.length > 500) {
    strMessage = strMessage.substring(0, 497) + '...';
  }

  return strMessage;
};

const logger = {
  info: (...args) => {
    const sanitizedArgs = args.map(sanitizeLog);
    console.info(...sanitizedArgs);
  },
  warn: (...args) => {
    const sanitizedArgs = args.map(sanitizeLog);
    console.warn(...sanitizedArgs);
  },
  error: (...args) => {
    const sanitizedArgs = args.map(sanitizeLog);
    console.error(...sanitizedArgs);
  }
};

export default logger;
