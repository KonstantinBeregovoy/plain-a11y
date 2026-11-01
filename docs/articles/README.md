# Article series: Plain A11y

A plan and drafts for a series of seven posts about the project: what it is and why it exists, how it is built, and how it was made. The drafts are written for the blog on bereg.dev: the front matter follows `src/content/blog/_template.md` of the portfolio repository, and every draft has `draft: true`.

## The plan

| Part | File | Kind | One sentence | Main source of facts |
| --- | --- | --- | --- | --- |
| 1 | `01-why-plain-a11y.md` | post | Accessibility reports are written for developers; the people who must fix most problems cannot read them. | `README.md`, `SPEC.md`, the screenshots |
| 2 | `02-architecture.md` | article | Popup, service worker and content script, one message at a time; the hard limits that shaped it. | `src/`, `docs/PROJECT_LOG.md` |
| 3 | `03-the-dictionary.md` | article | 94 rules in plain language, a role for each, and the tests that keep the list honest. | `src/dictionary`, `tasks/TASK-10.md` to `TASK-13.md` |
| 4 | `04-what-the-checks-caught.md` | article | Ten problems that tests did not find and a real browser did. | `docs/PROJECT_LOG.md`, `tasks/TASK-7.md`, `TASK-17.md` |
| 5 | `05-how-it-was-made.md` | article | The process: a specification, one task file per stage, acceptance criteria, verification in Chromium, and the mistakes. | `SPEC.md`, `AGENTS.md`, `tasks/`, the pull requests |
| 6 | `06-testing-in-a-real-browser.md` | article | A test setup for an extension, and breaking the tests on purpose to see that they can fail. | `tests/e2e/`, `tasks/TASK-20.md`, `TASK-21.md` |
| 7 | `07-a-site-that-keeps-the-promise.md` | article | The website: a strict policy, honest visit counting, search and assistant files, and two mistakes. | the site repository, `docs/PROJECT_LOG.md` |

Other files: `FACTS.md` (every number the drafts use, with the command that proves it; change it first, then the text) and `../../CHANGELOG.md` (what changed in each version).

Suggested order of publishing: 1, then 4 (the most readable), then 2, 3, 5, 6, 7. Part 1 can stand alone as the LinkedIn post. Parts 2 to 5 are long, so on LinkedIn use a short teaser and a link:

1. “Most accessibility tools tell you that an element fails a rule. A designer or an editor needs to know what is wrong, who it affects and whose job it is to fix it. I built a Chrome extension that does that. It is free and open source.”
2. “Three parts, one message at a time, and a list of things the extension is not allowed to do. How Plain A11y is built.”
3. “94 accessibility rules, each explained in two sentences without jargon, and a test that fails when the list and the engine disagree.”
4. “A disabled button that dropped keyboard focus. A permission nobody asked for. Ten things my tests did not catch.”
5. “One specification, 21 task files, and an agent that has to prove every claim in a real browser. Including the times it was wrong.”
6. “My first run of the new browser tests was 18 green tests in five seconds. So I broke six things on purpose to see if they could fail. Two of the tests could not.”
7. “A site for an extension that promises nothing leaves your browser has to keep that promise. Two mistakes I made doing it, and how I now count visits in the open.”

## Before you publish a part

- Re-check the numbers in `FACTS.md`; every row has the command that proves it. They were true on 1 November 2026: 105 rules in axe-core 4.14.0, 90 on by default, 94 with a plain-language entry, 164 Vitest tests and 33 browser tests, three permissions, 24 task files.
- Add a cover (1200×630) and a `coverAlt` text, set the date, and set `draft: false`. After the post is on LinkedIn, add its address as `linkedin`.
- Parts 2, 5 and 6 mention the toolbar badge, the kept result and the counts, which are in `main` but not yet in the store (version 0.2.0 is not released). Publish them after the release, or say “in the next version”.
- Parts 2 to 5 mention the project in the first person. The agent is called “the agent” and the owner “I”; change this if you want a different voice.
- Part 5 says that the project was built with an AI coding agent. That is a decision about how you present your work; the text is written to be honest about it, not to hide it.

## What the drafts do not claim

No user numbers, no ratings, no “makes sites accessible”. The extension finds only part of the problems, and every part says so.
