# Bolt's Journal ⚡

## Critical Architectural Bottlenecks
- **Pattern:** Redundant parsing of numeric data.
- **Fix:** Removed `parseFloat` calls in hot paths (rendering loops, memos) after verifying that `d3.autoType` correctly handles type conversion at the ingestion layer.
- **Pattern:** Excessive re-renders on window resize.
- **Fix:** Added debouncing to `ResizeObserver` callbacks in responsive chart components.
- **Pattern:** Large D3 bundle size.
- **Fix:** Replaced `import * as d3` with named imports (e.g., `import { select } from 'd3'`) to enable tree-shaking.
- **Pattern:** Missing `will-change` on complex animations.
- **Fix:** Added `will-change-transform` to heavy overlay transitions.
- **Pattern:** N+1 API Requests for country details.
- **Fix:** Implemented `fetchCountriesDetails` (batch fetch) in `countryService.js` using `?codes=` endpoint.
- **Pattern:** Layout thrashing during D3 animations.
- **Fix:** Disabled `d3.interpolateNumber` text tweening when `isPlaying` is true in `TopCountriesChart.jsx`.
- **Pattern:** Conflicting keyboard event handlers.
- **Fix:** Added `e.target.closest` check in global keyboard listeners to ignore events from specialized components (Globe).

## Failed Experiments
- **Experiment:** Decreasing `d3.geoOrthographic().precision()` to `0.1`.
- **Outcome:** **Failed**. I misunderstood the API. Lower precision values in D3 Geo actually *increase* the resampling density (adaptive resampling threshold), leading to *higher* overhead, not lower. The default (approx 0.7) is a better balance. To optimize, one would usually increase this value or disable it, but for this visual quality, defaults are best.
