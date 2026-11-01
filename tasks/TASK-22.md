# TASK-22: Release 0.2.0

Goal: version 0.2.0 (the toolbar badge, stage 19) is ready to be uploaded to the Chrome Web Store, and everything a person reads about it is true on the day it goes out. This stage prepares the files and the package. It does not publish anything: the owner merges, uploads and submits.

## Steps
1. Version `0.2.0` in `package.json` and `package-lock.json`.
2. The `description` in the manifest (`wxt.config.ts`) equals the short description in `store/listing.md`, because the store shows the manifest text. A test keeps them equal and within 132 characters.
3. The full description in `store/listing.md` gets a line about the number on the icon.
4. The privacy policy (`PRIVACY.md`, and the same text on the website, in its own pull request) says what happens to the number on the icon and has a new date.
5. `CHANGELOG.md` and `docs/PROJECT_LOG.md` are brought up to date.
6. Build, test and package from a clean state, and check the package.

## Acceptance criteria
- `npm run typecheck`, `npm run test`, `npm run build`, `npm run zip` and `npm run test:e2e` pass.
- The zip is `plain-a11y-0.2.0-chrome.zip`, its manifest has `version` 0.2.0, the three permissions and no host permissions, and its content is identical to the build that the browser tests ran.
- The test of the description fails when the manifest text is changed (checked by changing it).
- The website pull request has the same privacy sentence and the same date.

## Do not
Publish, tag or upload anything. Add features. Change the permissions. Change the website in the same pull request as the extension.

## Owner's steps, in this order
1. Merge the website pull request (the policy goes live at once).
2. Load `.output/chrome-mv3` as an unpacked extension in a real Chrome, press the icon on an ordinary page, press “Check page”, see the number on the icon, go to another page in the same tab and see it disappear. This is the only check of the `activeTab` path: the browser tests add a host permission to a copy.
3. Merge this pull request, build the zip on `main` (`npm run zip`), upload it in the store console (Package, Upload new package), check the listing text, Submit for review.

## Update after stages 23 and 24

The release is not uploaded yet, so version 0.2.0 now also contains the kept result of a tab (`tasks/TASK-23.md`) and the counts in three groups (`tasks/TASK-24.md`). The numbers in Results below were true when they were written. Because the extension now keeps the result of a tab in memory, `PRIVACY.md`, `store/listing.md` and the privacy page of the website were changed again; the website pull request is merged on the day the store approves the version. In the owner's manual check (step 2) add: close the window, open it again on the same page and see the same result with the time; go to another page and see that the result and the number are gone; check a page with a manual review only and see the yellow “!”.

## Results

1. Done: version, description, listing, `PRIVACY.md`, `CHANGELOG.md`, `docs/PROJECT_LOG.md`, and two new tests in `tests/package.test.ts` (the description equals the listing and is at most 132 characters; the privacy policy has the icon paragraph).
2. Checks: `npm run typecheck` clean; `npm run test` 141 of 141; `npm run test:e2e` 19 of 19 in two runs (4.8 and 5.8 s); `npm run zip` gives `plain-a11y-0.2.0-chrome.zip`, 280.18 kB, manifest version 0.2.0, description 125 characters, permissions `activeTab`, `scripting`, `storage`, no host permissions, no content scripts; the unzipped package is identical to `.output/chrome-mv3`.
3. The test of the description was checked by changing the text in `wxt.config.ts`: it fails (1 failed, 140 passed). The file was restored.
4. Not checked: the real `activeTab` path in a normal Chrome profile (the owner's step 2); how the store console treats the new package; Chrome versions older than 110, where the API for the badge text color does not exist, so the badge would not show (the check itself works).
