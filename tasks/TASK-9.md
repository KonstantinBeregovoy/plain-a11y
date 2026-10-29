# TASK-9: The target-size rule

Goal: check the size of clickable targets by WCAG 2.2 AA. In axe this rule is off by default.

## Steps
1. Turn the target-size rule on when axe runs (the rules option in the axe.run call).
2. Add an entry to the dictionary: a plain title, who it affects, how to fix it, the role design. Write the texts by the rules of TASK-2.
3. Add a small button to tests/fixtures/basic.html (with an aria-label, so that button-name does not fire) that breaks the rule.

## Acceptance criteria
- All checks from earlier stages pass.
- Unit test: in the axe run the target-size rule is on, and the list of the other options has not changed.
- The dictionary unit test covers the new entry (all fields, the id exists in axe.getRules()).
- On the updated basic.html the agent sees target-size in Chromium together with the earlier four rules.

## Do not
Other rules that are off.

## Agent results and deviations

1. The axe run options are moved into src/content/axeOptions.ts (AXE_RUN_OPTIONS: preload false and the target-size rule on). This way a test can check them, and the content script uses one constant.
2. A dictionary entry for target-size was added (role design). The texts pass the existing simplicity tests.
3. Two tiny buttons (12x12 px, with an aria-label) next to each other were added to tests/fixtures/basic.html. One button is not enough: by the rule, the size of a target is not checked if there is a free circle with a diameter of 24 px around it, so a single small button passes. Now basic.html has 5 problems instead of 4: image-alt, label, color-contrast, link-name, target-size (2 elements).
4. Tests: tests/axeOptions.test.ts (3 tests), the target-size dictionary entry in tests/dictionary.test.ts, the check in tests/package.test.ts is updated for AXE_RUN_OPTIONS. 62 tests in all.
5. In Chromium: all 5 rules are found, target-size has a correct description, the highlight outlines both buttons, after removal the markup equals the original, and on a clean page with a 40x40 px button there are no violations. The axe audit over 14 popup states: 0 violations.
