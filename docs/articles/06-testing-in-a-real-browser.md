---
title: 'How I test a Chrome extension in a real browser'
description: 'A temporary manifest copy, a persistent context, a popup page that sends the messages, and tests that I broke on purpose to see if they could fail.'
date: 2026-11-11
kind: article
tags: ['frontend', 'accessibility']
featured: false
draft: true
---

Unit tests with jsdom told me again and again that the code was fine. A real Chromium told me, several times, that the product was not. Part 4 of this series has the stories. This post is about the setup that turned my hand-run checks into tests in the repository: 19 of them, about five seconds in total. And about the part I care about most: how I made sure they can fail.

## The problem with testing an extension

An extension is three programs in three places (see part 2), and the interesting behaviour lives in the messages between them, and in the real browser: the permissions, the injection into a tab, the badge on the icon. jsdom has none of that. So the tests load the built extension into Chromium and use it the way Chrome does.

## The setup

Playwright launches Chromium with the extension loaded from the build folder. Three details matter.

**1. The new headless mode.** Extensions do not work in Playwright's own headless mode. The context is started with `headless: false` and the browser argument `--headless=new`, so there is no window and the extension runs.

**2. A copy of the manifest, not the manifest.** The real extension injects its script after you click the icon, because of the `activeTab` permission. A script cannot click the icon. So the tests load a temporary copy of the build with one extra line, `host_permissions: ["<all_urls>"]`, which lets the service worker inject without the click. The real manifest is never changed, and two tests guard that: one reads the built manifest and expects exactly `activeTab`, `scripting` and `storage`; the other compares the copy with the built manifest and expects the difference to be that one line, and nothing else.

I want to be plain about what this means. The `activeTab` path itself, the real click on the icon in a real profile, is not covered by the tests. It is on the manual checklist of every release.

**3. The popup page as a remote control.** The popup sends a message `run-check` to the service worker, and the service worker checks the tab that is in front. In the tests, the popup is opened as a normal tab (`chrome-extension://<id>/popup.html`), the page under test is brought to the front, and the test sends the same message from the popup page. That is the real path: popup, service worker, content script, axe. No part of it is faked.

The pages under test are small fixtures in the repository, served by a tiny local server on a free port. A test that needs the internet is a test that will fail on a train.

Reading the badge uses the service worker itself: `chrome.action.getBadgeText({ tabId })`, evaluated inside the worker.

## What is tested

- The check finds the five expected rules on a page with deliberate problems, nothing on a clean page, items for manual review where axe cannot decide, and an AAA item apart from the issues.
- “Show on page” outlines every issue, and after it is removed the markup of the page is exactly what it was, also with elements inside nested shadow roots. It outlines the nearest visible parent of an empty link, and removes the outline when the popup closes.
- The badge shows the number of issues of that tab only, is empty for a clean page, and is gone after the tab loads another page.
- During a check, no request leaves the browser except to the local server and the extension itself.
- The popup page has no axe violations in the light and the dark scheme.

One small trap: the markup is read once before and once after, never in between. Chrome leaves an empty `style=""` on an element if the attribute was not read between a change and its removal, and a test that reads in between would hide exactly that defect. I learned that the hard way (part 4, story 5).

## Do the tests fail?

My first run: 18 tests, all green, in five seconds. That is the moment to be suspicious. A test that has never failed has not shown that it can. So I broke the thing each group protects, one at a time, rebuilt, and ran the tests:

| What I broke | What happened |
| --- | --- |
| The highlight was not removed on clear | 3 of 4 highlight tests failed |
| The badge was never set | the badge tests failed (the clean-page one cannot, the badge is empty either way) |
| The content script made a `fetch` to an outside address | the network test failed |
| A fourth permission in the config | the manifest test failed |
| The popup text color too light | the light-scheme axe test failed |
| Every element counted as visible | the “nearest visible parent” test failed |

It also found two weak tests of mine. The test for elements with no visible area passed even when the logic was broken, because it asserted only that something was reported. Now it asserts the exact numbers. And my first attempt to break the popup contrast broke nothing, because the `body` sets its own color, and the test stayed green. That made me add a test that the audit itself can fail: it makes a low-contrast text on purpose and expects axe to report it.

## What the tests found in the code

With the listener that resets the badge on navigation removed on purpose, the badge test still passed. Chrome resets the badge of a tab when the tab loads another page, by itself. The listener from the previous stage was dead weight that woke the service worker on every tab load in the browser. It is removed now, and the test stays, because it checks the behaviour and not the listener.

## What they do not cover

One Chromium version (an older Chrome for Testing, driven by a newer Playwright), no Windows or Linux, no continuous integration, no screen reader. If a future Chrome stops resetting the badge, the test will say so. The tests are a safety net for the things I have been burned by, not a proof that the extension is accessible.

## If you want to copy it

Keep the test setup small and honest: a temporary copy of the build with the least extra permission, a test that fails if the copy differs from the build by anything else, the real message path, local fixtures, and one habit: break it on purpose before you trust it.
