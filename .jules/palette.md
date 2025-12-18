## 2024-05-23 - Keyboard Focus Accessibility
**Learning:** Standard browser focus rings are often suppressed or insufficient in modern CSS frameworks like Tailwind when not explicitly configured, especially for custom-styled buttons and range inputs.
**Action:** Always verify keyboard navigation and add `focus-visible:ring-2` (or similar) to interactive elements that lack explicit focus states.

## 2024-05-24 - Animated Overlay Visibility
**Learning:** When animating overlays with `opacity` and `transform`, simply using `pointer-events-none` leaves the content in the accessibility tree and tab order.
**Action:** Use `invisible` (which applies `visibility: hidden`) in the closed state. Combined with `transition-all`, this correctly waits for the transition to finish before hiding the element from screen readers and keyboard navigation.
