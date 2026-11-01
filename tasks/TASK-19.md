# TASK-19: Toolbar badge with the issue count

Goal: after “Check page” the extension icon shows the number of issues found on that tab, so a person who closes the popup still sees that a check was made and how it went. The badge never says that a page is accessible.

## Steps
1. After a successful check the service worker sets the badge text of that tab to the number of issues (the same number as “Issues found” in the popup). Manual review items and AAA recommendations are not counted.
2. For zero issues the badge is empty. A “0” or a green mark could be read as “passed”, and the extension must not say that (see decision 6 in `docs/PROJECT_LOG.md`).
3. The badge uses a dark red background and white text with a contrast of at least 4.5:1. It shows up to 99; more is shown as “99+”.
4. The tooltip of the icon on that tab says the same in words: “Plain A11y: N issues found in the last check”, and “1 issue” for one.
5. The badge and the tooltip of a tab are reset when that tab starts loading a page, so an old count never stays on a new page.
6. No new permission. A failure to set the badge never fails the check.

## Acceptance criteria
- `npm run typecheck`, `npm run test`, `npm run build` and `npm run zip` pass.
- Unit tests of the text (0, 1, 5, 99, 100), of the tooltip (singular and plural), of the contrast of the colors, of setting and clearing with a fake browser API, and a test that a failing API does not throw out of the check.
- The permissions are still `activeTab`, `scripting` and `storage` (the existing package test).
- In Chromium with the built extension: after a check of a page with problems the badge text of the tab equals “Issues found” in the popup; after navigating the same tab the badge is empty; another tab has no badge.

## Do not
Count items for manual review or AAA in the badge. Check pages automatically. Show a badge for a clean page. Store the count anywhere (no new data in `storage`).

## Results

1. New file `src/background/badge.ts`: `badgeText`, `badgeTitle`, `showIssueCount`, `clearBadge` and `browserBadgeApi` (the real API behind a small interface, like `inject.ts`). `src/background/index.ts` sets the badge after a successful check, and clears the tab on `tabs.onUpdated` with `status: 'loading'`. A failure to set the badge is swallowed, the check result is still returned.
2. Colors: `#a01d17` background and white text, contrast 7.8:1 (the test requires at least 4.5:1).
3. Tests: 140, all pass (9 new in `tests/badge.test.ts`: text for 0, 1, 5, 99, 100; singular and plural tooltip and no “accessible” in any tooltip; contrast; setting and clearing with a fake API; a failing API rejects so the caller can ignore it). `npm run typecheck`, `npm run build` (953.29 kB) pass. The built manifest has the same permissions (`activeTab`, `scripting`, `storage`) and no host permissions.
4. Checked in Chromium with the built extension (a temporary copy of `.output/chrome-mv3` with `host_permissions: <all_urls>`, the main manifest is not changed; Playwright, headless new; local pages): `basic.html` gives 5 issues, and the badge text of that tab is “5”, with the tooltip “Plain A11y: 5 issues found in the last check” and the color 160,29,23. Two other tabs that were not checked have no badge. A clean page gives 0 issues and an empty badge. After the same tab navigated to another page, its badge text was empty, the tooltip was “Plain A11y” and the color was reset; a new check there gave 0 and an empty badge. The popup shows `items.length` as “Issues found”, the same number the badge uses (read from the message answer, not from a screenshot of the popup).
5. Not checked at the time: whether Chrome would reset the tab badge on navigation without the listener. Checked in `TASK-20.md` (result 6): it does, so the listener is not needed. Not checked: how the badge looks on a real toolbar (size, color in the dark theme). Not checked: a check of a page that is then closed and reopened. The version in `package.json` is not changed: raising it for the store is the owner's decision.

## Questions
1. Zero issues shows no badge (step 2). If you prefer a neutral “0”, it is a one-line change in `badgeText`.
