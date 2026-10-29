# TASK-13: Dictionary, part 4 of 4

Goal: describe in plain language: tables, language, time-and-media, parsing, sensory-and-visual-cues and color (15 rules).

## Steps
1. Add dictionary entries for all rules: the rules of the categories tables, language, time-and-media, parsing, sensory-and-visual-cues and color that are on by default and not yet described. Take the list from axe.getRules() and from the categories (cat.* tags), not from memory.
2. Fields and texts by the rules of TASK-2: in simple words, without WCAG and ARIA terms, no longer than two sentences in each field, all in English.
3. Choose the role by who usually fixes the problem. For purely technical rules the role is code. If the role is disputable, pick the most likely one and write the rule at the end of this file in the list “Roles to review”.

## Acceptance criteria
- All checks from earlier stages pass.
- Unit test: every new entry has all fields filled, the id exists in axe.getRules(), the texts pass the existing simplicity checks.
- Unit test: all rules of this part are present in the dictionary.
- A final unit test: every rule that axe has on by default has a dictionary entry.
- The end of the file has the list “Roles to review”.

## Do not
Rules from other parts, rules that are off by default, changing entries that are already written.

## Agent results

1. Entries are added for the last 15 rules: tables (4), language (3), time-and-media (3), parsing (2), sensory-and-visual-cues (2), color (1). The list is taken from axe.getRules(): all rules that are on by default and had no entry yet. The dictionary now has 91 entries: all 90 rules that are on by default and target-size, which we turned on ourselves.
2. The final test: the set of ids in the dictionary equals the set of rules that are on by default in axe, plus target-size (the EXTRA list in the test; rules we turn on later must be added to it, for example the AAA ones in TASK-15). The test fails both on a missing rule and on an extra entry. The coverage tests by category are extended. 77 tests in all, all pass.
3. Checked in Chromium on a page with violations: 10 of the 15 new rules fired, all have our texts, there is no fallback. Could not be triggered: th-has-data-cells, html-xml-lang-mismatch, no-autoplay-audio, duplicate-id-aria, link-in-text-block (they need special conditions: for example, no-autoplay-audio needs sound longer than three seconds, link-in-text-block needs certain colors). For them only the dictionary tests were checked. The first check run in Chromium hung waiting for the list, the repeat passed (most likely a start-up delay, not a code error). The axe audit over 14 popup states: 0 violations.
4. In the README the outdated phrase “the dictionary covers 10 rules” is fixed.

### Roles to review

All 15 rules got the role code, except link-in-text-block (design: it needs an underline or another difference, and that is a layout decision).

- blink, marquee: the role code (remove the outdated tag), but what to replace the moving text with will be decided by design.
- no-autoplay-audio: the role code (a player setting), but the decision “is autoplay needed or not” is made by design or content.
- meta-viewport, meta-viewport-large: the role code, certain (page settings).
- scope-attr-valid, table-duplicate-name, td-headers-attr, th-has-data-cells: the role code. If a table was built in a visual CMS editor, a content manager fixes it (the same logic as for the lists in TASK-11).
- html-lang-valid, html-xml-lang-mismatch, valid-lang, meta-refresh, duplicate-id-aria: the role code, certain.
