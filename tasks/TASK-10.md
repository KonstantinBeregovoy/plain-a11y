# TASK-10: Dictionary, part 1 of 4

Goal: describe in plain language: aria (24 rules).

## Steps
1. Add dictionary entries for all rules: all rules of the aria category that are on by default and not yet described. Take the list from axe.getRules() and from the categories (cat.* tags), not from memory.
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

1. Entries are added for 24 rules of the aria category that axe runs by default (the list is taken from axe.getRules() by the tag cat.aria). The texts are in English, without the words WCAG and ARIA, no longer than two sentences per field, all roles code. The dictionary now has 35 entries.
2. The test “the dictionary contains exactly the rules from the tasks” is replaced by the test “contains the rules from earlier tasks”, because the dictionary grows. Tests added: all 24 rules of the aria category are described, all have the role code. 64 tests in all, all pass.
3. Checked in Chromium on a page with 10 violations of this category: all show our titles and texts, there is no fallback. The axe audit over 14 popup states: 0 violations.

### Roles to review

All 24 entries got the role code, because developers fix them. For these rules the question “code or content” is disputable, because the needed text (a name, a label) is usually thought up by a content manager, and a developer puts it into the markup:

- aria-command-name, aria-input-field-name, aria-toggle-field-name: the name of a control (a button, a field, a switch).
- aria-dialog-name, aria-tab-name, aria-treeitem-name: the name of a dialog, a tab, a tree item.
- aria-meter-name, aria-progressbar-name: the name of an indicator.
- aria-tooltip-name: the text of a tooltip.
- aria-braille-equivalent: plain text next to a braille label.

The other 14 rules (aria-allowed-attr, aria-allowed-role, aria-conditional-attr, aria-deprecated-role, aria-hidden-body, aria-prohibited-attr, aria-required-attr, aria-required-children, aria-required-parent, aria-roles, aria-text, aria-valid-attr, aria-valid-attr-value, presentation-role-conflict) are purely technical, and the role code is certain.

If you want the report to hand the task to Content for the first group, say so: it is a role replacement in 10 entries.
