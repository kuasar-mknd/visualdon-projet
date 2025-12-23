## 2025-02-16 - Accessible Data Visualization (D3)
**Learning:** Complex D3 visualizations are often invisible to keyboard users and screen readers. SVG elements are not focusable by default.
**Action:** Implemented a robust pattern for D3 charts:
1.  **Structure:** Group interactive elements (like legend items) in `<g>` tags with `role="button"` and `tabindex="0"`.
2.  **Interaction:** Map `keydown` events (Enter/Space) to mimic `click` behavior.
3.  **Robustness:** `ResizeObserver` can report 0-width in headless/hidden states, preventing initial render. Always provide a fallback dimension (e.g., `clientWidth || 500`) to ensure the chart renders and becomes accessible even in edge cases.
