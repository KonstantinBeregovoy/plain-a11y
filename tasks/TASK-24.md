# TASK-24: Counts of elements, three groups, a yellow mark

Goal: the number on the icon and the summary line in the popup tell the truth about the size of a result and about its three groups (issues, items for a manual review, AAA recommendations), and a person is told when there are no issues but there is something to look at.

Found in the owner's first use of version 0.2.0 on LinkedIn (1 November 2026): the icon showed 5, while the popup listed 8 elements with issues, 14 elements for a manual review and 21 AAA elements. The 5 was the number of **kinds** of problem. The owner also pointed out that a link “Notifications” that shows “5 unread” is normal and only needs a person's look, so a difference between the visible text and the accessible name belongs to the manual review.

## Steps
1. One function counts a result: for each of the three lists, the number of elements (the sum of `nodeCount`) and the number of kinds (the length of the list). The icon and the popup use it.
2. The icon: with issues, a red number of the elements with issues (up to 99, then “99+”). With no issues but with items for a manual review or AAA recommendations, a black “!” on amber. With nothing, no text. Both pairs of colors have a contrast of at least 4.5:1.
3. The tooltip of the icon names the groups that are not empty: “Plain A11y: 8 issues, 14 to review by hand, 21 AAA recommendations in the last check”. It never says that a page is accessible or has “no issues”.
4. The summary line of the popup: “Issues found: 8 (5 kinds). Needs manual review: 14 (5 kinds). AAA recommendations: 21 (1 kind).” Empty groups are left out, and with no issues it begins “No issues found.”
5. The rule `label-content-name-mismatch` is a review-only rule: its violations are listed under “Needs manual review”. When the same rule is in both lists of one axe run, there is one item with the elements added up.
6. The release texts say the same: `PRIVACY.md` (the kept result and the new icon), `store/listing.md`, the changelog, the log, the roadmap, the README, the article drafts. The privacy page of the website changes in its own pull request, which is merged on the day the version is approved.

## Acceptance criteria
- `npm run typecheck`, `npm run test`, `npm run build` and `npm run zip` pass; the permissions are still `activeTab`, `scripting` and `storage`.
- Unit tests for the counts, the line, the look, the tooltip (singular, plural, empty groups, no “accessible”), the colors (contrast, the two looks differ), the moved rule and the merge of one rule from two lists; the popup tests and the axe audit of the popup pass with the new line.
- In Chromium with the built extension: `basic.html` gives 5 kinds and 6 elements and the icon shows 6 in red; `aaa.html` shows “2” and a tooltip with the AAA group; `review.html` and a page with a name mismatch show an amber “!”; a clean page shows nothing. Breaking each rule on purpose makes a test fail.

## Do not
Count the manual review or the AAA elements in the red number. Show a number for the amber mark (a number there would look like a count of issues). Show any mark for a result with nothing in it. Change the texts of the dictionary.

## Results
1. New `src/report/summary.ts` (`summarize`, `summaryLine`). `src/background/badge.ts` has `badgeLook`, `badgeTitle` and `showResultBadge` instead of the old count functions (`clearIssueCount` stays). `src/report/violations.ts` has `REVIEW_ONLY_RULES` (one rule) and a merge by rule id. `src/popup/App.tsx` shows `summaryLine`. Colors: red `#a01d17` with white (7.8:1), amber `#ffc107` with black (about 12:1); the tests require at least 4.5:1.
2. Measured before coding (Chromium, built extension, local pages): `basic.html` has 5 kinds and 6 elements (target-size has 2), `aaa.html` 2 issues and 1 AAA element, `review.html` 2 elements for a manual review and no issues, and a page with a link `aria-label="Notifications"` that shows “5” gives `label-content-name-mismatch` as a violation. A new fixture `tests/fixtures/mismatch.html` holds that case.
3. Tests: 164 Vitest tests, all pass (153 after stage 23; new: counts and the line, the look, the tooltip, the colors, the moved rule and the merge, two guards on the privacy texts). 33 browser tests, all pass (29 after stage 23; new: the tooltip with the AAA group, the amber mark for a manual review only, the amber mark for the name mismatch, the moved rule in the real check). `typecheck`, `build`, `zip` pass; the zip is 281.20 kB, permissions `activeTab`, `scripting`, `storage`, no host permissions, description 125 characters.
4. Mutations (the source was changed, the tests run, the file restored): counting kinds instead of elements fails 7 Vitest and 11 browser tests; an empty review-only list fails 2 and 2; the amber mark also for a clean result fails 2 and 1; the amber mark ignoring AAA fails 1 Vitest test and **no browser test** (the AAA-only case is covered only by the unit test, not in a browser).
5. Texts changed with the code: `PRIVACY.md` (a new point for the kept result, a changed point for the icon, the `storage` line), `store/listing.md` (bullets and the `storage` justification), `README.md`, `CHANGELOG.md`, `docs/PROJECT_LOG.md`, `docs/ROADMAP.md`, `docs/articles/` (parts 2, 5, 6, FACTS, the plan). The old claim in part 5 and 6 that Chrome resets the badge “by itself” was narrowed: it is true for a full navigation only. The privacy page of the website is a separate pull request in the other repository.
6. Not checked: the real popup opened by a click on the icon in a normal profile; how the amber “!” looks on a real toolbar in the light and dark themes; Chrome older than 110 (badge colors) and older than 112 (`storage.session` quota); that LinkedIn gives `label-content-name-mismatch` as a manual review now (the same rule on a local page does); the store form (the data disclosure and the `storage` justification must be updated by the owner); Windows and Linux.

## Questions
1. The mark is “!” and not a circle. A circle is a glyph that some fonts draw badly at badge size, and “!” is also read by people who do not tell yellow from red. If you prefer a circle, it is one constant (`ATTENTION_MARK`).
2. The rule list for the manual review has one entry. Other rules where a difference is often fine can be added to `REVIEW_ONLY_RULES` after real cases are seen.
