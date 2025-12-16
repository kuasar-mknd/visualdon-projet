# BOLT'S JOURNAL

## 2025-12-16 - D3 and CSP Conflict
**Learning:** `d3.autoType` and `d3.csv` (v7+) use `new Function` for performance/parsing, which triggers `unsafe-eval` CSP violations. This blocks data loading in strict CSP environments.
**Action:** When working with D3 in a strict CSP environment, either relax CSP (risky) or implement a custom row converter function instead of `d3.autoType` to avoid `new Function` usage. For this task, I kept `d3.autoType` but noted the issue.

## 2025-12-16 - Animation Loop Optimization
**Learning:** Filtering a large array (50k+ items) inside a component render loop or `useMemo` that triggers on every animation frame (5fps+) causes significant main-thread work.
**Action:** Index time-series data by the time key (e.g., Year) into a Map/Object *once* on load. This reduces the per-frame lookup from O(N) to O(1), making animations buttery smooth.
