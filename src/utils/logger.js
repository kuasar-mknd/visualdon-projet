export const sanitizeLogInput = (input) => {
  let strInput;
  if (input instanceof Error) {
    strInput = input.message;
  } else if (typeof input === 'object') {
    try {
      strInput = JSON.stringify(input);
    } catch {
      strInput = String(input ?? '');
    }
  } else {
    strInput = String(input ?? '');
  }

  // eslint-disable-next-line no-control-regex
  let sanitized = strInput.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500) + '...';
  }

  return sanitized;
};

export const logger = {
  warn: (...args) => {
    const sanitizedArgs = args.map(sanitizeLogInput);
    console.warn(...sanitizedArgs);
  },
  error: (...args) => {
    const sanitizedArgs = args.map(sanitizeLogInput);
    console.error(...sanitizedArgs);
  }
};
