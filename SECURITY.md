# Security policy

## Reporting a problem

If you find a security problem in Plain A11y, write to **contact@bereg.dev**. Please do not open a public issue for it. Say what you found, how to reproduce it and which version you used (the version is on the extension card in `chrome://extensions`). You will get an answer by email.

The same address is published on the website in [`/.well-known/security.txt`](https://a11y-ext.bereg.dev/.well-known/security.txt).

## What is in scope

- The extension in this repository, as published in the [Chrome Web Store](https://chromewebstore.google.com/detail/plain-a11y/cnldihaficjignkhpgodanceilllbjfb).
- The website at https://a11y-ext.bereg.dev (its source is in the [plain-a11y-site](https://github.com/KonstantinBeregovoy/plain-a11y-site) repository).

## Why the attack surface is small

The extension asks only for `activeTab`, `scripting` and `storage`, has no host permissions, makes no network requests and loads no remote code. A test in `tests/package.test.ts` fails if the permissions change or if the package contains a network call. Dependencies are `axe-core` (pinned to an exact version), `react` and `react-dom`.

## Supported versions

Only the latest version in the Chrome Web Store.
