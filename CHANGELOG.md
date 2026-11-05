# Changelog

All notable changes to the extension, newest first. The website has its own repository and history, and a short version of this list for users at https://a11y-ext.bereg.dev/changelog.

How it is kept: each version has a heading `## <version> - <date>`, with the date as `YYYY-MM-DD`. The date is the day the version first appeared in a store (the Chrome Web Store or addons.mozilla.org), not the day of the commit. A version that is still under review has no date yet and says “under review”; the date is filled in when the first store approves it. Changes are grouped under Added, Changed, Fixed, Privacy and Internal, and a stage's task file is named where there is one.

## 0.2.1 - under review

### Added
- Plain A11y for desktop Firefox 140 or newer (addons.mozilla.org). The same checks and the same three permissions; the manifest says that no data is collected. How to try the build and what was checked: `docs/FIREFOX.md` (`tasks/TASK-26.md`).

### Changed
- The kept result of a tab and the number on the icon are also dropped when a page changes its address without loading (`history.pushState`, a change of the `#fragment`) in Firefox, which reports these changes differently from Chrome. Nothing changes in Chrome.

### Privacy
- No change: the same three permissions, no network requests, no data collected.

### Internal
- The manifest is built per browser (`wxt.config.ts`): only the Firefox build carries the add-on id `plain-a11y@bereg.dev`, the minimum Firefox version and the data collection line. New scripts `build:firefox` and `zip:firefox` (the second also makes the archive of the sources that Mozilla asks for). The release routine for two stores is in `tasks/TASK-27.md`.

## 0.2.0 - 2026-11-02

### Added
- The popup keeps the result of the last check of a tab. Closing and opening it again on the same page shows the same lists, with the time of the check and a note to press “Check page” to check again. The result is dropped when the tab loads another page (also after going back, a reload, a change of the address by a single-page site or of the `#fragment`) and when the tab is closed (`tasks/TASK-23.md`).
- After “Check page”, the icon shows the number of **elements** with issues on that tab, in red. When there are no issues but there are items for a manual review or AAA recommendations, it shows a yellow “!”. It is empty when nothing is found, because an automated check cannot say that a page is accessible. The tooltip names the three groups: “8 issues, 14 to review by hand, 21 AAA recommendations”. The icon is cleared when the tab loads a page, also on single-page sites where Chrome keeps it (`tasks/TASK-19.md`, `tasks/TASK-23.md`, `tasks/TASK-24.md`).

### Changed
- The summary line of the popup counts elements and shows the three groups: “Issues found: 8 (5 kinds). Needs manual review: 14 (5 kinds). AAA recommendations: 21 (1 kind).” Before, it showed the number of kinds of problem.
- The rule `label-content-name-mismatch` is now listed under “Needs manual review”, not under issues. A visible text that is not part of the accessible name is often fine (a link “Notifications” that shows “5”), and a person decides.
- The short description in the manifest is now the one in `store/listing.md` (the store shows the manifest text), and a test keeps the two equal.

### Privacy
- The last result of a tab is kept in `storage.session`, that is in the memory of the browser, until the page changes, the tab is closed or the browser is closed. It is never sent anywhere. No new permission. `PRIVACY.md`, the website policy and the store text say so.

### Internal
- Browser end-to-end tests in the repository (`npm run test:e2e`, 33 tests, `tasks/TASK-20.md`). Rules for contributors (`CONTRIBUTING.md`, `SECURITY.md`, an issue form for pages where the check goes wrong). The process files and task files are in English.

## 0.1.0 - 2026-10-30

Launch of the base version: the first version in the Chrome Web Store.

### Added
- “Check page” runs axe-core 4.14.0 on the current tab. Problems are grouped by severity (Critical, Serious, Minor) and by role (Design, Content, Code), with a role filter that is remembered.
- A plain-language entry for 94 rules: what is wrong, who is affected, how to fix it. Rules without an entry show the axe text and the role Code.
- “Show on page” outlines the element and scrolls to it, also inside open shadow DOM. Elements with no visible area are shown through their nearest visible parent, or the popup says that nothing can be outlined. The page markup is restored exactly.
- A “Needs manual review” section for cases the engine could not decide, not counted as issues.
- An “AAA recommendations” block, not counted as issues, which can be hidden.
- “Copy report” puts a Markdown checklist on the clipboard, grouped by role.
- The `target-size` rule (WCAG 2.2 AA) is turned on.

### Privacy
- Three permissions only: `activeTab`, `scripting`, `storage`. No network requests, no remote code.
