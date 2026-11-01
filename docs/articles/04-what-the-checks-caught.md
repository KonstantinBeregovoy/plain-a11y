---
title: 'Ten things my tests missed and a real browser found'
description: 'A permission nobody asked for, a button that dropped keyboard focus, a highlight that pointed at nothing. Stories from building an accessibility checker.'
date: 2026-11-04
kind: article
tags: ['accessibility', 'frontend']
featured: false
draft: true
---

Plain A11y has more than a hundred tests. Most of the useful discoveries in this project did not come from them. They came from loading the built extension into a real Chromium and looking at what happened. Here are ten, in the order they happened. Each one was found by a check, not by reading the code.

## 1. A permission nobody asked for

The manifest of the built extension contained `host_permissions: <all_urls>`. I had asked for three permissions and written none of that. The build tool adds it when a content script declares `matches`. I found it by reading the built `manifest.json`. The fix is a runtime-registered script, and a test now pins the permission list. For a tool that promises to touch only the tab you click, “read all your data on all sites” would have been the first thing a reviewer noticed.

## 2. A folder name that broke the build

The build tool treated `src/dictionary/index.ts` as an entry point of the extension and tried to build it as one. The fix was to rename the file. No test could have seen it: the code was fine, and the tool was reading a naming convention.

## 3. A disabled button that dropped keyboard focus

While a check runs, the “Check page” button used to become `disabled`. For a person using the keyboard, the focus fell to the page body, so after pressing the button they were somewhere else on the page. axe did not report it. A run with the keyboard did. The fix is `aria-disabled` plus an ignore in the handler, so the button keeps focus, and a regression test.

I like this one most, because it is a bug in an accessibility tool that a scan for accessibility bugs cannot find.

## 4. Two hidden network paths

The promise is “no network requests”. I scanned the built package and found two. axe-core downloads the stylesheets and media of the page when its `preload` option is on. And the bundler's module-preload polyfill calls `fetch`. Both are switched off now, and a test forbids `fetch` and `XMLHttpRequest` in the source. The price: on pages with cross-origin stylesheets a few rules that need those styles may work less fully. That is written down in the task file instead of hidden.

## 5. An empty `style=""` left on the page

“Show on page” outlines an element and removes the outline afterwards. The page must be exactly as before. In the browser, elements without a `style` attribute were left with an empty `style=""`. Chrome does that if the attribute was not read between a change through the CSS object model and the removal. My unit test with jsdom could not see it, because jsdom behaves differently. My first browser checks missed it too, because they read the attribute between the steps, and reading it hides the problem. A regression run that did not read it found it. The test now imitates the Chrome behaviour and fails without the fix.

## 6. A defect that was not real

An architecture review said that after an extension update, the old content script would break the check on tabs that were already open. It sounded right. I ran the experiment: check, switch the extension off and on, check again on the same tab. It worked, because the page gets a fresh isolated world and the guard flag does not survive. No code was changed, and the note stays in the task file. A review finding is a guess until somebody runs it, including when the review is mine.

## 7. Documents that were not true any more

After a feature, the privacy policy still said that only one setting is saved. The README still said that the dictionary covers 10 rules. I noticed while writing the next document. Now every stage that adds a feature or a setting has the documents in its list of things to check.

## 8. White text on a white button

On the website, the main button had a white label on a white background. axe could only say “incomplete”, because the button had a background gradient. The thumbnail of the page showed the problem in one second. The fix: a flat color, so contrast can be measured. An accessibility check that says “I cannot tell” is information, and a person has to look.

## 9. Colors that were not mine

The first screenshots and the icon used a blue that is not in my palette. Nothing was wrong with them technically. They were re-made in the colors of my site. Not every check can be automated.

## 10. A highlight that pointed at nothing

My first manual run showed that “Show on page” did not outline every element. I built a test page with twelve typical problems and ran it in Chromium. The reason: elements with no visible area get no visible outline. An empty icon link is 0 by 0 pixels, and elements in the page head are not drawn at all. The fix is to outline the nearest visible parent, or to say plainly “Cannot be outlined: the element has no visible area on the page”. The same run showed a false alarm: a leftover `style=""` that looked like a defect came from the screenshot taken during the highlight, not from the extension.

## What I take from it

Unit tests answer “does the code do what I wrote?”. A real browser answers “does the product do what I promised?”. They are different questions, and the second one is the one users ask.

Two rules came out of this work. Do not say that something is checked unless you ran it. And when a check disagrees with a test, believe the browser first and then find out why the test was blind.
