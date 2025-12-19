# Palette's Journal 🎨

## Critical Learnings

### Accessibility
- **SVG Charts:** Interactive SVG charts (D3) require `role="graphics-document"`, `<title>`, and `<desc>` tags to be accessible to screen readers. Bars/elements inside should be focusable if interactive.
- **Decorative Icons:** Icons next to text links must be hidden with `aria-hidden="true"` to avoid redundant announcements.
- **Dynamic Content:** Updates to charts (like year changes) should use `aria-live` regions or be announced politely if they don't shift focus.

### UX Decisions
- **Empty States:** Charts must explicitely handle "No Data" states rather than rendering empty axes, which can be confusing.
- **Hardcoded Text:** All UI text must be routed through `LanguageContext` to support the bilingual nature of the app.
