# Contributing

Thank you for looking at Plain A11y. Small, focused changes are the easiest to review.

## Before you start

- For a bug or an idea, open an issue first. For a page where the check or “Show on page” goes wrong, use the issue form: it asks for the page, the problem and what happened.
- Read `AGENTS.md` (the rules for changes) and `SPEC.md` (what the extension is and its hard limits). The limits matter most: only the permissions `activeTab`, `scripting` and `storage`, no network requests, no remotely loaded code, no analytics.
- The language of the interface, the dictionary, the documents and the tests is English.

## Set up and check

You need Node.js and npm (tested on Node.js 22).

```bash
npm install
npm run typecheck && npm run test && npm run build
```

All three must pass. A change that touches the interface must keep it accessible: semantic tags, labels, keyboard control, visible focus, contrast of at least 4.5:1, click targets of at least 24×24 px. The test suite runs axe on every state of the popup.

## Pull requests

1. Fork the repository and work on a branch. `main` is protected: changes reach it only through a pull request that the maintainer merges.
2. Write tests together with the code. TypeScript is strict: no `any`, no `@ts-ignore`.
3. Keep one change per pull request, with a clear message.
4. Do not change the stack, the folder structure or the pinned versions (for example `axe-core`) in an unrelated pull request.

## Plain-language texts

Every rule in `src/dictionary` has a title, who is affected, how to fix it and a role (design, content or code). Write them in simple words, without WCAG and ARIA terms, no longer than two sentences per field. The tests check this.
