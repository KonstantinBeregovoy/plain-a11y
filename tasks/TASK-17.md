# TASK-17: “Show on page” for elements with no visible area

Goal: the “Show on page” button does not stay silent and does not outline “nothing” when the problem element has no visible area on the page.

Found in the first manual check (29 October 2026): not all elements are outlined. The cause was checked in Chromium on a test page: the outline is not visible for empty links and buttons (`<a href></a>`, size 0×0), for elements in `<head>` (`display: none`: `meta-viewport`, `meta-refresh`), for visually hidden elements (1 px) and for wrappers with `display: contents`.

## Steps
1. If the element found has no visible area (width and height not more than 1 px), outline the nearest ancestor inside `body` that has one. An ancestor shared by several matches is outlined once. The climb also goes from an open shadow root to its host.
2. Elements outside `body` (in `<head>`) and elements that have no ancestor with a visible area are not outlined. The page itself (`html`) and `body` are outlined as before.
3. The answer to the `highlight` message gets the fields `nearest` (how many matches are shown through an ancestor) and `notVisible` (how many cannot be shown).
4. In the extension window: if something was shown through an ancestor, the message gets “Some have no visible area, so their nearest visible parent is outlined.” added; if there is nothing to outline, the message “Cannot be outlined: the element has no visible area on the page (it is empty, hidden or in the page head).” instead of “Element not found on the page.”.
5. The page markup after the highlight is removed equals the original, as before.

## Acceptance criteria
- All checks from earlier stages pass.
- Unit tests (jsdom, visibility set by a substitute function): an ancestor, a shared ancestor counted once, `<head>`, no visible ancestor, `html`, the climb from a shadow root to the host.
- Popup tests: three messages (through an ancestor, cannot be outlined, the usual one), axe without violations.
- A check in Chromium with the built extension on a page with problems of all types: the highlight goes along the real path (check, highlight, removal), the markup after all highlights equals the original.

## Do not
Clipping of the outline by a parent with `overflow: hidden`, checking iframes, closed shadow roots, a separate style for an “approximate” highlight.

## Agent results

1. `createHighlighter(doc, hasBox)`: the second argument sets the check of the visible area (by default a size of at least 2×2 px), and in jsdom tests its own is substituted. `show` returns `{ found, nearest, notVisible }`. Files: `src/content/highlight.ts`, `src/content/index.ts`, `src/report/messages.ts`, `src/popup/useHighlight.ts`.
2. Tests: 131, all pass (there were 122: 6 new highlight tests, 3 new popup message tests). A test found a hole in the first version: the mock counted `<head>` as visible; an explicit check “the element is inside body” was added.
3. Checked in Chromium with the built extension (a copy with `host_permissions: <all_urls>`, the main manifest was not changed), 15 axe violations on a page with typical cases, the whole path through `run-check` and `highlight`: `link-name` — 1 element through an ancestor and 2 cannot be outlined, `aria-command-name`, `meta-viewport`, `meta-refresh` — “cannot be outlined” (0 found), the other rules are outlined as before. The markup after all highlights matched the original.
4. A deviation from what was agreed: for the case “cannot be outlined” the button is not replaced by text in advance (whether the element is visible is not known beforehand), and the message appears after the press in a `role="status"` area. The wording is wider than agreed (“empty, hidden or in the page head”): an empty link directly in `body` also falls here, and “in the page head” would be wrong for it.
5. A note about the check: when the markup was restored, Playwright left `style=""` on an `input`. The cause was the screenshot itself, taken during the highlight, and not the extension: without the screenshot the markup matches.

### Not resolved
- The outline is clipped by a parent with `overflow: hidden` (an entry in the roadmap).
- The real cases from the owner's manual check: waiting for examples after publishing.
