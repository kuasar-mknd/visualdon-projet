// Simple centralized logger
export const logger = {
  info: (...args) => {
    if (import.meta.env.DEV) console.log(...args);
  },
  warn: (...args) => {
    if (import.meta.env.DEV) console.warn(...args);
  },
  error: (...args) => {
    // Sanitize in production, let it flow in dev
    if (import.meta.env.DEV) {
      console.error(...args);
    } else {
      // Basic sanitization
      const safeArgs = args.map(arg => {
        try {
          if (typeof arg === 'string') {
             // eslint-disable-next-line no-control-regex
             return arg.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').substring(0, 500);
          }
          if (arg instanceof Error) {
            // eslint-disable-next-line no-control-regex
            return arg.message.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').substring(0, 500);
          }
          // eslint-disable-next-line no-control-regex
          return String(arg).replace(/[\u0000-\u001F\u007F-\u009F]/g, '').substring(0, 500);
        } catch {
          return '[Un-serializable object]';
        }
      });
      console.error(...safeArgs);
    }
  }
};
