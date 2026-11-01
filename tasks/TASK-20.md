# TASK-20: Browser end-to-end tests in the repository

Goal: the checks that so far were run by hand with scripts outside the repository run as tests in the repository: the built extension is loaded into a real Chromium and driven through its real message path. Unit tests with jsdom were blind to several defects (see part 4 of the article series and `docs/PROJECT_LOG.md`); these tests are the safety net for them.

The owner asked for this stage and for the new dev dependency (`@playwright/test`).

## Steps
1. Add the dev dependency `@playwright/test` and an npm script `test:e2e` (builds the extension, then runs the tests). `npm run test` (Vitest) must not pick the e2e files up, and the e2e run must not slow it down.
2. Put the tests in `tests/e2e/`. A fixture loads the built extension from `.output/chrome-mv3` as a temporary copy that has `host_permissions: <all_urls>` (the real manifest is never changed) into a persistent Chromium context, with the new headless mode, and serves `tests/fixtures/` from a local server on a free port. The browser can be set with `PLAYWRIGHT_CHROMIUM_PATH`; without it Playwright's own Chromium is used (`npx playwright install chromium` once).
3. Tests, each through the real path (popup page sends `run-check`, the service worker injects the content script, the content script runs axe):
   - the check of `basic.html` returns the five expected rules (image-alt, label, color-contrast, link-name, target-size), a clean page returns none, `review.html` returns items for manual review, `aaa.html` returns an AAA item;
   - highlighting every issue of `basic.html` and then removing it leaves the page markup exactly as it was; highlighting inside shadow DOM (`shadow.html`) finds elements and restores the markup; closing the popup removes the highlight;
   - the toolbar badge shows the number of issues, is empty for a clean page and for other tabs, and is reset after navigation;
   - no request leaves the browser during a check except the pages of the local server and the extension itself;
   - the copy of the manifest differs from the built one only by `host_permissions` (so the setup cannot hide a permission), and the built one has exactly `activeTab`, `scripting`, `storage`;
   - the popup page has no axe violations in the light and the dark scheme (the idle state; the other states stay covered by the jsdom tests).
4. A new fixture `tests/fixtures/clean.html` without problems.
5. Mutation check: each test group is shown to fail when the thing it guards is broken (for example the highlight restore, the badge, a network call), by breaking it temporarily and restoring it.
6. Document how to run it in `README.md` and `CONTRIBUTING.md`.

## Acceptance criteria
- `npm run typecheck`, `npm run test`, `npm run build`, `npm run zip` and `npm run test:e2e` pass; the number of Vitest tests does not change except for any helper tests.
- The e2e suite finishes in well under two minutes on a normal machine and is repeatable (run it three times in a row).
- The zip contains none of the e2e files or the Playwright package.
- No `any`, no `@ts-ignore`; the e2e files are type-checked.

## Do not
Run the tests on a schedule or in CI (there is no CI yet). Test the website. Add other dependencies. Change the extension code to make a test pass (a failing test is a finding, and goes into the results). Check pages on the internet: the tests use only local fixtures.

## Results

1. New dev dependency `@playwright/test` (^1.64.1) and the script `npm run test:e2e` (`npm run build && playwright test`). New files: `playwright.config.ts`, `tests/e2e/harness.ts` (the fixture: a temporary copy of the build with `host_permissions: <all_urls>`, a persistent Chromium context in the new headless mode, a local server for `tests/fixtures/`, and helpers), five spec files, and the fixture `tests/fixtures/clean.html`. `.gitignore` got the Playwright result folders and `tsconfig.json` includes `playwright.config.ts`, so the e2e files are type-checked. No extension code was changed.
2. 19 e2e tests: check (5), “Show on page” (4), badge (3), package (3), popup in a real browser (4: axe in the light and dark scheme, the keyboard reaches the button, and a test that the audit itself can fail). `npm run test` still runs only the 140 Vitest tests.
3. Checks: `npm run typecheck` clean; `npm run test` 140 of 140; `npm run test:e2e` 19 of 19, three runs in a row, 4.3 to 6.7 s of test time each (about 5 to 9 s with the build); `npm run zip` 280.20 kB, with no Playwright or e2e file inside.
4. Mutation checks (broken on purpose, restored afterwards, `git status` of `src` and `wxt.config.ts` empty at the end):
   - highlight not removed on clear: 3 of the 4 highlight tests fail (the fourth was too weak, see below);
   - badge never set: 2 of the 3 badge tests fail (the clean-page test cannot differ, because the badge is empty either way);
   - a `fetch` to an outside address in the content script: the network test fails;
   - a fourth permission (`tabs`) in the config: the manifest test fails;
   - popup text color too light: the light-scheme axe test fails;
   - every element counted as visible: the “no visible area” test fails.
5. What the mutation checks found in my own tests, and what I changed: the first version of the “no visible area” test passed even with the logic broken, so it now asserts the exact numbers (`found: 1, nearest: 1, notVisible: 0` for the empty link, and `nearest: 0` for an image) and the markup restore. My first attempt to break the popup contrast did not break anything, because `body` sets its own color; I added the test “the audit itself can fail” to be sure that axe in the popup page can report a problem, then broke `--fg` instead.
6. **A finding about stage 19.** With the listener that clears the badge on `tabs.onUpdated` removed on purpose, the test “is reset when the tab loads another page” still passes. So Chrome (the Chromium used here) already resets the badge of a tab when it loads another page, and the listener in `src/background/index.ts` is not needed. I did not remove it, because this stage must not change extension code. Removing it would save a service-worker wake-up on every tab load. The test stays: it checks the behaviour, not the listener. The open point in `TASK-19.md` is resolved by this.
7. Not checked: other Chromium versions than the one installed here (Chrome for Testing, driven by Playwright 1.64.1 through `PLAYWRIGHT_CHROMIUM_PATH`, because the build that Playwright 1.64.1 downloads was not installed on this machine; I did not download another browser); a run on Windows or Linux; the new tests in CI (there is none).

### How to run

```bash
npx playwright install chromium   # once, if you have no Chromium for Playwright
npm run test:e2e
```

To use a browser that is already installed, set `PLAYWRIGHT_CHROMIUM_PATH` to its executable.
