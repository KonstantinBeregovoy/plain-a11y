# Plain A11y privacy policy

Last updated: 28 October 2026.

## In short

Plain A11y collects nothing and sends nothing. All work happens in your browser.

## What happens to data

- **Page content.** When you press “Check page”, the check runs on the current tab right in the browser. The page content and the result of the check are not sent anywhere and are not stored. The result lives only while the popup is open.
- **Clipboard.** The extension writes the report to the clipboard only when you press “Copy report”. It cannot read the clipboard.
- **Settings.** Only two choices are saved: the selected role filter (“All”, “Design”, “Content” or “Code”) and whether the “AAA recommendations” block is shown or hidden. They are stored locally in the browser (`chrome.storage.local`) and never leave your device.

## What the extension does not have

- No server, no accounts and no sign-up.
- No analytics, counters or tracking.
- No network requests. The check turns off the loading of page resources that axe-core can otherwise do.
- No remotely loaded code. All code is inside the extension package.
- Data is not sold, not shared with third parties and not used for advertising.

## Permissions

- `activeTab`: access to the current tab only after you click the extension icon.
- `scripting`: running the check on that tab.
- `storage`: saving the selected role filter and the choice to show or hide the AAA block.

The extension does not request access to all sites.

## Questions

You can ask a question or report a problem by email to contact@bereg.dev, or through the Issues section of the project repository.
