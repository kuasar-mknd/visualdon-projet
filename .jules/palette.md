# Palette's Journal

## Critical Learnings
- **Contrast:** `text-slate-400` fails WCAG AA on white backgrounds. Always use `text-slate-500` or darker for essential text (placeholders, empty states, loading text).
- **Focus:** Interactive elements must have `focus-visible` styles to support keyboard navigation.
- **Labels:** All icon-only buttons must have `aria-label`.

## Clusters
### The Contrast (Fixing `text-slate-400`)
- **Pattern:** Low contrast text used for loading/empty states.
- **Fix:** Upgrade to `text-slate-500`.
- **Status:** In Progress.
