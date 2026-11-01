# Facts for the articles

One page with the numbers and claims that the drafts use, and the command that proves each. They were checked on 1 November 2026, on `main` of both repositories. Check them again before you publish a part, and change this file first, then the text.

## The product

| Fact | Value | How to check |
| --- | --- | --- |
| First commit of the extension | 27 October 2026 | `git log --reverse --format=%ad --date=short \| head -1` |
| In the Chrome Web Store | 30 October 2026, version 0.1.0 | the store page, see the log |
| axe-core | 4.14.0, pinned; 105 rules, 90 on by default | `node -e "const a=require('axe-core');console.log(a.version,a.getRules().length)"` |
| Rules with a plain-language entry | 94 (90 default, `target-size`, 3 AAA) | `tests/dictionary.test.ts` |
| Permissions | `activeTab`, `scripting`, `storage`; no host permissions | `.output/chrome-mv3/manifest.json` |
| Runtime dependencies | `axe-core`, `react`, `react-dom` | `package.json` |
| Package size | about 280 KB zip (axe-core is most of it) | `npm run zip` |
| Source | 24 files, about 2,400 lines of TypeScript, TSX and CSS | `git ls-files src` |
| The content script | about 250 lines in 3 files (`src/content`) | `wc -l src/content/*.ts` |
| Not checked by the engine | the content of iframes, closed shadow roots, `chrome://` pages | `README.md` |

## The tests

| Fact | Value | How to check |
| --- | --- | --- |
| Unit and component tests (Vitest) | 139, about 1,800 lines | `npm run test` |
| Browser tests (Playwright) | 19, about 440 lines, 5 s of test time | `npm run test:e2e` |
| Website tests | 71 | `npm test` in the site repository |
| Popup states audited with axe in a real browser | 14 (7 states, light and dark), plus others for review and AAA: 0 violations | `docs/PROJECT_LOG.md` |
| Website audit | 4 pages, widths 1280 and 320, light and dark: 16 runs, 0 violations, no sideways scroll | a script outside the repository, see part 7 |
| Mutation checks of the e2e tests | 6 things broken on purpose; each time the right test failed; 2 weak tests found and fixed | `tasks/TASK-20.md`, result 4 and 5 |

## The work

| Fact | Value | How to check |
| --- | --- | --- |
| Task files | 21 (`tasks/TASK-1.md` to `TASK-21.md`) | `ls tasks` |
| Commits in the extension repository | 48 | `git rev-list --count HEAD` |
| Pull requests | 5 in the extension, 2 in the website repository | `gh pr list --state all` |
| `main` protection | changes only through a pull request, no force push, no deletion | repository settings, Rules |

## The website

| Fact | Value | How to check |
| --- | --- | --- |
| Where | Cloudflare Workers static assets, `a11y-ext.bereg.dev`, deploys on every merge to `main` | `wrangler.jsonc` |
| Scripts of its own | none; one JSON-LD data block that the browser does not run | `tests/site.test.js` |
| Security headers | Strict-Transport-Security, Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy | `curl -sI https://a11y-ext.bereg.dev/` |
| Visit counting | Cloudflare Web Analytics, automatic setup for the whole `bereg.dev` domain, visits from the EU excluded; disclosed on every page and in the privacy policy | Cloudflare dashboard, the privacy page |
| For search and assistants | canonical, Open Graph, JSON-LD (`SoftwareApplication`, `Person`, `FAQPage`), `sitemap.xml`, `llms.txt`, `security.txt` | `curl` each address |

## Things that are not facts yet

- Number of installs, ratings and reviews: none are claimed. Add real numbers from the store console later, with the date.
- Whether `llms.txt` changes what AI assistants say about the project: not known. Part 7 says so.
- Whether Chrome versions other than the one used for the e2e tests reset the badge on navigation: not checked.
- How a screen reader user finds the popup: the manual checklist in `docs/a11y-checklist.md` is not done.
