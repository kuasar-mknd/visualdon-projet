## 2025-02-14 - Modal Focus Management
**Learning:** Modals that don't capture focus leave keyboard users stranded in the previous context, requiring them to tab through the entire page to reach the new content.
**Action:** Always implement focus trapping or at least initial focus placement (on the close button or first interactive element) when opening overlays/modals, and restore focus to the trigger element on close.

## 2025-02-15 - Dynamic Feedback on Form Controls
**Learning:** For imprecise inputs like sliders, users often struggle to confirm the exact value without immediate visual feedback near the control. Relying on distant headers or labels breaks the user's visual flow.
**Action:** Implement dynamic feedback labels that appear on hover or focus (using `group-hover` and `group-focus-within`) directly adjacent to the control to provide "just-in-time" context without cluttering the UI when inactive.