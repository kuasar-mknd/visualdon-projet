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
- **Hybrid Focus Model:** When implementing accessible D3 charts, active elements should retain full opacity and gain a high-contrast stroke (e.g., White `#ffffff`), while background elements fade. This mimics the hover interaction for keyboard users.
- **Invisible Focus Trap:** When removing default browser outlines (`outline-none`) from interactive SVG elements to improve aesthetics, you *must* immediately implement a custom visual focus state (via JS events or CSS). Failing to do so renders the element "invisible" to sighted keyboard users.
