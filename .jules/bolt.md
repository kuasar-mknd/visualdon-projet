# Bolt's Journal ⚡

## Critical Architectural Bottlenecks
- **Pattern:** Redundant parsing of numeric data.
- **Fix:** Removed `parseFloat` calls in hot paths (rendering loops, memos) after verifying that `d3.autoType` correctly handles type conversion at the ingestion layer.
- **Pattern:** Excessive re-renders on window resize.
- **Fix:** Added debouncing to `ResizeObserver` callbacks in responsive chart components.
- **Pattern:** Tween Animation Stashing.
- **Fix:** Implemented local value caching (`this._currentValue`) in D3 tweens to bypass DOM reads and parsing during high-frequency animation frames.
- **Pattern:** Monolithic Imports.
- **Fix:** Converted `import * as d3` to named imports across the codebase to facilitate tree-shaking.

## Failed Experiments
- **Experiment:** Decreasing `d3.geoOrthographic().precision()` to `0.1`.
- **Outcome:** **Failed**. I misunderstood the API. Lower precision values in D3 Geo actually *increase* the resampling density (adaptive resampling threshold), leading to *higher* overhead, not lower. The default (approx 0.7) is a better balance. To optimize, one would usually increase this value or disable it, but for this visual quality, defaults are best.
