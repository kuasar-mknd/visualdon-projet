# Palette's Journal

## Critical Learnings

| Date | Pattern | Notes |
|------|---------|-------|
| 2024-05-23 | D3 Focus Management | D3 charts in this project use a hybrid focus model. Elements have `tabindex="0"` and listen for `focus` events to trigger visual updates (opacity/stroke). Standard `outline` is often suppressed in favor of SVG attributes. When modifying charts, ensure `focus` listeners are paired with `mouseover` listeners for consistent behavior. |
| 2024-05-23 | Contrast in D3 | The project uses a light theme (`glass-panel-light`, `bg-white`). Several D3 charts (specifically `StackedAreaChart`) were copying dark-mode styles (light text), making them invisible. Always verify the parent container's background color when styling SVG text. |
