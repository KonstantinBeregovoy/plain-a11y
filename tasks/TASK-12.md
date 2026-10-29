# TASK-12: Dictionary, part 3 of 4

Goal: describe in plain language: text-alternatives, name-role-value and forms (18 rules).

## Steps
1. Add dictionary entries for all rules: the rules of the categories text-alternatives, name-role-value and forms that are on by default and not yet described. Take the list from axe.getRules() and from the categories (cat.* tags), not from memory.
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

1. Entries are added for 18 rules: text-alternatives (9), name-role-value (5), forms (4). The list is taken from axe.getRules() by the cat.* tags among the rules that are on by default and not yet described. Technical terms are replaced by understandable words (“vector graphic” instead of SVG, “clickable picture” instead of image map). The dictionary now has 76 entries.
2. Tests (70, all pass): the coverage test is extended with the categories text-alternatives (12), name-role-value (7) and forms (5), counting the entries of earlier stages. The role test is updated: a role other than code went only to the rules about texts (content) and label-title-only (design).
3. Checked in Chromium on a page with violations: 14 of the 18 new rules fired, all have our texts, there is no fallback. Did not fire: frame-title-unique and form-field-multiple-labels (most likely axe treats them as “needs a manual check” cases), video-caption (axe cannot know by itself whether there are captions) and server-side-image-map (needs special markup). For them only the dictionary tests were checked. The axe audit over 14 popup states: 0 violations.

### Roles to review

- The role content went to the rules about text descriptions and labels: area-alt, image-redundant-alt, input-image-alt, object-alt, role-img-alt, svg-img-alt, empty-heading, empty-table-header, video-caption. A content manager thinks up the description, and a developer, as a rule, puts it into the markup. It is the same logic as in the existing image-alt.
- input-button-name and summary-name: the role code. The text of a button or of a section heading is thought up by content, but the task is in the markup, like button-name. If you want all three rules to go to content, it is a role replacement in three entries.
- label-title-only: the role design, because the question is whether to show the label visibly (a layout decision). A developer more often fixes it, following the designer's layout.
- video-caption: the role content (content prepares the captions), but setting up the player may need a developer.
- server-side-image-map, frame-title-unique, aria-hidden-focus, autocomplete-valid, form-field-multiple-labels, select-name: the role code, certain.
