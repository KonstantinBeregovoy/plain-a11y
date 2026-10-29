# TASK-1: Foundation

Goal: the project builds, and the extension runs axe-core on the current tab on a button press and shows a list of violations.

## Steps
1. Create a WXT + React + TypeScript (strict) project. Set up Vitest and the npm scripts typecheck, test, build.
2. Manifest V3 with the permissions activeTab, scripting, storage.
3. A popup with a “Check page” button.
4. On click, the service worker injects a content script with chrome.scripting.executeScript. The content script runs axe-core on the page and returns the violations.
5. For every violation the popup shows: the rule id, the impact and the number of affected elements.
6. Pin the axe-core version to an exact number in package.json.
7. Create tests/fixtures/basic.html with deliberate problems: an img without alt, an input without a label, text with low contrast, a link without text.

## Acceptance criteria
- npm run typecheck, npm run test and npm run build pass without errors.
- The built extension loads in chrome://extensions without errors.
- Checking basic.html shows at least the rules image-alt, label, color-contrast, link-name.
- There is a unit test of the function that turns an axe result into the list for the popup.

## Do not
A dictionary, grouping, highlighting, export.
