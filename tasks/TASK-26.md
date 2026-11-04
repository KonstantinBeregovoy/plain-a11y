# TASK-26: A build for desktop Firefox

Goal: the same code builds an extension for desktop Firefox (Manifest V3) that can be loaded in Firefox and sent to addons.mozilla.org (AMO), and Chrome behaves as before (its manifest is byte for byte the same).

Asked for by the owner on 4 November 2026. Firefox for Android is a separate item in `docs/ROADMAP.md`.

## Steps
1. The manifest gets Firefox settings only when the target is Firefox: `browser_specific_settings.gecko` with an `id`, a `strict_min_version` and `data_collection_permissions: { required: ['none'] }` (AMO asks for it from new extensions since 3 November 2025). The Chrome manifest does not change.
2. Scripts `build:firefox` and `zip:firefox`. They pass `--mv3`, because WXT builds Manifest V2 for Firefox when the flag is missing. The zip step also makes the archive of the sources that AMO asks for when a bundler is used.
3. Tests for both manifests: same three permissions and no host permissions in both; the Firefox settings only in the Firefox one; the Chrome one has no `browser_specific_settings`.
4. Check the build with Mozilla's linter (`web-ext lint`) and in a real Firefox.
5. `docs/FIREFOX.md`: how to try the build, how to build it from the sources, how to send it to AMO (the owner does the upload), and what to check by hand.

## Acceptance criteria
- `npm run typecheck`, `npm run test`, `npm run build` and `npm run zip` pass, and the 33 browser tests pass in Chromium. The Chrome manifest is identical to the one before this stage (compared as files).
- `npm run build:firefox` and `npm run zip:firefox` make a package with the same three permissions and no host permissions.
- The linter reports no errors for the Firefox package.
- A test fails when the Firefox settings leak into the Chrome manifest, or when the Firefox manifest loses the id or the data collection line.

## Do not
Change the permissions, the popup, the content script, the pinned versions or the Chrome manifest. Add dependencies. Start the Android version. Change the website or the privacy text (their own pull request, after the owner agrees).

## Results
1. `wxt.config.ts`: the manifest is now a function of the browser. Only the Firefox build gets `browser_specific_settings.gecko` (`id` `plain-a11y@bereg.dev`, `strict_min_version` `140.0`, `data_collection_permissions: { required: ['none'] }`). The minimum is 140 because Mozilla's linter says that the data collection line is understood only from Firefox 140; with 115 it gave a warning. Scripts `build:firefox` and `zip:firefox` (with `--mv3`: without it WXT builds Manifest V2 for Firefox).
2. Tests: 170 Vitest tests, all pass (165 before: the manifest tests now cover both browsers and 2 new ones keep the Firefox lines out of the Chrome manifest and require the id and the “none” line; 3 new ones for `startsNewPage`). The 33 browser tests pass in Chromium with the shared change. The Chrome manifest built after the change is identical to the one before (`cmp`).
3. `web-ext lint` (latest version, run with `npx`, not added to the project) on `.output/firefox-mv3`: 0 errors, 13 warnings: 9 `Function(...)` and 3 `innerHTML` from `axe-core` and the libraries it bundles, and 1 saying that Firefox for Android needs 142 for the data collection line (Android is not part of this stage).
4. In a real Firefox (Developer Edition 160.0, temporary install, Selenium; the script is not in the repository because it needs `selenium-webdriver`): 21 checks pass. The package installs, the popup opens, the same rules as in Chromium on five fixture pages, the badge (red number, yellow “!”, colors and tooltip), the result in `storage.session` only, “Show on page” and its removal, the summary line in the popup, the result and badge dropped after a new page and after `pushState`. The test copy had the host permission, which stands in for the click on the icon.
5. Found only in Firefox: for `history.pushState` and a `#fragment` change Firefox sends `tabs.onUpdated` with status `complete` and a new `url`, not `loading`. Before the fix the result and the badge stayed after `pushState` (the check failed in Firefox). `startsNewPage` in `src/background/lastResult.ts` now treats both as a new page; the Firefox script then passed. Removing the `url` condition makes the unit test fail.
6. The sources archive made by `zip:firefox` rebuilds, after `npm ci` and `npm run build:firefox` in an empty folder, to a package identical file by file to the one that was zipped.
7. `docs/FIREFOX.md`: how to try it, how to send it to AMO (with the reviewer notes), what was and was not checked. The `README.md` has the two commands and a pointer.
8. Not checked: the real click on the toolbar button (`activeTab`) in a normal profile; that Firefox sends the new `url` for `pushState` when only `activeTab` is granted; the look of the popup, keyboard and screen reader in Firefox; Windows, Linux, Firefox older than 140, Firefox for Android. `docs/ROADMAP.md` and `docs/PROJECT_LOG.md` are not updated here because open pull requests (#10, #11) change the same lines: update them after those are merged.

## Questions
1. The add-on id `plain-a11y@bereg.dev` is permanent for the AMO listing: it cannot be changed later without making a new add-on. Check that it is the one you want.
