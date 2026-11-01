# TASK-21: Remove the badge reset listener that Chrome makes unnecessary

Goal: remove code that does nothing. The e2e test of stage 20 showed that Chrome resets the badge of a tab when the tab loads another page, so the `tabs.onUpdated` listener of stage 19 is not needed. It wakes the service worker on every tab load in the browser for no result.

## Steps
1. Remove the `tabs.onUpdated` listener from `src/background/index.ts`, and the function `clearBadge` and its unit test, which nothing uses any more.
2. Leave a one-line comment where the badge is set, saying that Chrome resets it and which test guards that.
3. Update `tasks/TASK-19.md` and `README.md` where they say that the extension resets the badge.

## Acceptance criteria
- `npm run typecheck`, `npm run test`, `npm run build`, `npm run zip` and `npm run test:e2e` pass.
- The e2e test “is reset when the tab loads another page” still passes without the listener (it checks the behaviour).
- The permissions are unchanged.

## Do not
Change what the badge shows. Add a replacement for the listener.

## Results

1. Removed the `tabs.onUpdated` listener from `src/background/index.ts`, the function `clearBadge` from `src/background/badge.ts`, and its unit test. The built `background.js` no longer contains `onUpdated`. A comment where the badge is set says that Chrome does the reset and names the e2e test.
2. Checks: `npm run typecheck` clean; `npm run test` 139 of 139 (140 before, minus the one `clearBadge` test); `npm run test:e2e` 19 of 19, two runs, 4.9 and 5.6 s; `npm run zip` 280.15 kB (280.20 before); permissions still `activeTab`, `scripting`, `storage`, no host permissions.
3. The badge test “is reset when the tab loads another page” passes without the listener, as the finding of stage 20 said. It is the only guard of this behaviour now.
4. Not checked: older and newer Chrome versions. The reset is what the Chromium used here does; if another version stops doing it, the e2e test fails and the listener has to come back. Not checked: a reset after a same-page navigation that does not load a document (for example the History API), where an old count would stay until the next check, which is the same as before this stage.
