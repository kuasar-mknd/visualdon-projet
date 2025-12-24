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
