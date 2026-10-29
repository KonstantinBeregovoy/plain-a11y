# TASK-2: Plain language

Goal: instead of technical rule ids the popup shows understandable descriptions.

## Steps
1. Create a dictionary in src/dictionary. The fields of an entry: id (the axe rule), title, whoIsAffected, howToFix, role (design, content or code).
2. Cover the rules: color-contrast, image-alt, label, link-name, button-name, heading-order, document-title, html-has-lang, frame-title, tabindex.
3. For a rule that is not in the dictionary, show the help text from axe and the role code.
4. The popup shows title, whoIsAffected and howToFix instead of the id. The technical id stays as a small caption.
5. Write the texts in simple words, without WCAG and ARIA terms, no longer than two sentences in each field.

## Acceptance criteria
- All checks from TASK-1 pass.
- Unit test: every dictionary entry has all fields filled.
- Unit test: every id in the dictionary exists in the list of rules that axe.getRules() returns.
- Unit test: the fallback works for an unknown rule.
- On basic.html the four expected violations are shown with understandable descriptions.

## Do not
Grouping, highlighting, export.
