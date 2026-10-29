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

## Next: fix found in the first manual run (29 October 2026)

- **“Show on page” does not outline every element.** Found by the owner when trying the built extension by hand. Still to collect: the page, the issue, and what happens (no button, no outline, or the wrong element). Likely causes to rule out first: an issue about the whole page (no element), an element in a closed shadow root or an iframe, a hidden element or one outside the visible area. Anything else is a defect: fix it with a regression test and a check in real Chromium. Make it a task file (`tasks/TASK-17.md`) before the features below.

## Next: important features (in this order)

1. **Check a selected block of the page.** Let the person pick a part of the page and run the check only there.
2. **Compare two checks.** Show what was fixed and what appeared between two runs. Needs the previous result to be stored.
3. **Toolbar badge with the issue count after a check** (a small stage). After “Check page” the icon shows the number of issues found on that tab, until the tab navigates away. It needs no new permission (`chrome.action.setBadgeText`). The badge never says “accessible”: it shows a count, and for zero it shows nothing or a neutral “0”, never a green mark, because automated checking cannot certify a page (see the limits on the website).
4. **Browser end-to-end tests in the repository.** Playwright tests that load the built extension in Chromium. Today these checks are run by hand with scripts outside the repo. This is a new dev dependency.

## Backlog (not now)

- **Automatic check on chosen sites (opt-in).** A switch “check automatically on this site” that asks for the permission for that one site at the moment it is turned on (`optional_host_permissions`), so that the badge updates by itself there. It must stay opt-in per site: checking every page would need access to all sites, which breaks the minimal-permissions promise, costs CPU on every page and would invite a misleading “accessible or not” badge. Needs a decision on the store justification for the optional permission.

- **Manual checklist** for what automation cannot check (tab order, meaning of alt text, form clarity, captions). The state would be kept in `storage`. Needs more thought first.
- **Check the content of iframes.** Same-origin frames are probably possible. Cross-origin frames likely need more than `activeTab`, which conflicts with the minimal-permissions principle. Needs a practical test.
- **Firefox.** WXT can build for it. Keep the code portable meanwhile: use the `browser` API, avoid Chrome-only calls. Plan: after the Chrome version is accepted into the store and before the big new features, so new features are tested in both browsers.
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
