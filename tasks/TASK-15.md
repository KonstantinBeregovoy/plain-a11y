# TASK-15: The “AAA recommendations” block

Goal: recommendations of the AAA level are shown separately from the problems of the AA level and are not counted as violations.

## Steps
1. Turn on three rules when axe runs: color-contrast-enhanced, identical-links-same-purpose, meta-refresh-no-exceptions.
2. Dictionary: entries for these three rules by the rules of TASK-2.
3. Popup: an “AAA recommendations” block always at the bottom of the list, with a note that these are optional recommendations. They are not in the “Issues found” counter and not in the groups by severity.
4. The block can be hidden. When it is hidden, in its place there is a line with a “Show AAA recommendations (N)” button. The choice is saved in chrome.storage.local and restored.
5. Markdown report: a separate “AAA recommendations” section at the end, only if the block is currently shown.

## Acceptance criteria
- All checks from earlier stages pass.
- Unit tests: splitting the AA and AAA results, saving and reading the setting, the section in the report.
- The axe test on the popup includes the states “block shown” and “block hidden”.
- The agent checks in Chromium that the hide and show button is reachable from the keyboard.

## Do not
Other AAA rules, settings for the conformance level.

## Agent results

1. Three rules (color-contrast-enhanced, identical-links-same-purpose, meta-refresh-no-exceptions) are turned on when axe runs. Their list AAA_RULE_IDS and the run options are in src/content/axeOptions.ts. The parsing of the result is moved into the pure function buildCheckResult (src/report/violations.ts): the AAA violations go into a separate list aaa, and neither they nor their “unclear” cases land in the main list or in the “Needs manual review” section. I deliberately drop the unclear AAA cases: otherwise enhanced contrast on any page with text on a picture would clutter the manual review section with optional items.
2. Dictionary: three entries (color-contrast-enhanced: design, identical-links-same-purpose: content, meta-refresh-no-exceptions: code), 94 in all. In the final coverage test the EXTRA list now includes target-size and the three AAA rules.
3. Popup: the block “AAA recommendations: N” is always at the bottom, with the explanation “Optional recommendations beyond the standard level. They are not counted as issues.”. It is not part of “Issues found”. The block is hidden with one button “Hide AAA recommendations”; when it is hidden, in its place there is the line “Hidden. These are optional recommendations beyond the standard level.” and the same button “Show AAA recommendations (N)”. The button stays in place and keeps the keyboard focus (with the list hidden it would otherwise disappear). The choice is remembered in chrome.storage.local (the key showAaa, the block is shown by default). The change of state is announced through aria-live (“AAA recommendations hidden/shown.”). The role filter also acts on the block. If there are no AAA problems, the block is not shown.
4. Markdown: the section “## AAA recommendations” at the very end, after the manual review section, only when the block is shown (a hidden block does not get into the report). An empty list of problems with only AAA items writes the old “found no issues”.
5. Tests: 107, all pass (the axe options, splitting the results, the showAaa setting, the report section, six popup tests: the block at the bottom, hiding with focus kept, remembering the choice, only AAA, the filter, the block absent without AAA problems). A test page tests/fixtures/aaa.html.
6. Checked in Chromium: on aaa.html “Issues found: 2” (image-alt, meta-refresh), the block “AAA recommendations: 1” (color-contrast-enhanced) at the bottom, the highlight outlines the paragraph and after removal the markup equals the original, hiding with the Enter key leaves the focus on the button, the hidden block does not get into the report, after closing and reopening the popup the choice was kept. The axe audit: the 14 earlier states, 4 states of the manual review section and 4 states of the AAA block (shown and hidden, both schemes): 0 violations.
7. The README and the checklist are updated; in the README two outdated phrases are fixed (the number of dictionary entries and “AAA are not run”).

### What could not be triggered in the browser

meta-refresh-no-exceptions: axe counts the rule as passed for a delay of an hour (checked with a raw axe run, without the extension), so it does not fire on the test page. identical-links-same-purpose is classified by axe as an “unclear” case (checked the same way), so by the design of the item it does not go into the AAA block. For both rules only the dictionary entries and the parsing logic were checked.
