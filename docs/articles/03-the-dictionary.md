---
title: '94 accessibility rules in plain language, and the tests behind them'
description: 'How the plain-language dictionary of Plain A11y is written: who is affected, how to fix it, which role, and the tests that fail when it falls behind axe-core.'
date: 2026-11-07
kind: article
tags: ['accessibility']
featured: false
draft: true
---

The dictionary is the part of Plain A11y that people actually read. The engine finds the problem. The dictionary says what it means. It has 94 entries today, and this is how they are written and kept honest.

## One entry

Every entry has the same fields: the axe rule id, a title, who is affected, how to fix it, and a role (design, content or code). The texts follow three rules:

- Simple words. No WCAG terms and no ARIA terms.
- No longer than two sentences in each field.
- Concrete: what a person with a screen reader, a keyboard or low vision would run into.

Technical words are replaced by plain ones: “vector graphic” instead of SVG, “clickable picture” instead of image map, “page area” instead of landmark. The tests check the texts for the forbidden words and for the length.

## Where the list of rules comes from

I did not write the list from memory. axe-core can tell you its rules (`axe.getRules()`), and each rule carries tags, including a category such as `cat.aria` or `cat.forms`. The dictionary was written category by category, in four parts: aria (24 rules), then semantics, keyboard and structure (23), then text alternatives, name-role-value and forms (18), then the rest (15). Each part came with a test that every rule of the category has an entry.

The last part came with a test that matters more than the others: **the set of ids in the dictionary must equal the set of rules axe runs by default, plus the few we turn on ourselves** (`target-size` and three AAA rules). The test fails on a missing rule and on an extra one.

The numbers today: axe-core 4.14.0 has 105 rules, 90 of them on by default. Five are deprecated and off. Six experimental rules are off and written down in the roadmap to be re-checked at the next update. So the dictionary has 90 + 1 + 3 = 94 entries.

## The version is pinned, and why

That test is the reason the axe version is pinned to an exact number. If a new axe adds a rule, an unpinned dependency would turn the test red on a day nobody planned for. With the pin, updating axe is a decision: bump the version, see which rules appeared, write their entries, then merge.

## Who should fix it

The role is the part I like most and trust least. The idea is simple: a report that says “Design”, “Content” or “Code” lets a product manager route a task without learning what a landmark is. The rule I used is “who usually fixes this”:

- **Design**: contrast, size of click targets, whether a label is visible.
- **Content**: text alternatives for images, headings, link text, the title of the page, subtitles.
- **Code**: everything purely technical, most of the ARIA rules, the language attribute, duplicate ids.

Many rules are not that clean. A button's name is thought up by content but written into the markup by a developer. A broken list or table is often made by a content manager in a visual editor of a CMS. A skip link is sometimes ordered by design. For each part I wrote the disputed ones at the end of the task file under “Roles to review”, with the reason. So the owner can overrule me with one line, and a role in the report is a best guess, not a fact.

## When the engine cannot decide

Some rules cannot be settled by software. A video “may” have captions; axe cannot know if they are right. Text over a picture “may” have enough contrast. Those results come back as “incomplete”, and they go into the section “Needs manual review” with the same plain-language text. In the Markdown report their line reads “If confirmed, how to fix”. They never become problems in the count, so the number of issues includes only what the engine is sure about. I think this is the most honest line in the product.

## What I could not test in a browser

I checked each part in Chromium on pages with real violations. Most rules fired and showed our text. Some did not: they need special markup, a sound longer than three seconds, a video with certain captions, or an iframe. For those, only the dictionary tests ran, and the task files say so rather than hiding it. A test that passes is not the same as a rule that was seen working, and I think a changelog should say which is which.

## The result

A person who has never read WCAG can open a report and know what is wrong, who is hurt and whose job it is. That sentence is the whole product. The dictionary is how it gets there.
