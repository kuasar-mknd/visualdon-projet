const MAX_LOG_LENGTH = 500;

const sanitizeInput = (input) => {
  if (input === null || input === undefined) {
    input = String(input);
  } else if (input instanceof Error) {
    input = input.message;
  } else if (typeof input === 'object') {
    try {
      input = JSON.stringify(input);
    } catch {
      input = String(input);
    }
  } else {
    input = String(input);
  }

  // eslint-disable-next-line no-control-regex
  input = input.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  if (input.length > MAX_LOG_LENGTH) {
    input = input.substring(0, MAX_LOG_LENGTH) + '...';
  }

  return input;
};

export const logger = {
  info: (...args) => {
    const sanitizedArgs = args.map(sanitizeInput);
    console.info(...sanitizedArgs);
  },
  warn: (...args) => {
    const sanitizedArgs = args.map(sanitizeInput);
    console.warn(...sanitizedArgs);
  },
  error: (...args) => {
    const sanitizedArgs = args.map(sanitizeInput);
    console.error(...sanitizedArgs);
  }
};
