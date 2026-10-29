# TASK-11: Dictionary, part 2 of 4

Goal: describe in plain language: semantics, keyboard and structure (23 rules).

## Steps
1. Add dictionary entries for all rules: the rules of the categories semantics, keyboard and structure that are on by default and not yet described. Take the list from axe.getRules() and from the categories (cat.* tags), not from memory.
2. Fields and texts by the rules of TASK-2: in simple words, without WCAG and ARIA terms, no longer than two sentences in each field, all in English.
3. Choose the role by who usually fixes the problem. For purely technical rules the role is code. If the role is disputable, pick the most likely one and write the rule at the end of this file in the list “Roles to review”.

## Acceptance criteria
- All checks from earlier stages pass.
- Unit test: every new entry has all fields filled, the id exists in axe.getRules(), the texts pass the existing simplicity checks.
- Unit test: all rules of this part are present in the dictionary.
- The end of the file has the list “Roles to review”.

## Do not
Rules from other parts, rules that are off by default, changing entries that are already written.

## Agent results

1. Entries are added for 23 rules: semantics (10), keyboard (7), structure (6). The list is taken from axe.getRules() by the cat.* tags among the rules that are on by default and not yet described. The word “landmark” in the texts is replaced by “page area”, as clearer. The dictionary now has 58 entries.
2. Tests (67, all pass): a coverage test by the categories aria, semantics, keyboard, structure (the categories also count the entries from earlier stages, so the numbers are 24, 11, 8, 6) and a test on roles: apart from code, the role is not code only for color-contrast, target-size (design) and document-title, heading-order, image-alt, link-name, page-has-heading-one (content). The texts pass the simplicity checks (no WCAG and ARIA, no more than two sentences).
3. Checked in Chromium on three test pages: 18 of the 23 new rules fired, all show our texts, there is no fallback, page-has-heading-one went to the Content role. Could not be triggered in the browser: bypass, skip-link, avoid-inline-spacing, frame-focusable-content, frame-tested (they need special markup or a check inside an iframe). For them only the dictionary tests were checked. The axe audit over 14 popup states: 0 violations.
4. frame-tested means that axe could not check the content of an iframe. This relates to a known limit (the content of an iframe is not checked, see docs/ROADMAP.md). Most likely such cases will land in the “Needs manual review” section after TASK-14, and not in the violations.

### Roles to review

- page-has-heading-one: the role content is set (an editor writes the main heading), but a developer can also put it into the markup.
- label-content-name-mismatch: the role code. The fix is in the markup, but the button text (which content changes) can be the cause.
- list, listitem, definition-list, dlitem: the role code. If a list was built by a visual editor in a CMS, the broken structure is often created by a content manager.
- nested-interactive: the role code. This is often a design decision (a button inside a link card), and changing it has to be done together with the designer.
- bypass, skip-link: the role code. A “Skip to content” link is sometimes ordered by design.
- avoid-inline-spacing: the role code. If the spacing is set for the layout, the designer decides.
