# Plain A11y: specification

## What we build
A Chrome extension (Manifest V3) that checks the open page for accessibility problems and shows the result in plain language for people who do not know WCAG: designers, content managers, product managers.

## For every problem found we show
- what is wrong, in simple words;
- who it affects;
- how to fix it;
- the role to hand the task to: design, content or code;
- the severity: critical, serious or minor.

## Stack (do not change without a request)
- Chrome, Manifest V3
- TypeScript in strict mode
- React for the popup
- WXT as the build tool
- axe-core for the check; do not write own rules in stages 1-4
- Vitest for tests

## Hard limits
- No backend, accounts, analytics or network requests.
- Permissions only: activeTab, scripting, storage.
- All code lives inside the package, no remotely loaded scripts.
- Pin the axe-core version to an exact number in package.json.
- The extension's own interface meets WCAG 2.2 AA: keyboard control, visible focus, contrast of at least 4.5:1, click targets of at least 24x24 px.

## Repository structure
- src/popup: React interface
- src/background: service worker
- src/content: running axe-core on the page
- src/dictionary: the rule dictionary (axe rule id, plain description, role, advice)
- src/report: grouping and export to Markdown
- tests: unit tests and page fixtures
- tasks: task files

## Dictionary entry format
axe rule id, title, whoIsAffected, howToFix, role (design, content or code).

## Out of scope
Own checks beyond axe-core, interface translation, cloud sync. These are separate stages after the base.
