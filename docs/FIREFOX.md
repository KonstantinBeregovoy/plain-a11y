# Plain A11y for Firefox

The same code builds a package for desktop Firefox (Manifest V3). Stage: `tasks/TASK-26.md`. Firefox for Android is not part of this: it is a separate item in `docs/ROADMAP.md`.

- Needs Firefox 140 or newer. The manifest asks for 140 because that is the first version that understands the line saying that the extension collects no data (`data_collection_permissions`), which addons.mozilla.org (AMO) requires from new extensions.
- Same three permissions as in Chrome (`activeTab`, `scripting`, `storage`), no host permissions, no network requests.
- The add-on id is `plain-a11y@bereg.dev`. It is permanent for the AMO listing: it cannot be changed later without making a new add-on.

## Commands

| Command | What it does |
| --- | --- |
| `npm run build:firefox` | Builds the extension into `.output/firefox-mv3` |
| `npm run zip:firefox` | Makes the two archives for AMO: `.output/plain-a11y-<version>-firefox.zip` (the package) and `.output/plain-a11y-<version>-sources.zip` (the sources) |

WXT builds Manifest V2 for Firefox unless `--mv3` is given, so use these scripts and not `wxt build -b firefox` by hand.

## Try it in Firefox (temporary install)

1. `npm install`, then `npm run build:firefox`.
2. In Firefox open `about:debugging#/runtime/this-firefox`.
3. Click “Load Temporary Add-on…” and choose `.output/firefox-mv3/manifest.json`.
4. Open a normal page (not `about:` or the add-ons site), click the Plain A11y button in the toolbar (if it is not there, open the puzzle-piece “Extensions” menu and pin it), and press “Check page”.

A temporary add-on is removed when Firefox closes. An unsigned package cannot be installed for good in the normal release of Firefox: for that it must be signed by AMO (below), or you can use Firefox Developer Edition or Nightly with `xpinstall.signatures.required` set to `false`.

## Send it to addons.mozilla.org (the owner does this)

You need a free Firefox account and a developer profile on <https://addons.mozilla.org/developers/>. The screens below follow Mozilla's current flow; if a screen differs, follow the screen.

1. Build both archives from a clean checkout of `main`: `npm ci`, `npm run test`, `npm run zip:firefox`.
2. Developer Hub → “Submit a New Add-on”. Choose how to distribute: “On this site” (a public listing). “On your own” only signs the file and gives it back, with no listing.
3. Upload `.output/plain-a11y-<version>-firefox.zip`. AMO checks it automatically. Expect warnings from `axe-core` and React (see “About the warnings” below) and none from our own code.
4. Compatibility: tick Firefox for desktop only. Do not tick Firefox for Android until that version has been checked.
5. “Do you need to submit source code?” → Yes. Upload `.output/plain-a11y-<version>-sources.zip` and paste the reviewer notes below.
6. The listing. Reuse the texts of `store/listing.md` (name, summary, full description). Add: the website `https://a11y-ext.bereg.dev/` as the homepage, the privacy policy `https://a11y-ext.bereg.dev/privacy`, the support address from the website, the license MIT, the five screenshots listed in `store/listing.md` and a category that fits (for example Web Development). The data collection answer comes from the manifest: no data is collected.
7. Submit and wait for the review. Mozilla reviews automatically first and may also review by a person; do not count on a fixed time.
8. For every next version: raise `version` in `package.json`, run `npm run zip:firefox` and upload both archives again as a new version of the same add-on. Keep the version number the same as in the Chrome Web Store.

### Notes for the reviewer (paste into the form)

```
Plain A11y is built from the attached sources with WXT (Vite) and unmodified axe-core 4.14.0 (MPL-2.0, in package-lock.json).

Build (tested with Node.js 22 and npm 10):
1. npm ci
2. npm run build:firefox
The output is in .output/firefox-mv3 and is identical, file by file, to the uploaded package.

Permissions: activeTab, scripting, storage. No host permissions, no network requests, no remote code, no data is collected or sent anywhere. The last result of a tab is kept in storage.session (browser memory) and the role filter in storage.local.

The warnings about Function() and innerHTML come from the bundled third-party libraries (axe-core and React), not from the extension's own code. The extension's own sources are in src/.
```

### About the warnings

`web-ext lint` on `.output/firefox-mv3` gives 0 errors and 13 warnings: 9 about `Function(...)` (in the content script, from `axe-core` and the libraries it bundles), 3 about assigning `innerHTML` (axe-core and React) and 1 saying that the Android version asks for Firefox 142 for the data collection line. The first twelve come from the libraries; the last one is why Android is not ticked in step 4.

## What was checked, and what was not

Checked on 4 November 2026, in Firefox Developer Edition 160.0 (a temporary install, driven by a script outside the repository):

- The package installs, the popup opens as an extension page, and the id is `plain-a11y@bereg.dev`.
- The check finds the same rules as in Chromium on five fixture pages of `tests/fixtures`: the five rules on `basic.html`, the review-only rule on `mismatch.html`, nothing on `clean.html`, the two review items on `review.html`, the AAA item on `aaa.html`.
- The badge: red with white text and the number of elements, a yellow “!” with black text when only review items are left, the tooltip text.
- The last result of a tab is kept in `storage.session` and never in `storage.local`; it is dropped, with the badge, when the tab loads another page and after `history.pushState`.
- “Show on page” outlines exactly one element and removes the outline.
- The rebuild from `plain-a11y-<version>-sources.zip` (`npm ci`, `npm run build:firefox`) is identical, file by file, to `.output/firefox-mv3`.
- `web-ext lint`: 0 errors, 13 warnings (above).

Found only in Firefox and fixed in this stage: for `history.pushState` and a change of the `#fragment` Firefox sends `tabs.onUpdated` with status `complete` and a new `url`, not status `loading` as Chrome does. Without the fix the kept result and the badge stayed after such a change (single-page sites). `startsNewPage` in `src/background/lastResult.ts` now treats both as a new page.

Not checked, so a person should do it before sending the package:

- The real path: a click on the toolbar button in a normal profile gives `activeTab` for that tab. The script used a copy of the package with the host permission, because a driven browser cannot click the toolbar button. This is the first thing to try in the temporary install above.
- That Firefox sends the new `url` in `tabs.onUpdated` for `pushState` when only `activeTab` is granted (the script had the host permission). If it does not, a result can stay after a single-page navigation in Firefox, and the answer is a note in the listing or the `tabs` permission, which is the owner's decision.
- The look of the popup in Firefox (size, fonts, dark theme, forced colors), keyboard use and a screen reader (NVDA or VoiceOver with Firefox). The list is in `docs/a11y-checklist.md`.
- Windows and Linux. Firefox older than 140 (the package refuses to install there). Firefox for Android.
