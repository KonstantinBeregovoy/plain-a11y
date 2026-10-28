# Plain A11y

A Chrome extension that checks the open page for accessibility problems and explains them in plain language. For every problem it shows what is wrong, who it affects, how to fix it and who to hand the task to: a designer, a content editor or a developer.

Who it is for: designers, content editors, PMs and QA people without deep knowledge of WCAG. The reports of axe DevTools, WAVE and Lighthouse are written for developers. Here the report reads without jargon and is split by role right away.

## What it does

- The “Check page” button runs the check on the current tab.
- Problems are grouped by severity (critical, serious, minor) and by role (design, content, code). A role filter is available and is remembered.
- For every problem: what is wrong, who it affects, how to fix it. The technical rule id stays as a small caption.
- Cases the automated check could not decide on its own (axe calls them “incomplete”, for example text over a background picture or a video whose captions it cannot judge) are listed in a separate “Needs manual review” section. They are not counted as issues, have the same texts and highlight, and appear in the Markdown report in their own section.
- Three rules of the optional AAA level (enhanced contrast, links with the same text that lead to different places, delayed page refresh) are shown in a separate “AAA recommendations” block at the bottom. It is not counted as issues, can be hidden (the choice is remembered), and is included in the Markdown report only while it is shown.
- The “Show on page” button outlines the problem elements and scrolls to the first one. The highlight is removed by pressing the button again or by closing the popup, and the page markup returns to its original state.
- The “Copy report” button puts a Markdown report with checkboxes on the clipboard, ready to paste into a ticket.

## Install from source

You need Node.js and npm (tested on Node.js 22).

```bash
npm install
npm run build
```

Then in Chrome:

1. Open `chrome://extensions` and turn on “Developer mode”.
2. Click “Load unpacked” and choose the `.output/chrome-mv3` folder.
3. Open a page, click the extension icon and press “Check page”.

To check local files (`file://`), turn on “Allow access to file URLs” in the extension settings.

## Commands

| Command | What it does |
| --- | --- |
| `npm run build` | Builds the extension into `.output/chrome-mv3` |
| `npm run zip` | Builds the archive for upload to the Chrome Web Store: `.output/plain-a11y-<version>-chrome.zip` |
| `npm run typecheck` | Type check (TypeScript strict) |
| `npm run test` | Tests (Vitest) |
| `npm run icons` | Regenerates the 16, 48 and 128 px icons from `scripts/icon.svg` |
| `npm run dev` | Development build with reload |

## Architecture

```
popup (React)  ──run-check──▶  service worker  ──executeScript──▶  content script (axe-core)
      ▲                              │                                      │
      └────── list of problems ──────┴────────── axe result ◀───────────────┘
```

1. The popup sends a command to the service worker.
2. The service worker injects the content script into the active tab with `chrome.scripting.executeScript` and sends it a message.
3. The content script runs axe-core on the page and returns a compact list of violations.
4. The popup turns axe rules into plain words through the dictionary, groups the result and displays it.
5. The highlight takes the same route: popup → service worker → content script. While the popup is open it keeps a port to the service worker, and closing the popup removes the highlight.

Repository layout:

| Folder | What is inside |
| --- | --- |
| `src/popup` | React interface and settings storage |
| `src/background` | Service worker |
| `src/content` | axe-core runner and element highlight |
| `src/dictionary` | Rule dictionary: title, who is affected, how to fix, role |
| `src/report` | Grouping, Markdown export, message types |
| `tests` | Unit tests, an axe test of the popup itself, a page fixture |
| `docs` | Accessibility checklist of the extension itself |
| `store` | Chrome Web Store materials |
| `tasks` | Development task files, stage by stage |

### Why axe-core

Writing and maintaining your own accessibility rules is expensive and risky: it is easy to be wrong and to produce false positives. axe-core is a widely accepted open-source engine that has been maintained for years and runs entirely in the browser. The extension only makes its result understandable to a non-technical person. The axe-core version is pinned to an exact number in `package.json`, because the set of rules changes between versions and the dictionary relies on it. Update it deliberately and run the dictionary tests.

### Why Manifest V3

It is the format the Chrome Web Store requires for new extensions. It also enforces the right constraints: all code lives inside the package, there is no remotely loaded code, and permissions are minimal. The extension asks only for `activeTab`, `scripting` and `storage`, with no access to all sites: the check starts by clicking the icon and touches only the current tab.

## Limitations

- **Automated checking finds only part of the problems.** axe-core cannot judge meaning: whether an image is described well, whether a form is understandable, whether the tab order is logical. An empty report does not mean the page is accessible. This extension does not replace manual checking (keyboard, screen reader).
- The content of nested iframes is not included in the check.
- “Show on page” works for elements in the page and in open shadow DOM, including nested shadow roots. Elements in closed shadow roots cannot be reached, and issues inside iframes are not found at all, because the content of iframes is not checked. If an issue ever points into a frame, its button is disabled and the reason is written next to it.
- Chrome service pages (`chrome://…`) and the Chrome Web Store cannot be checked: the browser does not let extensions in.
- The interface, the dictionary and the report are in English only.
- The dictionary describes every rule axe runs by default (90), plus the minimum clickable size rule (`target-size`) and three AAA rules we switch on, 94 in total. A rule that is not in the dictionary, for example after an axe-core update, is shown with the English axe description and the role “code”. Experimental and deprecated rules, which axe keeps off by default, are not run.

## Privacy

The extension collects nothing and sends nothing. Details are in [PRIVACY.md](PRIVACY.md).

## Accessibility of the extension itself

The interface is checked with axe in the tests and in a real browser. What has been checked, and what is left for manual checking with a screen reader, is recorded in [docs/a11y-checklist.md](docs/a11y-checklist.md).

## License

Plain A11y is released under the [MIT License](LICENSE), copyright (c) 2026 Konstantin Beregovoy. The extension bundles axe-core (MPL-2.0) and React (MIT); see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
