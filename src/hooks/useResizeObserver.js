import { useEffect, useRef, useState } from 'react';

/**
 * A hook that observes the size of an element and returns its dimensions.
 * It includes debouncing to prevent excessive updates during resizing.
 *
 * @param {Object} options Configuration options
 * @param {number} options.debounceTime Time in ms to debounce the resize event (default: 100)
 * @param {Object} options.defaultDimensions Fallback dimensions if element is not ready
 * @returns {Array} [ref, dimensions] - ref to attach to the element, and dimensions object {width, height}
 */
export const useResizeObserver = ({ debounceTime = 100, defaultDimensions = { width: 0, height: 0 } } = {}) => {
  const ref = useRef(null);
  const [dimensions, setDimensions] = useState(defaultDimensions);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return;

      const entry = entries[entries.length - 1];
      const { width, height } = entry.contentRect;

      // Clear existing timeout to debounce
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        // Only update if dimensions actually changed significantly (avoid sub-pixel jitter loop)
        setDimensions(prev => {
           if (Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1) {
               return prev;
           }
           return { width, height };
        });
      }, debounceTime);
    });

    observer.observe(element);

    // Initial size check
    const { clientWidth, clientHeight } = element;
    if (clientWidth && clientHeight) {
        setDimensions({ width: clientWidth, height: clientHeight });
    }

    return () => {
      observer.disconnect();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [debounceTime]);

  return [ref, dimensions];
};
