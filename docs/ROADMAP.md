# Roadmap

This file lists what is planned, in order, and what is parked. Stage files with acceptance criteria are in `tasks/`.

## Done: stages 7 to 16

All of these are finished. The results and deviations are at the end of each task file in `tasks/`.

| Stage | What |
| --- | --- |
| 7 | Fixes and refactor from the architecture review |
| 8 | Popup typography |
| 9 | `target-size` (WCAG 2.2 AA) turned on |
| 10 to 13 | Plain-language dictionary for all rules axe runs by default |
| 14 | “Needs manual review” section |
| 15 | “AAA recommendations” block, hideable |
| 16 | “Show on page” for elements inside open shadow DOM |

## Done: stage 17

| Stage | What |
| --- | --- |
| 17 | “Show on page” for elements with no visible area (nearest visible parent, or a clear message). Still open: elements clipped by a parent with hidden overflow, and the real cases from the owner's manual run (page, issue, what happens), to be collected after publishing. |

## Done: stages 22 to 25

| Stage | What |
| --- | --- |
| 22 | Release 0.2.0 prepared: version, manifest description from the listing, privacy line, changelog. See `tasks/TASK-22.md`. |
| 23 | The popup keeps the last result of a tab in `storage.session` and shows it again; it is dropped when the tab loads another page or is closed. See `tasks/TASK-23.md`. |
| 24 | The icon and the summary count elements in three groups, a yellow “!” when only a manual review or AAA recommendations are left, and `label-content-name-mismatch` moved to the manual review. See `tasks/TASK-24.md`. |
| 25 | A changelog in one format with dates (`CHANGELOG.md`) and a page `/changelog` on the website. See `tasks/TASK-25.md`. |

## Done: stage 20

| Stage | What |
| --- | --- |
| 20 | Browser end-to-end tests in the repository (`@playwright/test`, `npm run test:e2e`, 33 tests after stage 24). See `tasks/TASK-20.md`. |
| 21 | Removed the badge reset listener of stage 19: Chrome resets the badge itself on a full navigation, and an e2e test guards that. Stage 23 brought a listener back for single-page sites, where Chrome keeps the badge. See `tasks/TASK-21.md`. |

## Done: stage 19

| Stage | What |
| --- | --- |
| 19 | Toolbar badge with the issue count after a check (empty for zero issues, reset when the tab loads another page). See `tasks/TASK-19.md`. |

## Next: important features (in this order)

1. **Check a selected block of the page.** Let the person pick a part of the page and run the check only there.
2. **Compare two checks.** Show what was fixed and what appeared between two runs. Needs the previous result to be stored.

## Backlog (not now)

- **Automatic check on chosen sites (opt-in).** A switch “check automatically on this site” that asks for the permission for that one site at the moment it is turned on (`optional_host_permissions`), so that the badge updates by itself there. It must stay opt-in per site: checking every page would need access to all sites, which breaks the minimal-permissions promise, costs CPU on every page and would invite a misleading “accessible or not” badge. Needs a decision on the store justification for the optional permission.

- **Manual checklist** for what automation cannot check (tab order, meaning of alt text, form clarity, captions). The state would be kept in `storage`. Needs more thought first.
- **Check the content of iframes.** Same-origin frames are probably possible. Cross-origin frames likely need more than `activeTab`, which conflicts with the minimal-permissions principle. Needs a practical test.
- **Firefox.** WXT can build for it. Keep the code portable meanwhile: use the `browser` API, avoid Chrome-only calls. Plan: after the Chrome version is accepted into the store and before the big new features, so new features are tested in both browsers.
- **Firefox for Android.** After the desktop Firefox version, as its own item with its own checks: the popup on a small screen, touch, and how `activeTab` behaves there. Not part of the desktop Firefox work.
- **Check in CI (idea, needs decisions).** A command-line tool and later a GitHub Action that opens given addresses in headless Chromium with Playwright, runs axe-core with the same options and the same dictionary, and prints the same report as Markdown for a pull request comment: issues, items to review by hand and AAA recommendations, grouped by role. It still needs a browser, because axe measures colours and sizes on the rendered page. Suggested by a reader in a LinkedIn conversation in November 2026. Open questions: pages behind a login (a saved session or a login script); which results fail a build (never the manual review or AAA, and a baseline so that old problems do not block every build); a new package or repository and how it shares `src/dictionary` and `src/report` with the extension; the privacy text (it runs on the user's own machines and sends nothing). Ask the person who suggested it what they need before any work.
- **Next/previous element** when one issue affects several elements.
- Your own checks (custom rules and check sets). Format to be agreed later.

## Experimental axe rules: recheck later

These rules are off by default in axe because they are experimental. We do not enable them. Recheck them whenever axe-core is updated: if a rule no longer carries the `experimental` tag, evaluate it for inclusion (run it on real pages, look for false positives, then write a dictionary entry).

| Rule | Category |
| --- | --- |
| `css-orientation-lock` | structure (WCAG 1.3.4) |
| `focus-order-semantics` | keyboard (best practice) |
| `hidden-content` | structure (best practice) |
| `p-as-heading` | semantics (WCAG 1.3.1) |
| `table-fake-caption` | tables (WCAG 1.3.1) |
| `td-has-header` | tables (WCAG 1.3.1) |

How to recheck: `node -e "const a=require('axe-core');console.log(a.getRules().filter(r=>r.tags.includes('experimental')).map(r=>r.ruleId))"`.

## Not planned

Five rules that axe itself has deprecated and turned off: `aria-roledescription`, `audio-caption`, `duplicate-id`, `duplicate-id-active`, `landmark-complementary-is-top-level`.
