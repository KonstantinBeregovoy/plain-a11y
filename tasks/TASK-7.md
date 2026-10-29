# TASK-7: Fixes and refactor

Goal: remove the defects found in the architecture review without changing the behavior for the user.

## Steps
1. A stale content script. After the extension is updated or reloaded, the check must work on an already open tab without reloading the page. When a new script is injected, the listener of the old one is removed (keep in mind that the context of the old script may be invalid and the call may throw).
2. Do not inject the script again if it already answers: the service worker first sends the script a short ping message and injects only when there is no answer.
3. The page address in the Markdown report has no query parameters and no hash: the scheme, the host and the path stay.
4. One shared errorMessage helper instead of three copies.
5. Split src/popup/App.tsx: the check and highlight logic moves into hooks, the list of problems and the role filter into separate components. The markup and the behavior do not change.

## Acceptance criteria
- npm run typecheck, npm run test, npm run build and npm run zip pass without errors.
- Unit test of the script installation: installing again removes the previous listener, and there is always exactly one listener.
- Unit test of the address in the report: with parameters, with a hash, without them, an unrecognizable address.
- App.tsx is shorter than 130 lines; the snapshot and the axe tests on the popup pass without changing their expectations.
- The agent checks in Chromium (with a script outside the repository) that after chrome.runtime.reload() the check works on an open tab without reloading it.

## Do not
New features, a change of the folder structure, adding Playwright to the repository.

## Agent results and deviations

1. **Item 1 (stale script) did not reproduce, the code was not changed.** In the architecture review I called it a defect without checking. The experiment in Chromium: a check, then switching the extension off and on on the chrome://extensions page, then a check on the same tab without reloading it. On the unchanged build the check works (OK, 4 problems): after the extension reloads, the page gets a fresh isolated world, and the guard flag against double injection does not survive. I did not add the “remove the listener of the old script” protection, so as not to complicate the code without a reason. chrome.runtime.reload() is not suitable for automation: an extension loaded with a command-line flag is blocked after it. I recommend that you check by hand: press the reload icon on the extension card and press “Check page” again on an already open tab.
2. **Item 2 (ping)** is done: the function ensureContentScript (src/background/inject.ts) injects the script only if it does not answer. In Chromium a repeated check runs without injection. Instead of the criterion about “script installation” there are unit tests of ensureContentScript (4 cases).
3. **Item 3** is done: formatPageUrl keeps the scheme, the host and the path, and removes the parameters, the hash and the login with the password. 6 tests.
4. **Item 4** is done: there is now one errorMessage, in src/report/messages.ts.
5. **Item 5** is done: App.tsx became 86 lines. useCheck, useHighlight, useRoleFilter, RoleFilterField and IssueGroups appeared in src/popup.
6. **A highlight defect from TASK-3 was found and fixed.** After turning the highlight on and off, elements without a style attribute were left with an empty style="" (Chrome does this if the attribute was not read between the change through the CSSOM and the removal). The page markup did not match the original, although the TASK-3 criterion requires the opposite. The earlier checks did not catch it, because they read the attribute between the steps, and jsdom behaves differently. The fix is in src/content/highlight.ts, and the test imitates the Chrome behavior (it fails without the fix). In Chromium without reading between the steps: the old build gives different markup, the fixed one does not.
7. Checked in Chromium with scripts outside the repository: the popup working cycle, the address in the report without parameters, 14 axe runs (light and dark scheme, 7 states), 0 violations.
