# Project log

State of the project on 28 October 2026, the decisions behind it, and verifiable facts for writing about it. Facts come from the repository and from checks that can be run again; where a number was measured by a script outside the repository, the script is named.

## Where things stand

| Part | State |
| --- | --- |
| Extension (this repository) | Stages 1 to 16 are done. All commits are authored by the owner. |
| Website (`plain-a11y-site` repository) | Built in the style of bereg.dev, tested, not deployed yet. |
| GitHub | Both repositories exist and are private. |
| Chrome Web Store | Not registered yet. The package (`npm run zip`), the listing text and 8 screenshots are ready. |
| Firefox | Not started. It is in the roadmap. |
| Testing by a person with a screen reader and a keyboard | Not done. The checklist is `docs/a11y-checklist.md`. |

### What only the owner can do

1. Check the built extension by hand: keyboard, NVDA, VoiceOver, 5 to 10 real sites (`docs/a11y-checklist.md`).
2. Deploy the website to Cloudflare (the steps are in the README of the website repository).
3. Check that the name is free: search the Chrome Web Store, Firefox Add-ons, Google, GitHub and the trademark databases (WIPO Global Brand Database, USPTO, EUIPO). Two similar products were found and are worth a look: A11Y Audit and A11yTrail.
4. Register in the Chrome Web Store ($5 once, trader or non-trader declaration) and submit the package.
5. Before making the repositories public: replace the commit email with the GitHub noreply address (history rewrite), decide what to do with `SPEC.md`, `AGENTS.md`, `CLAUDE.md` and `tasks/`, and replace the two placeholders on the website (store link, GitHub link).

## Decisions and why

1. **axe-core, not own rules.** Writing and keeping accessibility rules is expensive and error-prone. The extension only changes what the result looks like. The version is pinned to an exact number, because rules change between versions.
2. **Three permissions only** (`activeTab`, `scripting`, `storage`), no access to all sites, no network requests, no remote code. A test fails if this changes.
3. **No backend, accounts or analytics.** The product promise and the privacy policy are one sentence long because of it.
4. **Plain language for every rule.** All 94 rules the extension runs have a title, who is affected and how to fix it, and a role (Design, Content or Code). A test compares the dictionary with the rules of the installed axe-core, so a missing or extra entry fails.
5. **Honest limits.** An empty result says that automation covers only part of the requirements. Unclear cases go to “Needs manual review” and are not counted as issues. The icon has no check mark, because a check mark means “passed”.
6. **No automatic “accessible or not” badge.** Checking every page needs access to all sites, costs CPU, and a green badge would claim more than automation can. A badge with an issue count after a check, and an opt-in per-site auto check, are in the roadmap.
7. **English only.** The interface, the dictionary, the report and the documents. The task files of the original package stay in Russian.
8. **MIT license.** Axe-core is MPL-2.0 and stays unchanged; its license and source link ship inside the package.
9. **The website is a separate static repository.** Plain HTML and CSS, no scripts, a strict Content Security Policy, meant to be deployed as Cloudflare Workers static assets like bereg.dev. Its design follows bereg.dev (dark “Engineering Blueprint”, IBM Plex).
10. **The icon is the letters AA** on the paper color of the owner's posts (`#f2eee3`) in near-black ink (`#17181a`), contrast 15.3:1.

## Facts for the article

| Fact | Value | How to check |
| --- | --- | --- |
| Axe-core version and rules | 4.14.0, 105 rules, 90 on by default | `node -e "const a=require('axe-core');console.log(a.getRules().length)"` |
| Rules with a plain-language entry | 94 (90 by default, `target-size`, and 3 AAA rules) | `tests/dictionary.test.ts` |
| Source | 23 files, about 2,300 lines of TypeScript, TSX and CSS | `git ls-files src` |
| Tests | 121 in 13 files (about 1,600 lines), 44 more in the website repository | `npm run test` |
| Package size | 272 KB zip, of which the axe-core content script is 653 KB unpacked | `npm run zip` |
| Permissions | `activeTab`, `scripting`, `storage`; no host permissions | `.output/chrome-mv3/manifest.json` |
| Runtime dependencies | axe-core, react, react-dom | `package.json` |
| Stages | 16 task files with acceptance criteria; the later ones end with a results section | `tasks/` |
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
