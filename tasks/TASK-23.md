# TASK-23: Keep the last result of a tab

Goal: a person who closes the popup and opens it again on the same page sees the result of the last check again, and can press “Check page” to check again. When the tab loads another page, the result is dropped, and coming back to the earlier page needs a new check.

Found in the owner's first use of version 0.2.0 on a real page (1 November 2026): after closing the window everything disappeared and the check had to be done again.

## What was measured first (Chromium, built extension, local pages)
- `tabs.onUpdated` with `status: 'loading'` arrives for a normal navigation, a reload, going back, `history.pushState` and a change of the `#fragment`. It does not arrive when a page adds an iframe later. It arrives also in a copy of the manifest **without** host permissions (only the `url` field is missing then), so no new permission is needed.
- The toolbar badge is reset by Chrome only for a full navigation. After `history.pushState` or a fragment change the badge keeps the old number. (`TASK-21.md` removed the listener because full navigations reset the badge; single-page sites such as LinkedIn do not.)

## Steps
1. After a successful check the service worker keeps the result of that tab (the three lists, the page address and the time) in `chrome.storage.session`, under a key that holds the tab id. That area lives in the browser memory only and is emptied when the browser closes. No new permission: `storage` already covers it.
2. A new message `get-last-result`: the service worker answers with the stored result of the active tab, or `null`.
3. When the popup opens it asks for it. If there is a result and the person has not pressed anything yet, the popup shows it as after a check, plus the note “Showing the result of the check at 14:05. Press “Check page” to check again.” in the status area. The button keeps its name “Check page”. The date in “Copy report” is the time of the check, not the time of opening.
4. On every `tabs.onUpdated` with `status: 'loading'` the service worker removes the stored result of that tab and clears its badge (text and tooltip). On `tabs.onRemoved` it removes the stored result.
5. A failure to save, read or remove never fails a check and never breaks the popup: without a stored result the popup is empty as before.
6. The highlight is still removed when the popup closes. After reopening, “Show on page” draws it again.

## Acceptance criteria
- `npm run typecheck`, `npm run test`, `npm run build` and `npm run zip` pass. The permissions are still `activeTab`, `scripting`, `storage`.
- Unit tests: saving and reading back, one key per tab, a broken stored value is ignored, removing, a failing storage does not throw out of the check; the popup shows the stored result with the note and axe without violations, shows nothing when there is no result, and a new check replaces it; clearing the badge.
- In Chromium with the built extension: after a check, a popup opened again shows the same lists; a second tab has no result; after a reload, a navigation, going back, `pushState` and a fragment change the result and the badge are gone; a new iframe does not remove the result. A mutation of each rule (not clearing on `loading`, not saving) makes the matching test fail.

## Do not
Show a restored result as if it were fresh (the time is always shown). Keep the result after the tab loads another page, also when the person comes back. Write it to `storage.local` or anywhere on disk. Re-run the check automatically. Change the name of the button.

## Release texts
This stage changes what the extension keeps, so `PRIVACY.md`, the privacy page of the site and `store/listing.md` must change in the same release as the code, not before. They are done in the release stage (the pattern of `TASK-22.md`), after the owner agrees.

## Results
1. New file `src/background/lastResult.ts` (`saveResult`, `loadResult`, `forgetResult`, `browserSessionStore`, a damaged stored value is ignored). `src/background/index.ts` saves after a successful check, answers the new `get-last-result` message, and on `tabs.onUpdated` with `status: 'loading'` removes the result and clears the badge (`clearIssueCount` in `badge.ts`); `tabs.onRemoved` removes the result. `src/popup/useCheck.ts` asks on opening and fills the state only if nothing was pressed; `App.tsx` shows the note. The type `StoredCheck` and the message types are in `src/report/messages.ts`.
2. Measured before writing the code (Chromium, Chrome for Testing, built extension, local pages): `status: 'loading'` arrives for a navigation, a reload, going back, `pushState` and a fragment change, and not for an iframe added later; it also arrives in a copy of the manifest without host permissions. The badge is **not** reset by Chrome after `pushState` or a fragment change (it stays at 5), so `TASK-21.md` was right only for full navigations; the listener is back, now for both jobs.
3. Tests: 153 Vitest tests, all pass (141 before; 6 for the store, 1 for clearing the badge, 5 for the popup: shown with the note and without axe violations, nothing when there is none, replaced by a new check, the report uses the time of the check, a silent service worker). Browser tests: 29, all pass (19 before, 10 new in `tests/e2e/lastResult.spec.ts`: comes back and the popup shows it; per tab; replaced by a new check; dropped with the badge after a reload, another page and going back, `pushState`, a fragment change; stays after a new iframe; removed when the tab is closed and never in `storage.local`). `typecheck`, `build` and `zip` pass; the zip is 280.70 kB, permissions `activeTab`, `scripting`, `storage`, no host permissions.
4. Mutations (the build was changed, the browser tests run, the file restored): never saving fails all 10 tests; not clearing on `loading` fails the 5 drop tests; clearing the result but not the badge fails the 2 single-page tests (`pushState`, fragment). The first version of the drop tests also passed when nothing was ever saved; a check that the result and the badge exist before the action was added.
5. Not checked: the real popup opened by a click on the icon in a normal profile (the tests use the popup page as a tab while the checked tab is in front); `storage.session` on Chrome older than 112 (the quota was 1 MB before; a failure to save is ignored, the popup is then empty as before); that the result of a very large page fits the quota (the lists hold selectors, not markup); other Chromium versions, Windows, Linux.
6. The texts that say what is kept were changed in the same pull request in `TASK-24.md` (result 5). The numbers above are those of this stage: later stages changed them.

## Questions
1. A change of the `#fragment` also drops the result (Chrome reports it like a navigation, and the page can change with it). If you want the result to stay after clicking an in-page anchor, this needs the address of the tab, which the extension does not get without a new permission.
