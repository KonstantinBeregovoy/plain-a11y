---
title: 'Accessibility reports are written for developers'
description: 'I built a free Chrome extension that tells designers, editors and PMs what is wrong on a page, who it affects, how to fix it and whose job it is.'
date: 2026-11-03
kind: post
tags: ['accessibility']
featured: false
draft: true
---

Open an accessibility report for a page and you will usually see something like this: `color-contrast`, 14 nodes, a CSS selector, a link to a rule page.

If you are a developer, that is a starting point. If you are a designer, an editor or a product manager, it is a wall. What does it mean? Who is hurt by it? And, the question that decides whether anything gets fixed: is this my task, or someone else's?

Those people fix most accessibility problems. Contrast is a design decision. Missing image descriptions are a content decision. Broken form labels are code. The report does not say which is which.

## What I built

Plain A11y is a Chrome extension. You open a page, press “Check page”, and for every problem it tells you:

- what is wrong, in plain words;
- who it affects;
- how to fix it;
- which role should take the task: Design, Content or Code;
- how serious it is: Critical, Serious or Minor.

Here is one real entry. The rule is `image-alt`:

> **Image has no text description.** Who is affected: blind people. A screen reader cannot tell them what the image shows. How to fix: add a short description that conveys what the image means. If the image is purely decorative, mark it as decorative.

You can outline the problem element on the page, filter the list by role, and copy the whole report as a Markdown checklist that pastes straight into a ticket.

## What I did not build

I did not write my own accessibility rules. That is expensive and easy to get wrong. The checking is done by [axe-core](https://github.com/dequelabs/axe-core), the open-source engine behind many accessibility tools. The extension only changes what the result looks like: 94 rules, each with a title, who is affected, how to fix it and a role.

## Three promises

**It stays on your machine.** The extension asks for three permissions only: `activeTab`, `scripting` and `storage`. It has no access to all sites, no server, no accounts, no analytics and makes no network requests. A test fails if that changes.

**It is honest about its limits.** Automated checking finds only part of the accessibility problems. It cannot judge whether an image description makes sense, whether a form is understandable, or how the keyboard flow feels. So an empty result does not say “this page is accessible”. It says that nothing was found, and reminds you of what a tool cannot see. Cases that the engine could not decide go to a separate “Needs manual review” list instead of being counted as problems. The icon deliberately has no check mark.

**It is accessible itself.** An accessibility tool that fails its own check is not worth much. The popup is checked with axe in every state, in light and dark mode, in a real browser.

## Try it, read it

It is free and open source (MIT). The [Chrome Web Store page](https://chromewebstore.google.com/detail/plain-a11y/cnldihaficjignkhpgodanceilllbjfb), the [website](https://a11y-ext.bereg.dev) and the [source code](https://github.com/KonstantinBeregovoy/plain-a11y) are all public.

This is the first of a few posts. The next ones are about how it is built, how the plain-language dictionary works, what my tests missed and a real browser found, and how the whole thing was made with an AI coding agent, including the times the agent was wrong.
