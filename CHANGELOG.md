# Changelog

All notable changes to the extension. The website has its own repository and history.

## Unreleased (stage 23, next version)

- **Added:** the popup keeps the result of the last check of a tab. Closing and opening it again on the same page shows the same lists, with the time of the check and a note to press “Check page” to check again. The result is dropped, together with the number on the icon, when the tab loads another page (also after going back, a reload, a change of the address by a single-page site or of the `#fragment`), and when the tab is closed. It lives in `storage.session`, that is in the memory of the browser, and not on disk. No new permission (`tasks/TASK-23.md`).
- **To do before the release:** `PRIVACY.md`, the privacy page of the website and `store/listing.md` must say that the result is kept in memory for the tab (the sentences about “does not save” change).

## 0.2.0: prepared, not yet in the store

- **Added:** after “Check page”, the icon shows the number of issues found on that tab (the same number as “Issues found” in the popup). It is empty for zero issues, because an automated check cannot say that a page is accessible, and Chrome resets it when the tab loads another page. No new permission and nothing is stored (`tasks/TASK-19.md`, `tasks/TASK-21.md`).
- **Changed:** the short description in the manifest is now the one in `store/listing.md` (the store shows the manifest text), and a test keeps the two equal. The privacy policy says what happens to the number on the icon (`PRIVACY.md`, and the same text on the website).
- **Internal:** browser end-to-end tests in the repository (`npm run test:e2e`, 19 tests, `tasks/TASK-20.md`). Rules for contributors (`CONTRIBUTING.md`, `SECURITY.md`, an issue form for pages where the check goes wrong). The process files and task files are in English.

## 0.1.0: 30 October 2026

The first version in the Chrome Web Store.

- “Check page” runs axe-core 4.14.0 on the current tab. Problems are grouped by severity (Critical, Serious, Minor) and by role (Design, Content, Code), with a role filter that is remembered.
- A plain-language entry for 94 rules: what is wrong, who is affected, how to fix it. Rules without an entry show the axe text and the role Code.
- “Show on page” outlines the element and scrolls to it, also inside open shadow DOM. Elements with no visible area are shown through their nearest visible parent, or the popup says that nothing can be outlined. The page markup is restored exactly.
- A “Needs manual review” section for cases the engine could not decide, not counted as issues.
- An “AAA recommendations” block, not counted as issues, which can be hidden.
- “Copy report” puts a Markdown checklist on the clipboard, grouped by role.
- The `target-size` rule (WCAG 2.2 AA) is turned on.
- Three permissions only: `activeTab`, `scripting`, `storage`. No network requests, no remote code.
