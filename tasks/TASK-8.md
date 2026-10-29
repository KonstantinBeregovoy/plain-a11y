# TASK-8: Popup font size

Goal: the popup looks less large, but stays readable and accessible.

## Steps
1. Convert the font sizes in src/popup/style.css to rem, so they follow the font size setting of the browser.
2. New sizes: h1 16px, h2 14px, h3 13px, h4 13px, body text 13px, small caption 12px (this is the minimum, never go lower). Recalculate the rem values from 16px.
3. The size of clickable targets stays at least 24x24 px, the contrast does not change.

## Acceptance criteria
- All checks from earlier stages pass.
- A test reads style.css and checks that no font-size is smaller than 12px (0.75rem) and that the sizes are set in rem.
- The agent runs axe in Chromium (light and dark scheme, all popup states, including color-contrast and target-size): 0 violations.
- docs/a11y-checklist.md gets an item for a person: check the popup with text enlarged to 200% and with an enlarged font in the browser settings.

## Do not
Change colors, the popup width, the markup structure.

## Agent results and deviations

1. All font sizes in src/popup/style.css are converted to rem: body text 0.8125rem (13px), h1 1rem (16px), h2 0.875rem (14px), h3 and h4 0.8125rem (13px), caption 0.75rem (12px). They were 14, 18, 16, 14, 15 and 12px.
2. The h1 and h2 headings became 2px smaller, the body text 1px, the caption stayed 12px. I did not make the body text smaller than 13px: at 12px it is hard to read for people with low vision. If 12px is wanted for the body text too, it is one line in style.css.
3. tests/style.test.ts reads style.css and checks that all sizes are in rem, none is smaller than 0.75rem, and that the scale of sizes has not changed. The project has 59 tests.
4. Checked in Chromium with a script outside the repository: computed sizes body 13, h1 16, h2 14, h3 13, h4 13, caption 12; there is no text under 12px; when the root font is enlarged to 20px there is no horizontal scroll; the axe audit over 14 combinations (light and dark scheme, 7 states, including color-contrast and target-size): 0 violations.
5. A “Text size” section was added to docs/a11y-checklist.md with an item for a person: check the popup at 200% zoom and with an enlarged font in the browser settings. I did not check the 200% zoom automatically.
