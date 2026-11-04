# TASK-27: Release 0.2.1 for two stores

Goal: version 0.2.1 is prepared so that the Chrome Web Store and addons.mozilla.org (AMO) get the same version number built from the same code, and the changelog format and the release routine work for two stores.

Decided by the owner on 5 November 2026. Why 0.2.1 for both: the Chrome package in the store (0.2.0, tag `v0.2.0` on commit `40bec1e`) does not have the change of `tasks/TASK-26.md` in the shared code (`startsNewPage`), and the first Firefox package does. One number for one code is simpler to explain and to support.

## Steps
1. `package.json` and `package-lock.json`: version 0.2.1. The manifest takes the version from there.
2. `CHANGELOG.md`: a new entry `0.2.1 - under review` (Added: the Firefox version; Changed: the Firefox address-change signal; Privacy: no change; Internal). The header now says that the date is the day the version first appeared in a store, and that an unreleased version says “under review”.
3. The test in `tests/package.test.ts` accepts `under review` instead of “under review in the Chrome Web Store”; the rest of the check is unchanged (newest entry is the version in `package.json`, ISO dates, the last entry is 0.1.0).
4. The website page `/changelog` gets the same entry (a pull request in the website repository, a draft until a store approves the version).

## Acceptance criteria
- `npm run typecheck`, `npm run test`, `npm run build`, `npm run zip` and `npm run zip:firefox` pass. Both manifests say version 0.2.1, with the same three permissions.
- The changelog test fails when the newest entry is not the version in `package.json`, and when an entry has neither an ISO date nor “under review”.

## Do not
Put a date on 0.2.1 before a store has approved it. Change the code or the permissions. Change the privacy texts (their own pull request, because they still speak about Chrome only).

## Release routine for two stores (replaces the routine in `TASK-25.md`)
1. Merge the extension pull request. Build the archives from `main`: `npm ci`, `npm run test`, `npm run zip` and `npm run zip:firefox`.
2. The owner uploads `plain-a11y-<version>-chrome.zip` to the Chrome Web Store and `plain-a11y-<version>-firefox.zip` with `plain-a11y-<version>-sources.zip` to AMO (steps in `docs/FIREFOX.md`).
3. When the first store approves the version: put its date into `CHANGELOG.md` and into `public/changelog.html`, make the website pull request ready, and the owner merges it (a merge deploys the site at once). The texts must be true on that day: if only one store has approved, say so in the entry.
4. When the version is in the store: a tag and a GitHub release with the archive, built from the commit that made the archive (`40bec1e` and `v0.2.0` are the example); the owner decides.

## Results
1. Version 0.2.1 in `package.json` and `package-lock.json`; the Chrome and the Firefox manifests built from the branch both say 0.2.1 with `activeTab`, `scripting`, `storage` and no host permissions.
2. `CHANGELOG.md`: the 0.2.1 entry and the new header rule. The test accepts `under review`: 170 Vitest tests pass. Two mutations each failed that test: the newest entry changed to 0.2.2, and the old wording “under review in the Chrome Web Store”.
3. `npm run typecheck`, `npm run build`, `npm run zip` and `npm run zip:firefox` pass. The archives made on the branch are only a check: the ones to upload are built from `main` after the merge (step 1 of the routine).
4. Not done here: the website entry (its own draft pull request), the privacy texts for Firefox, `docs/ROADMAP.md` and `docs/PROJECT_LOG.md`, the upload to the stores (the owner).
