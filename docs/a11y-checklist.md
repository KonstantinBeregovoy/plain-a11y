# Accessibility checklist of the extension interface

Goal: the Plain A11y interface meets WCAG 2.2 AA (see SPEC.md).

Legend:
- `[x]` done and verified by the agent, the way of checking is given next to it;
- `[ ]` needs a check by a person, the agent cannot do it.

## Automated checks

- [x] An axe test on all popup states: empty, loading, result (including a pressed highlight), result without issues, error, result with a “Needs manual review” section, and no issues with only review items. File `tests/popup.a11y.test.tsx`, run with `npm run test`. jsdom has no layout, so the contrast rule is turned off in the test, and contrast and target size were checked in a browser (below).
- [x] The same rule set (WCAG 2.0, 2.1, 2.2 A and AA, best-practice) was run in a real Chromium on the built extension, including `color-contrast` and `target-size`: 7 states (empty, loading, result, result with highlight, result with filter, result without issues, error), light and dark scheme, 14 runs in total, 0 violations. Two more states were added later for the “Needs manual review” section (only review items, and issues only), both schemes: 4 more runs, 0 violations. These runs were done by scripts outside the repository and are not part of `npm run test`.

## Keyboard

- [x] Tab order (checked in Chromium): “Check page”, “Copy report”, the role filter (one stop for the radio group, switched with arrow keys), then the “Show on page” buttons from top to bottom. The order matches the visual order.
- [x] All actions are available from the keyboard: check, copy, filter, highlight (native `button` and `input[type=radio]`).
- [x] Focus stays on the “Check page” button while the check runs. There was a bug: `disabled` dropped focus to `body`. Fixed by replacing it with `aria-disabled`, and there is a regression test.
- [ ] Person: go through the whole popup with the keyboard only in regular Chrome, opening the popup by clicking the icon, and make sure focus returns to the page after closing with Escape.

## Visible focus

- [x] Every interactive element gets a solid 3 px `:focus-visible` outline in the main text color (checked through computed style in Chromium for all Tab stops). Contrast of the outline against the background: 17.4:1 in the light scheme, 15.5:1 in the dark one.
- [ ] Person: make sure by eye that the outline is not clipped by the edge of the popup.

## Announcing the result (aria-live)

- [x] A `role="status"` area with `aria-live="polite"` is in the markup from the first render. It receives “Checking…”, the issue count, “Highlighted elements…”, “Highlight removed”, “Report copied…”. Copying again is announced again.
- [x] A check error is shown through `role="alert"`.
- [ ] Person: verify in NVDA (Windows, Chrome) and VoiceOver (macOS, Chrome) that every message is actually spoken, not duplicated and in a sensible order.
- [ ] Person: verify how the headings are read (h1 → h2 severity → h3 role → h4 issue) and heading navigation, and the “Show on page: …” buttons (pressed state through `aria-pressed`).
- [ ] Person: a disabled “Show on page” button (for issues without a simple selector, for example inside an iframe) is skipped by Tab. Decide whether the reason needs to be explained in text.

## Contrast (at least 4.5:1 for text)

Calculated from the values in `src/popup/style.css`:

| Pair | Light scheme | Dark scheme |
| --- | --- | --- |
| Text on background | 17.40:1 | 15.55:1 |
| Primary button text on its background | 6.39:1 | 10.10:1 |
| Primary button against the page background (non-text element, 3:1 needed) | 6.39:1 | 10.12:1 |
| Field and divider border against the background (3:1 needed) | 4.54:1 | 6.19:1 |

- [x] The values were calculated, and `color-contrast` in Chromium gives 0 violations in both schemes.
- [x] Color is not the only carrier of meaning: severity and role are written in words in the headings, and the pressed state of the highlight button differs not only by fill but also by the `aria-pressed` value.
- [ ] Person: view the popup in Windows forced-colors (high contrast) mode and with text enlarged to 200%.

## Target size (at least 24×24 px)

- [x] Buttons are 170×37 and 191×37 px, radio buttons are 20×20 px inside labels at least 28 px tall; `target-size` in Chromium gives 0 violations.

## Text size

- [x] All font sizes in `src/popup/style.css` are in `rem`, so the font size set in the browser applies. `tests/style.test.ts` checks that no size is below 12px (0.75rem) and that the agreed scale holds: headings 16/14/13px, body and issue titles 13px, captions 12px.
- [x] Computed sizes checked in Chromium on the built extension (see the run notes in `tasks/TASK-8.md`).
- [ ] Person: view the popup with text enlarged to 200% (browser zoom) and with a larger font set in the browser settings (Settings, Appearance, Font size). Nothing should be cut off, overlap or need horizontal scrolling inside the popup.

## Motion and color scheme

- [x] `prefers-reduced-motion`: the popup styles have no animations or transitions. The highlight on the page scrolls smoothly only if the user did not ask for less motion (`src/content/highlight.ts`).
- [x] `prefers-color-scheme`: light and dark schemes are defined by variables in `src/popup/style.css`, and both were checked with axe in Chromium.
- [ ] Person: check the highlight on a page with “Reduce motion” turned on in the system settings.

## What is left for a person (summary)

1. A test with NVDA and VoiceOver (announcements, headings, buttons with `aria-pressed`).
2. A keyboard pass in regular Chrome after clicking the icon.
3. Forced-colors mode and text enlarged to 200%.
4. The highlight with “Reduce motion” turned on.
