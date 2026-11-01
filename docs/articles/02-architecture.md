---
title: 'How Plain A11y is built: three parts and a list of no'
description: 'A Chrome extension with a popup, a service worker and a content script, and the hard limits that decided its shape: three permissions, no network.'
date: 2026-11-05
kind: article
tags: ['frontend', 'accessibility']
featured: false
draft: true
---

Plain A11y checks the open page for accessibility problems and explains them in plain language. This post is about how it is put together. I will start with what it is not allowed to do, because those limits decided most of the design.

## The limits come first

The project has a specification, and the specification has a short list of hard limits:

- No backend, no accounts, no analytics, no network requests.
- Permissions only `activeTab`, `scripting` and `storage`.
- All code inside the package, nothing loaded from a server.
- The `axe-core` version pinned to an exact number.
- The extension's own interface meets WCAG 2.2 AA.

Every one of these is also tested, so they cannot drift quietly. One test reads the manifest and fails if the permission list is different or if a host permission appears. Another scans the source for `fetch`, `XMLHttpRequest` and friends.

## Three parts

A Manifest V3 extension is not one program. It is three, in different places, and they can only talk by messages.

```
 popup (React)  ──run-check──▶  service worker  ──run-axe──▶  content script
   │  groups, filters,            finds the tab,                 runs axe-core
   │  looks up the dictionary,    injects the script,            in the page,
   │  builds the report           relays messages                outlines elements
   ◀──────────── CheckResponse { items, review, aaa } ──────────────┘
```

**The popup** is a React interface. It shows the result, groups it by severity and by role, looks up the plain-language text for each rule, and builds the Markdown report. It holds the settings (the role filter and whether the AAA block is shown) in `storage.local`.

**The service worker** is the go-between. It finds the active tab, makes sure the content script is there, forwards the request and returns the answer. It also holds a small piece of state: which tab currently has a highlight, so it can remove it when the popup closes.

**The content script** runs inside the page. It is the only part that touches the page's DOM: it runs axe-core and draws the highlight.

## Why the content script is injected on demand

A content script can be declared in the manifest with a list of sites. That is the easy way, and it quietly adds host permissions, which means “read and change your data on all websites”. For a tool that promises to touch only the tab you clicked, that is the wrong promise.

So the content script is registered at runtime and has no `matches`. When you press “Check page”, the service worker injects it into the active tab with `scripting.executeScript`. The `activeTab` permission is what allows that, and only after you click the icon.

I did not get this right on the first build. The build tool added `host_permissions: <all_urls>` on its own, because the script had declared `matches`. I found it by reading the built manifest, not the source. The fix is in the config, and a test now pins the permission list.

Before injecting, the service worker sends a short `ping`. If a script already answers, it is not injected again, and a flag on `window` makes a second copy do nothing. One listener per tab, always.

## The shape of a result

The content script runs axe with a small set of options:

- `preload: false`, so axe does not download the page's stylesheets and media. This was another hidden network path.
- `target-size` turned on. It is the WCAG 2.2 AA rule about the size of click targets, off by default in axe.
- Three AAA rules turned on, for a separate, optional block.

Then one function turns the raw axe result into three lists:

- **items**: the problems. These are the “Issues found”.
- **review**: results axe calls “incomplete”, cases it could not decide on its own, for example text over a background picture. These are shown in their own section and never counted as problems. An empty result must not sound more certain than it is.
- **aaa**: optional recommendations beyond the AA level, shown at the bottom and also not counted.

That `CheckResponse` is the whole contract between the page and the popup. Everything else is presentation.

## Plain language is a join

axe-core knows a rule by its id and gives a technical description. The popup does a lookup: id in, plain-language entry out (title, who is affected, how to fix it, role). If the rule is not in the dictionary, it shows the axe text and the role Code, so a new rule in a future axe version never breaks the screen. The next post is about the dictionary itself.

## The number on the icon

After a check, the service worker also puts the number of issues on the icon of that tab, with the same number as “Issues found” in the popup. For zero issues the icon stays empty on purpose: a “0” or a mark could be read as “passed”, and the extension must never say that. It is one call to the browser (`action.setBadgeText`) and needs no new permission. Chrome removes it again when the tab loads another page, which I first coded by hand and then removed when a test showed it was not needed (part 6).

## Highlighting without leaving a trace

“Show on page” outlines the problem element and scrolls to it. It looks simple and it was the source of most of my bugs. The selectors come from axe, and for elements inside shadow DOM they are chains, not strings. Elements with no visible area (an empty icon link is 0 by 0 pixels) get no visible outline, so the highlight outlines the nearest visible parent, or says plainly that nothing can be outlined. The content of iframes is not checked at all; the README and the website say so.

The rule is that after the highlight is removed, the page markup must be exactly what it was. There is a test for that, and the real browser caught a case the test could not (see part 4).

When the popup closes, Chrome drops a port that the popup keeps open, and the service worker clears the highlight. The page is left as it was found.

## The toolchain

[WXT](https://wxt.dev) builds the extension, React 19 renders the popup, TypeScript is strict (no `any`, no `@ts-ignore`), Vitest runs the tests. The zip for the store is about 280 KB, and most of it is axe-core. The runtime dependencies are `axe-core`, `react` and `react-dom`. That is all.

## What I would tell someone starting the same thing

Write the “no” list before the first line of code, and make each item a test. Read the built output, not only the source. And keep the part that touches the page as small as possible: here it is about 250 lines in three files (the run options, the message handler and the highlighter), and the rest of the product lives in the popup, where it is easy to test.
