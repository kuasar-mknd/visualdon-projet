## 2025-02-14 - Modal Focus Management
**Learning:** Modals that don't capture focus leave keyboard users stranded in the previous context, requiring them to tab through the entire page to reach the new content.
**Action:** Always implement focus trapping or at least initial focus placement (on the close button or first interactive element) when opening overlays/modals, and restore focus to the trigger element on close.
