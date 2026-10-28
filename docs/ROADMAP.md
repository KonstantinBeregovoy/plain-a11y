# Roadmap

This file lists what is planned, in order, and what is parked. Stage files with acceptance criteria are in `tasks/`.

## Next stages (tasks/TASK-7 to TASK-16)

| Stage | What | Why |
| --- | --- | --- |
| 7 | Fixes and refactor from the architecture review | Stale content script after an update, query strings in the report URL, duplicated code, oversized `App.tsx` |
| 8 | Popup typography | Smaller headings and body text, sizes in `rem` |
| 9 | Turn on `target-size` (WCAG 2.2 AA) | The spec targets WCAG 2.2 AA but axe keeps this rule off by default |
| 10 to 13 | Plain-language dictionary for the 80 remaining rules, in four batches | 80 of 90 checked rules still show generic English axe text |
| 14 | “Needs manual review” section | axe reports unclear cases separately; today they are invisible |
| 15 | “AAA recommendations” block at the bottom, can be hidden | Three AAA rules, shown separately from AA problems |
| 16 | “Show on page” for elements inside shadow DOM | They appear in the report but cannot be outlined today |

## Important features for the stage after that (in this order)

1. **Check a selected block of the page.** Let the person pick a part of the page and run the check only there.
2. **Compare two checks.** Show what was fixed and what appeared between two runs. Needs the previous result to be stored.
3. **Browser end-to-end tests in the repository.** Playwright tests that load the built extension in Chromium. Today these checks are run by hand with scripts outside the repo. This is a new dev dependency.

## Backlog (not now)

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
