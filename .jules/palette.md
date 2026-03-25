# Palette's Journal 🎨

## Philosophy
"Consistency is Comfort."
- **Scale:** Fixing one button is nice; fixing all buttons is professional.
- **Invisibility:** Good UX shouldn't be noticed; it should just feel "right".
- **Accessibility:** It's not a feature; it's a requirement.

## Learned Patterns (Project Specific)
- **Status Updates:** Use `role="status"` with `aria-live="polite"` for elements that update automatically (like the Year display) or indicate loading/empty states, to ensure screen readers announce changes without interrupting the user.
- **External Links:** Always append "(opens in a new tab)" to the `aria-label` of links with `target="_blank"` to warn users of context changes.
- **Dialog Descriptions:** Ensure modals have `aria-describedby` pointing to a summary or description, even if hidden, to provide context beyond the title.
- **D3 Focus States:** For SVG-based visualizations (like maps or bar charts), use explicit visual cues (e.g., `stroke-white`, `opacity-100`) on `focus` combined with `tabindex="0"` and `role="button"` (or `listitem`) to ensure keyboard users can navigate and perceive the active element. Standard browser focus rings are often insufficient or invisible on complex SVG paths.

### Focus States (Keyboard vs. Mouse Navigation)
* **Pattern**: Interactive elements (buttons, links, selects, and inputs like checkboxes) should consistently use `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none` directly on the focusable element across the application.
* **Why**: This provides clear focus states on keyboard navigation without displaying a ring on mouse click. Avoid using plain `focus:ring-2` or `focus-within` on wrapper elements (e.g. wrapper labels for inputs), as it forces the ring for pointer users, breaking standard visual expectations.
* **Exceptions**: `focus-visible` must be applied precisely to the element receiving focus (e.g. `<input type="checkbox">` or `<select>`), not their semantic containers.

### Accessibility Tooltips
* **Pattern**: For icon-only or shortened interactive elements (e.g., language toggle buttons "EN"/"FR"), ensure the `title` attribute dynamically matches the translated `aria-label` (e.g., `title={t('aria.switchToEnglish')}`).
* **Why**: Prevents mismatched or hardcoded English tooltips from appearing in different locales, ensuring consistent accessibility for both screen readers and visual tooltips.
