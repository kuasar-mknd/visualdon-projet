export const logger = {
  info: (...args) => {
    if (import.meta.env.DEV) {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (import.meta.env.DEV) {
      console.warn(...args);
    } else {
      // In production, log a sanitized/generic error message
      const sanitizedArgs = args.map(arg => {
        if (arg instanceof Error) {
          return arg.message; // Do not log full stack traces
        }
        // eslint-disable-next-line no-control-regex
        return typeof arg === 'string' ? arg.substring(0, 500).replace(/[\u0000-\u001F\u007F-\u009F]/g, "") : arg;
      });
      console.warn(...sanitizedArgs);
    }
  },
  error: (...args) => {
    if (import.meta.env.DEV) {
      console.error(...args);
    } else {
      // In production, log a sanitized/generic error message
      const sanitizedArgs = args.map(arg => {
        if (arg instanceof Error) {
          return arg.message; // Do not log full stack traces
        }
        // eslint-disable-next-line no-control-regex
        return typeof arg === 'string' ? arg.substring(0, 500).replace(/[\u0000-\u001F\u007F-\u009F]/g, "") : arg;
      });
      console.error(...sanitizedArgs);
    }
  },
};
