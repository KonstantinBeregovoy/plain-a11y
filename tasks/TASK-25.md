# TASK-25: A changelog for users and for the repository

Goal: a person can see what each version added and changed, with dates, in one place on the website, and the repository keeps the full list in one agreed format.

## Steps
1. `CHANGELOG.md` is kept as: newest version first, heading `## <version> - <date>`, the date as `YYYY-MM-DD`, groups Added, Changed, Fixed, Privacy and Internal. The date is the day the version appeared in the Chrome Web Store. A version under review says so and gets its date when the store approves it.
2. Version 0.1.0 is recorded as the launch of the base version, dated 30 October 2026.
3. The website has a page `/changelog` with the same two versions in plain words, linked from the navigation and the footer of every page, listed in the sitemap and in `llms.txt` (its own pull request in the website repository).
4. A test keeps the newest entry equal to the version in `package.json` and checks the date format.

## Acceptance criteria
- `npm run typecheck`, `npm run test`, `npm run build` pass; the permissions and the package are unchanged.
- The new test fails when the newest entry is not the version in `package.json`.
- The website tests fail for a wrong date, a date in the future and versions in the wrong order.

## Do not
Put a date on a version before the store has approved it. Change the code of the extension.

## Release routine (from now on)
1. Add the entry for the new version to `CHANGELOG.md` in the pull request that changes the code, with “under review in the Chrome Web Store”.
2. When the store approves the version, replace that line with the date in `CHANGELOG.md`, and in the same way in `public/changelog.html` of the website (a `<time datetime>` element instead of the “Under review” line).
3. Make the GitHub release for the tag with the same text (the owner decides).

## Results
1. `CHANGELOG.md` is regrouped (Added, Changed, Privacy, Internal), 0.1.0 is “Launch of the base version” with the date 2026-10-30, 0.2.0 is “under review in the Chrome Web Store”. One test in `tests/package.test.ts` (165 Vitest tests now); changing the newest entry to another version made it fail.
2. The website page is in the website repository (pull request “Changelog page”): 102 website tests, three mutations (an impossible date, a date in the future, versions in the wrong order) each failed the right test.
3. Not checked: the page on the live site (after the merge), the Chrome Web Store page of the new version.
