---
title: 'How I built an extension with an AI agent, mistakes included'
description: 'One specification, nineteen task files, acceptance criteria and a real browser. How Plain A11y was made, and the times the agent was wrong.'
date: 2026-11-09
kind: article
tags: ['ai-tooling', 'accessibility']
featured: false
draft: true
---

Plain A11y was built with an AI coding agent. This post is about how the work was organized, because the way I worked mattered more than the tool, and about the mistakes, because those show whether the way works.

## A package of rules, not a prompt

I did not describe the product in one long prompt. I wrote a small set of files in the repository:

- **`SPEC.md`**: what we build, the stack (not to change without a request), the hard limits (three permissions, no network, no backend), the folder structure, what is out of scope.
- **`AGENTS.md`**: a short list of rules for the agent. Read the spec and the task before you start. Do only that stage. Do not add features, dependencies or files beyond the task. Do not invent APIs: look in the documentation or in `node_modules`. Write tests together with the code. Strict TypeScript. Small commits. Report what was done, which commands ran, and what is unresolved.
- **A task file per stage** in `tasks/`: a goal, steps, acceptance criteria, a “do not” list, and at the end a results section where the agent writes what it did, where it deviated and what it is unsure about.

There are nineteen task files now. They run from the base (a popup that runs axe) through the dictionary (four parts), the “Needs manual review” section, the AAA block, shadow DOM, the nearest-visible-parent highlight, the English translation of the process files, and the toolbar badge.

## One stage at a time

A stage is finished when its acceptance criteria are met and `typecheck`, `test` and `build` pass (and `zip`, for the store). Not when the code looks right. The “do not” list matters as much as the steps: it is where I stop the agent from adding a settings page when I asked for a filter.

When something is missing, the agent writes the question at the end of the task file and picks the simplest reasonable option. I read those questions and decide. For example, whether the roles of 24 aria rules should be Code or Content (they are Code, with the doubtful ones listed for me).

## Every claim is checked in a real browser

This is the rule that changed the project most. A claim is something like “the highlight is removed and the page is unchanged” or “the extension makes no network requests”. The agent may not report it as true until it has loaded the built extension into Chromium and observed it. For that it uses a temporary copy of the build with an extra host permission, so the real manifest is never changed, and drives it with Playwright.

Part 4 of this series has ten stories where this paid for itself. The short version: unit tests were right about the code and wrong about the product several times.

## The owner decides the visible things

The agent proposes and the owner decides: the roles of uncertain rules, the wording, the icon and the colors, what goes public, whether visits to the website are counted. The agent can check contrast and measure it; it cannot decide that a blue is not my blue.

## The mistakes

The agent made mistakes, and the process is designed to find them. Four that I kept in the record:

- **A defect called without checking.** In stage 7 an architecture review claimed that an old content script would break after an extension update. The agent had not run it. When it did, the claim was false, and the task file says so in the first person: “I called it a defect without checking.” No code changed.
- **A check that tested itself.** When the process files were translated into English, the check “no Cyrillic letters in the repository” was written with Cyrillic letters, so it matched its own task file. The agent found it when it ran the check against its own change, and the pattern now uses escapes.
- **A page that scrolled sideways.** After the site went live, a new link to the repository made the home page 329 pixels wide on a 320-pixel screen. The next audit, 16 runs in a real browser, found it. The unit tests could not, because jsdom has no layout.
- **A wrong guess about a security header.** When I decided to count visits on the website, the agent allowed the analytics script in the Content Security Policy and guessed where it reports to. A look at the live site in Chromium showed the report goes to the site's own address, so the first policy blocked it. A second pull request fixed it. The agent had said that this address came from general knowledge, not from documentation. It was wrong, and the check said so.

None of these reached users for long. All of them were found by a check, not by trust. That is the part of the process I would copy first.

## What the process cannot do

It cannot replace a person with a screen reader. The agent can run axe, measure contrast and drive the keyboard in a scripted way, but it cannot tell me whether a screen reader user understands the popup. That check is a list in `docs/a11y-checklist.md`, and it is mine to run.

It also cannot tell me what to build. The idea (accessibility reports in plain language, by role) and the limits (nothing leaves the browser) came before the first task file.

## A few rules of thumb

- Put the limits in a file and in a test. “No network requests” as an intention is weak; as a failing test it is a fact.
- Make the agent write what it did not check. A results section with “not checked” in it is worth more than one without.
- Keep `main` behind a pull request, even if you are the only maintainer. For the website, a merge is a deploy, and reading a diff first costs one minute.
- Read the built output, not only the source.

The project is free and open source: [the extension](https://github.com/KonstantinBeregovoy/plain-a11y), [the website](https://a11y-ext.bereg.dev) and [the Chrome Web Store page](https://chromewebstore.google.com/detail/plain-a11y/cnldihaficjignkhpgodanceilllbjfb). The task files are in the repository, so you can read the process itself.
