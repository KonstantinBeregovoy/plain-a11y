# TASK-16: Highlighting elements in shadow DOM

Goal: the “Show on page” button works for elements inside shadow DOM.

## Steps
1. Teach the highlight to find elements by the axe selectors for shadow DOM (chains like [['#host', 'img']]) and to scroll to the first one found.
2. The ViolationItem type also accepts such selectors, and not only simple ones.
3. Elements inside an iframe are still not highlighted: for such problems the button stays disabled, and next to it is a short explanation why (in text, not only by color).
4. The page markup after the highlight is removed equals the original, as before.

## Acceptance criteria
- All checks from earlier stages pass.
- Unit test (jsdom): highlighting and removing in an open shadow root returns the markup to the original.
- An axe test on the popup with a problem in an iframe: the explanation is there, no violations.
- The agent checks in Chromium a page with shadow DOM: the element is outlined, the page is scrolled to it.

## Do not
Checking the content of iframes, closed shadow roots.

## Agent results

1. The new type HighlightTarget (src/report/violations.ts): a string (a simple selector) or an array of strings (a path through open shadow roots: the first selector is searched in the document, each next one inside the shadow root of the element found). The parsing of axe targets: a simple selector and a path through a shadow root go to ViolationItem.targets, targets with several records (an iframe, including together with shadow DOM) and invalid targets are skipped. The type of the highlight message and its check in messages.ts are updated.
2. The highlight (src/content/highlight.ts) finds elements by a path through shadow roots, supports nested shadow roots, scrolls to the first one found (including one inside a shadow root) and returns the page to the original markup. Closed shadow roots are not accessible, and such paths give “nothing found” without an error.
3. For problems without targets (elements inside an iframe) the “Show on page” button stays disabled, and next to it the text: “Cannot be shown on the page: the elements are inside an embedded frame.” The button is linked with the explanation through aria-describedby. Right now this state does not occur on a real page: we check only the top page, and the content of iframes does not get into the report (see docs/ROADMAP.md, the backlog). The state is checked by a test and in Chromium with a substituted answer.
4. Tests: 117, all pass. New ones: parsing axe targets (simple, shadow, nested shadow, iframe, invalid), the check of the highlight message, 7 tests of the highlight in shadow DOM (highlight and restoring, nested paths, a mix of simple and shadow, scrolling to the first, the original style inside a shadow root, closed and missing hosts, replacing the previous highlight), 2 popup tests (the explanation for an iframe, sending the path to the page). The markup comparison includes the content of open shadow roots, because outerHTML does not show it.
5. A test page tests/fixtures/shadow.html: problems in an open shadow root and in a nested one, far beyond the first screen (1800 px).
6. Checked in Chromium: image-alt (2 elements, one in a nested shadow root) and button-name are found, the button is enabled; pressing outlines both images, the page is scrolled from 0 to 1310 px; after removal and after closing the popup the markup together with the content of the shadow roots equals the original. The axe audit: the main 14 states, 4 states of the manual review, 4 states of the AAA block and the state with the explanation about an iframe in both schemes: 0 violations. A regression of the highlight on basic.html (turning on and off for all problems, closing the popup): the markup matches.
7. In the README, docs/a11y-checklist.md and docs/ROADMAP.md the outdated wordings are updated. Stages 7–16 in the roadmap are marked as done.

### Note

Closed shadow roots are in principle not accessible from the page of the extension; this is a browser limit. axe does not see their content either, so there will be no problems from closed shadow roots in the report.
