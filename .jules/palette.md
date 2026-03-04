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
- **Focus Rings:** Use `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500` consistently for interactive elements (buttons, links, selects) across the application to provide clear focus states. Do not use plain `focus:ring-2` to avoid ring on click.
- **Hidden SVGs:** Always add `aria-hidden="true"` to decorative SVGs (like icons in buttons or hints) to prevent redundant screen reader noise.
