# TASK-5: Accessibility of the extension itself

Goal: the extension's interface passes an automated check and a manual checklist.

## Steps
1. Add a test that renders the popup (all states: empty, loading, result, error) and runs axe-core on it. Zero violations is allowed.
2. Create docs/a11y-checklist.md with manual checks: Tab order, visible focus, announcing the result through aria-live, contrast of at least 4.5:1, click targets of at least 24x24 px, behavior with prefers-reduced-motion and prefers-color-scheme.
3. Fix the problems found.

## Acceptance criteria
- All checks from earlier stages pass.
- The axe test on all popup states passes without violations.
- The checklist is created and marks what the agent did and what needs a person with a screen reader.
