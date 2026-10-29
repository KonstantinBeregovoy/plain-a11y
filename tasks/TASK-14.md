# TASK-14: The “Needs manual review” section

Goal: show the cases that axe could not decide by itself (the incomplete results) in a separate section, so that an empty report does not sound more certain than it is.

## Steps
1. Besides the violations, the content script also returns incomplete in the same compact format.
2. The popup shows a “Needs manual review” section under the main list: the same titles and texts from the dictionary, with a note that axe could not decide by itself and a person is needed. These cases are not part of the “Issues found” counter.
3. The “Show on page” button works for these items too (highlighting and scrolling to the first element).
4. The Markdown report has a separate “Needs manual review” section. The message for an empty result mentions the number of such items, if there are any.
5. Rules that have no dictionary entry are shown with the axe text, as in the main list.

## Acceptance criteria
- All checks from earlier stages pass.
- Unit tests: parsing incomplete, the section in the report, an empty result with and without items for review.
- The axe test on the popup includes a state with the “Needs manual review” section without violations.
- The agent checks in Chromium a page on which axe returns incomplete (for example, text on a background image).

## Do not
A manual checklist with completion marks, saving the state of the items.

## Agent results

1. Besides the violations, the content script also returns review: the incomplete results in the same compact format (CheckResponse.review). The new function groupByRole groups them by role, and the function toMarkdown got an optional third parameter review.
2. Popup: after the main list, a section “Needs manual review: N” with the explanation “The automated check could not decide these on its own. A person needs to look at them.”, the items grouped by role (Design, Content, Code) with the same texts from the dictionary. These items are not part of “Issues found”. The summary line: “Issues found: 4 Needs manual review: 2.” or “No issues found. Needs manual review: 2.”. The role filter also acts on the section. If there are no problems but there are items for review, the filter and the section are still shown.
3. The highlight works for these items too. The same rule can be both in the violations and in the manual review (for example, color-contrast for different elements), so the highlight key now has the prefix review: and pressing in one list does not press the button in the other. For this useHighlight.toggle takes an optional key.
4. Markdown: the section “## Needs manual review” after the role sections, items of the form “- [ ] Design: title. If confirmed, how to fix: …”. For an empty result with items for review: “The automated check found no issues, but N items need a manual review (listed below). It covers only part of…”. Without items for review the old text and the snapshot did not change.
5. Rules without a dictionary entry are shown with the axe text, as in the main list (checked by the report test).
6. A test page tests/fixtures/review.html was added (text on a picture and a video without explicit captions); on it axe returns two items for review: color-contrast and video-caption.
7. Tests: 90, all pass (groupByRole, the section and the empty result in the report, four new popup tests: items for review together with problems, only items for review, independent highlighting of a copy of the rule, the role filter). The axe tests on the popup cover two new states, 0 violations.
8. Checked in Chromium: on review.html the summary is “No issues found. Needs manual review: 2.”, two items in the roles Design and Content, the highlight outlines the paragraph, after removal the markup equals the original, the report contains the new section. The axe audit in both schemes for the new states and the earlier 14 states: 0 violations.
9. The README and docs/a11y-checklist.md got a description of the new section and states.

### Note

In the section, the items have the caption “How to fix”, like the ordinary problems, although the problem is not yet confirmed. This is softened by the explanation at the start of the section, and in the Markdown the wording “If confirmed, how to fix” is used. If you want a different wording in the popup, it is an edit in one component (src/popup/IssueGroups.tsx).
