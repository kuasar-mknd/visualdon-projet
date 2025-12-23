## 2024-02-14 - Unnecessary Re-renders in Hidden Overlays
**Learning:** Hidden overlays (using CSS visibility/opacity) that are still mounted can trigger expensive re-renders of complex child trees if they receive rapidly changing props (like animation timestamps), even if those props are unused by the overlay itself.
**Action:** Always inspect props passed to "inactive" or hidden components. Decouple high-frequency state (like animation ticks) from static or lazily-loaded UI components using `React.memo` and prop pruning.
