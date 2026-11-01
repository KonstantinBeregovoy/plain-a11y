---
title: 'A website that keeps the same promise as the extension'
description: 'No scripts of its own, a strict Content Security Policy, honest visit counting, and what I got wrong: a page that scrolled sideways and a guessed address.'
date: 2026-11-13
kind: article
tags: ['frontend', 'accessibility']
featured: false
draft: true
---

The extension promises that nothing leaves your browser. A website for it that loads a pile of third-party scripts would break that promise on the first page view. So the site had to be as strict as the extension, and part of the work was admitting where it is not.

## What it is

Plain HTML and CSS, no framework, no build step. The folder `public/` is deployed as Cloudflare Workers static assets to `a11y-ext.bereg.dev`, and every merge to `main` deploys. It has four pages: the home page, the privacy policy, the license and a 404 page. The design follows my own site (dark “Engineering Blueprint”, IBM Plex), with the fonts served from the site itself.

## A policy that allows almost nothing

The headers are set in one file, `_headers`:

- `Content-Security-Policy: default-src 'none'` with only what is needed added: styles, images and fonts from the site itself, nothing else. No inline styles and no inline scripts, and tests fail if one appears.
- `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, a restrictive `Referrer-Policy` and `Permissions-Policy`, and the two cross-origin policies, `Cross-Origin-Opener-Policy` and `Cross-Origin-Resource-Policy`.

A test checks the policy: strict default, no `unsafe-inline`, no `unsafe-eval`.

## Making it findable, honestly

For search engines and for assistants that answer questions, the site has:

- a canonical address on every page, and Open Graph and Twitter card data with a real 1200×630 image;
- structured data in JSON-LD: the app as `SoftwareApplication` (free, with its author) and a `FAQPage`. A test compares the questions and answers in the JSON-LD with the visible text of the page, word for word, because markup that says something the page does not say is worse than none. There is no rating and no review in it, because there are none;
- `sitemap.xml`, `robots.txt`, `security.txt` and a short `llms.txt` with a summary and links.

I do not know whether `llms.txt` changes what assistants say about the project. It costs little and it is true, so it is there. I would not tell you that it works.

A JSON-LD block is a `<script>` tag, and my test for “no scripts” had to learn the difference: a data block with type `application/ld+json` is not run by the browser, so the test allows exactly that and nothing else.

## The audit, and what it cannot say

I ran axe on the live pages in a real Chromium: four pages, widths 1280 and 320, light and dark scheme, 16 runs. Zero violations. But axe also said “incomplete” for 143 elements of the home page: a faint drawing grid in the background made it unable to decide the contrast. Instead of ignoring that, I switched the grid off in the test and measured the 44 remaining cases by hand: the lowest ratio was 6.9 to 1, and 4.5 is the requirement. An empty “incomplete” list is the goal, but an “incomplete” list you have looked at is acceptable.

## Two mistakes

**A page that scrolled sideways.** After the site was live, I added a link with the full address of the repository as its text. At a width of 320 pixels it made the page 329 pixels wide. The unit tests could not see it, jsdom has no layout. The next audit in a real browser did. The fix was to shorten the link text. My audit script reports the sideways scroll at 320 pixels on every page; it lives outside the repository for now, and moving it in is on my list.

**A guessed address in a security header.** I decided to count visits (see below) and allowed the Cloudflare script in the policy. I guessed that the script reports to `cloudflareinsights.com`. I had said that this came from general knowledge and not from documentation, and it was wrong: the script posts to the site's own `/cdn-cgi/rum`. The browser console showed the blocked connection on the live site. The fix was one word, `connect-src 'self'`, in a second pull request. If your policy is strict, test it in a browser after every change to it.

## Counting visits, in the open

Cloudflare Web Analytics was switched on for my whole domain with automatic setup, so its script was added to the pages of this site too, and my own policy blocked it and logged an error on every visit. That showed me a contradiction: the site said “no analytics” and a script was on the way in.

I decided to count visits. For a project that has just been published, knowing that people come is worth more than a clean claim. The extension still collects nothing. So the privacy policy and the footer of every page now say it in plain words: this website counts visits with Cloudflare Web Analytics, which according to Cloudflare uses no cookies and does not track visitors across sites, and visits from the EU are not measured. The extension itself collects nothing and sends nothing.

The honest version of a promise is a smaller promise, said exactly.

## A merge is a deploy

The website deploys on every merge to `main`, so `main` accepts changes only through a pull request, in both repositories, with no force push. I merge each one myself after reading it. It costs a minute per change, and I would rather pay it than find out from a visitor.
