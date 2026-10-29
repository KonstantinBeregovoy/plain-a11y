# Project log

State of the project on 29 October 2026, the decisions behind it, and verifiable facts for writing about it. Facts come from the repository and from checks that can be run again; where a number was measured by a script outside the repository, the script is named.

## Where things stand

| Part | State |
| --- | --- |
| Extension (this repository) | Stages 1 to 17 are done. 131 tests. The popup header shows the AA logo. All commits are authored by the owner with the GitHub noreply address. |
| Website (`plain-a11y-site` repository) | Deployed on Cloudflare Workers at `a11y-ext.bereg.dev`. Pushes to `main` deploy by themselves. `workers.dev` and preview URLs are switched off in `wrangler.jsonc`. 45 tests. |
| GitHub | Both repositories exist and are private. The history was rewritten on 29 October 2026: every commit now uses `16078757+KonstantinBeregovoy@users.noreply.github.com`, no personal email is left in the history. |
| Name | “Plain A11y” checked by search: no exact match in Chrome Web Store, Firefox Add-ons, npm, PyPI. Close names: Plainwork (Accessibility Report), Omi A11Y, A11Y Audit, A11yTrail. The mark “A11Y” exists in the US (class 42), see the log below. WIPO and USPTO were not searched directly. |
| Contact | `contact@bereg.dev` (Cloudflare Email Routing to the owner's mailbox, tested). It is in the privacy policy (`PRIVACY.md` and the website). Not yet in `store/listing.md`. |
| Chrome Web Store | Not registered yet. The package (`npm run zip`, 280 KB), the listing text and 8 screenshots are ready. |
| Firefox | Not started. It is in the roadmap. |
| Testing by a person with a screen reader and a keyboard | First short run done on 29 October (logo, check, highlight). The full list in `docs/a11y-checklist.md` is not done. It is planned after publishing. |

### What is left, in order

1. Push stage 17 (a local commit may still wait for the owner's yes).
2. GitHub, Settings, Emails: turn on “Keep my email addresses private” and “Block command line pushes that expose my email”.
3. Decide what stays in the public repository: `SPEC.md`, `AGENTS.md`, `CLAUDE.md`, `tasks/` (they are process files; they were translated into English in stage 18, the earlier Russian versions stay in the history).
4. Website: the two placeholders (store link, GitHub link), the Install section (it says to build from source, but the repository is private, so there is nothing to download yet), headers like bereg.dev, PWA settings, GEO. Also add the contact to `store/listing.md`.
5. Make both repositories public (the owner does it).
6. Register in the Chrome Web Store (https://chrome.google.com/webstore/devconsole, $5, trader or non-trader, contact `contact@bereg.dev`), upload `.output/plain-a11y-0.1.0-chrome.zip`, screenshots 02 to 06, text and permission reasons from `store/listing.md`, policy address `https://a11y-ext.bereg.dev/privacy.html`.
7. After publishing: the owner's full manual check, the real cases of “Show on page” that still miss (page, issue, what happens), then fixes.
8. The article and the project card (ask first: the story of the product, or the process with AI).
9. Next stages in the roadmap: toolbar badge, selected block, compare two checks, Playwright tests in the repository, Firefox.

### What only the owner can do

1. Settings on GitHub and Cloudflare, the Chrome Web Store account, making the repositories public.
2. The full manual check with a keyboard, NVDA and VoiceOver.
3. A direct search of the name in WIPO and USPTO (optional).

## Decisions and why

1. **axe-core, not own rules.** Writing and keeping accessibility rules is expensive and error-prone. The extension only changes what the result looks like. The version is pinned to an exact number, because rules change between versions.
2. **Three permissions only** (`activeTab`, `scripting`, `storage`), no access to all sites, no network requests, no remote code. A test fails if this changes.
3. **No backend, accounts or analytics.** The product promise and the privacy policy are one sentence long because of it.
4. **Plain language for every rule.** All 94 rules the extension runs have a title, who is affected and how to fix it, and a role (Design, Content or Code). A test compares the dictionary with the rules of the installed axe-core, so a missing or extra entry fails.
5. **Honest limits.** An empty result says that automation covers only part of the requirements. Unclear cases go to “Needs manual review” and are not counted as issues. The icon has no check mark, because a check mark means “passed”.
6. **No automatic “accessible or not” badge.** Checking every page needs access to all sites, costs CPU, and a green badge would claim more than automation can. A badge with an issue count after a check, and an opt-in per-site auto check, are in the roadmap.
7. **English only.** The interface, the dictionary, the report and the documents. This includes the process files (`SPEC.md`, `AGENTS.md`, `tasks/`), translated in stage 18; the earlier Russian versions stay in the git history.
8. **MIT license.** Axe-core is MPL-2.0 and stays unchanged; its license and source link ship inside the package.
9. **The website is a separate static repository.** Plain HTML and CSS, no scripts, a strict Content Security Policy, meant to be deployed as Cloudflare Workers static assets like bereg.dev. Its design follows bereg.dev (dark “Engineering Blueprint”, IBM Plex).
10. **The icon is the letters AA** on the paper color of the owner's posts (`#f2eee3`) in near-black ink (`#17181a`), contrast 15.3:1.

## Facts for the article

| Fact | Value | How to check |
| --- | --- | --- |
| Axe-core version and rules | 4.14.0, 105 rules, 90 on by default | `node -e "const a=require('axe-core');console.log(a.getRules().length)"` |
| Rules with a plain-language entry | 94 (90 by default, `target-size`, and 3 AAA rules) | `tests/dictionary.test.ts` |
| Source | 23 files, about 2,300 lines of TypeScript, TSX and CSS | `git ls-files src` |
| Tests | 131 (about 1,700 lines), 45 more in the website repository | `npm run test` |
| Package size | 272 KB zip, of which the axe-core content script is 653 KB unpacked | `npm run zip` |
| Permissions | `activeTab`, `scripting`, `storage`; no host permissions | `.output/chrome-mv3/manifest.json` |
| Runtime dependencies | axe-core, react, react-dom | `package.json` |
| Stages | 18 task files with acceptance criteria; the later ones end with a results section | `tasks/` |
| Popup states audited with axe in a real browser | 14 (7 states, light and dark), plus 4 for manual review, 4 for the AAA block and 2 for the frame note: 0 violations | scripts outside the repository, see below |
| Website audit | 4 pages, widths 1280 and 320, 16 runs: 0 violations, no horizontal scroll, no policy violations | script outside the repository |
| Network requests of the extension | 0 | `tests/package.test.ts` forbids `fetch`, XHR and friends; a browser run showed no external requests |

The scripts that run the built extension in Chromium were kept outside the repository on purpose; moving them into the repository (Playwright) is in the roadmap.

## What the checks caught

These are the useful stories: each one was found by a check, not by reading the code.

1. **A permission nobody asked for.** The build tool added `host_permissions: <all_urls>` to the manifest, because the content script declared `matches`. Found by reading the built manifest. Fixed, and a test now pins the permission list.
2. **A folder name that broke the build.** The build tool treated `src/dictionary/index.ts` as an extension entry point. Fixed by renaming the file.
3. **A disabled button dropped keyboard focus.** While a check ran, the “Check page” button became `disabled` and focus fell to the page body. Axe did not report it; a keyboard run did. Fixed with `aria-disabled`, and a regression test.
4. **Two hidden network paths.** Axe-core downloads the stylesheets of the page when `preload` is on, and the bundler's module-preload polyfill calls `fetch`. Found by scanning the built package. Both are switched off and a test guards them.
5. **An empty `style=""` left on the page.** After “Show on page” and removing the highlight, Chrome left an empty `style` attribute, so the page was not exactly as before. The unit test with jsdom could not see it, and earlier browser checks hid it because they read the attribute between the steps. Found in a regression run that did not read it. Fixed, with a test that imitates the browser behavior.
6. **A defect that was not real.** The architecture review claimed that an old content script would break after an extension update. An experiment (disable and enable the extension, check again) showed that it works, so no code was changed. The note stays in `tasks/TASK-7.md`.
7. **Documents that were not true any more.** After a feature the privacy policy still said that only one setting is saved; the README still said the dictionary covers 10 rules. Found while writing the next document.
8. **White text on a white button.** On the website the hero button had a white label on a white background. Axe could only say “incomplete”, because of a background gradient; the thumbnail of the page showed it. Fixed, and the gradient was replaced by a flat color so that contrast can be measured.
9. **Colors outside the brand.** The first screenshots and icon used a blue that is not in the owner's palette. Re-made in the palette of bereg.dev and of the posts.

10. **Highlight that points at nothing.** The first manual run showed that “Show on page” did not outline every element. A test page with 12 typical problems, run in Chromium with the built extension, showed why: elements with no visible area (an empty icon link is 0 by 0 px, the elements in the page head are not drawn) get no visible outline. Stage 17 outlines the nearest visible parent, or says that nothing can be outlined. The same run showed a false alarm: a leftover `style=""` that looked like a defect came from the screenshot taken with Playwright during the highlight, not from the extension. Without the screenshot the markup matched.

## About the name

The mark “A11Y” is registered in the US (Reg. 4824150, class 42, owner AudioEye according to TMview, on the Supplemental Register). That register is for descriptive marks, so the protection is weak, but it is not legal advice. “Plain” and “A11y” are both descriptive, so “Plain A11y” will be hard to protect as a mark.

## How the work was organized

- A package of rules for the agent (`SPEC.md`, `AGENTS.md`) and one task file per stage, with a goal, steps, acceptance criteria and a “do not” list. Stages 7 to 16 were planned together with the owner and written the same way.
- One stage per run. At the end of each task file: what was done, what deviated, which roles are uncertain.
- Every claim is checked in a real Chromium with the built extension before it is reported. Unit tests alone were not enough in several of the stories above.
- The owner decides on the visible things: roles of uncertain rules, wording, icon, colors, what goes public.

## How to regenerate things

| What | Command |
| --- | --- |
| Check everything | `npm run typecheck && npm run test && npm run build` |
| Package for the store | `npm run zip` |
| Icons from `scripts/icon.svg` | `npm run icons` |
| Store screenshots (needs Playwright, see the script header) | `node scripts/make-screenshots.cjs` |
| Website images | `npm run site-assets -- <site repository>/public/assets` |
