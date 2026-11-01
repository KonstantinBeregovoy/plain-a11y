# Article series: Plain A11y

A plan and drafts for a series of five posts about the project: what it is and why it exists, how it is built, and how it was made. The drafts are written for the blog on bereg.dev: the front matter follows `src/content/blog/_template.md` of the portfolio repository, and every draft has `draft: true`.

## The plan

| Part | File | Kind | One sentence | Main source of facts |
| --- | --- | --- | --- | --- |
| 1 | `01-why-plain-a11y.md` | post | Accessibility reports are written for developers; the people who must fix most problems cannot read them. | `README.md`, `SPEC.md`, the screenshots |
| 2 | `02-architecture.md` | article | Popup, service worker and content script, one message at a time; the hard limits that shaped it. | `src/`, `docs/PROJECT_LOG.md` |
| 3 | `03-the-dictionary.md` | article | 94 rules in plain language, a role for each, and the tests that keep the list honest. | `src/dictionary`, `tasks/TASK-10.md` to `TASK-13.md` |
| 4 | `04-what-the-checks-caught.md` | article | Ten problems that tests did not find and a real browser did. | `docs/PROJECT_LOG.md`, `tasks/TASK-7.md`, `TASK-17.md` |
| 5 | `05-how-it-was-made.md` | article | The process: a specification, one task file per stage, acceptance criteria, verification in Chromium, and the mistakes. | `SPEC.md`, `AGENTS.md`, `tasks/`, the pull requests |

Suggested order of publishing: 1, then 4 (the most readable), then 2, 3, 5. Part 1 can stand alone as the LinkedIn post. Parts 2 to 5 are long, so on LinkedIn use a short teaser and a link:

1. “Most accessibility tools tell you that an element fails a rule. A designer or an editor needs to know what is wrong, who it affects and whose job it is to fix it. I built a Chrome extension that does that. It is free and open source.”
2. “Three parts, one message at a time, and a list of things the extension is not allowed to do. How Plain A11y is built.”
3. “94 accessibility rules, each explained in two sentences without jargon, and a test that fails when the list and the engine disagree.”
4. “A disabled button that dropped keyboard focus. A permission nobody asked for. Ten things my tests did not catch.”
5. “One specification, nineteen task files, and an agent that has to prove every claim in a real browser. Including the times it was wrong.”

## Before you publish a part

- Re-check the numbers. They were true on the day of the draft: 105 rules in axe-core 4.14.0, 90 on by default, 94 with a plain-language entry, 140 tests, three permissions, 19 stages. Commands are in `docs/PROJECT_LOG.md`, section “Facts for the article”.
- Add a cover (1200×630) and a `coverAlt` text, set the date, and set `draft: false`. After the post is on LinkedIn, add its address as `linkedin`.
- Part 5 refers to things that were still in review when it was written: the toolbar badge (stage 19, `tasks/TASK-19.md`, the number of task files and of tests), the pull request that fixes the Content Security Policy of the website, and the rule that `main` changes only through a pull request in `AGENTS.md`. Check that all of them are merged, and fix the numbers.
- Parts 2 to 5 mention the project in the first person. The agent is called “the agent” and the owner “I”; change this if you want a different voice.
- Part 5 says that the project was built with an AI coding agent. That is a decision about how you present your work; the text is written to be honest about it, not to hide it.

## What the drafts do not claim

No user numbers, no ratings, no “makes sites accessible”. The extension finds only part of the problems, and every part says so.
