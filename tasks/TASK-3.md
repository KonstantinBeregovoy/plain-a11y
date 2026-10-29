# TASK-3: Roles and severity

Goal: the report is grouped by severity and role, and an element can be highlighted on the page.

## Steps
1. In src/report write the function groupReport: groups by severity (critical, serious, minor; moderate and minor are merged into minor) and inside them by role (design, content, code).
2. The popup shows the groups with headings and the number of problems. There is a role filter.
3. Every problem has a “Show on page” button: the content script finds the element by the selector from axe, scrolls to it and outlines it with a frame for a while.
4. The highlight is removed by pressing the button again or when the popup closes. After removal the page DOM is the same as it was.
5. The filter and the buttons are fully accessible from the keyboard, and focus has a visible frame.

## Acceptance criteria
- All checks from earlier stages pass.
- Unit tests of groupReport: the order of groups, merging moderate with minor, an empty result.
- Test: after turning the highlight on and off, the page markup equals the original.

## Do not
Export, settings.
