# Bolt's Journal ⚡

## Critical Architectural Bottlenecks
- **Pattern:** Redundant parsing of numeric data.
- **Fix:** Removed `parseFloat` calls in hot paths (rendering loops, memos) after verifying that `d3.autoType` correctly handles type conversion at the ingestion layer.
- **Pattern:** Excessive re-renders on window resize.
- **Fix:** Added debouncing to `ResizeObserver` callbacks in responsive chart components.
- **Pattern:** Mixed static and high-frequency dynamic content in large components (`Header`, `Controls`).
- **Fix:** Split components into static (memoized) and dynamic parts to isolate high-frequency re-renders (e.g., Year slider/display) from static UI (Titles, Buttons).
- **Pattern:** React reconciliation overhead for high-frequency interactive elements (Globe highlight).
- **Fix:** Replaced React-controlled SVG path for hover highlights with a static D3-controlled path to bypass React's diffing algorithm during rapid mouse movements.

## Failed Experiments
- **Experiment:** Decreasing `d3.geoOrthographic().precision()` to `0.1`.
- **Outcome:** **Failed**. I misunderstood the API. Lower precision values in D3 Geo actually *increase* the resampling density (adaptive resampling threshold), leading to *higher* overhead, not lower. The default (approx 0.7) is a better balance. To optimize, one would usually increase this value or disable it, but for this visual quality, defaults are best.
