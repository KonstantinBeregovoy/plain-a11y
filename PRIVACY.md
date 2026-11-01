# Plain A11y privacy policy

Last updated: 1 November 2026.

## In short

Plain A11y collects nothing and sends nothing. All work happens in your browser.

## What happens to data

- **Page content.** When you press “Check page”, the check runs on the current tab right in the browser. The page content and the result of the check are not sent anywhere. The result is kept only in the memory of the browser, as described in the next two points.
- **Last result of a tab.** After a check, the extension keeps the result for that tab: the list of problems with the selectors of the elements, the page address and the time of the check. This lets you open the window again on the same page and see the result again. It is kept in the memory of the browser (`chrome.storage.session`) and is never sent anywhere. It is removed when the tab loads another page, when the tab is closed and when the browser is closed.
- **Number on the icon.** After a check, the extension shows on its icon for that tab the number of elements with issues, or a yellow mark when there are no issues but there are items for a manual review or AAA recommendations. This is kept by the browser for that tab only, until the tab loads another page or is closed. The extension does not save it and does not send it anywhere. When nothing is found, the icon shows nothing.
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
- `storage`: saving the selected role filter and the choice to show or hide the AAA block, and keeping the last result of a tab in the memory of the browser until the tab loads another page.

The extension does not request access to all sites.

## Questions

You can ask a question or report a problem by email to contact@bereg.dev, or through the Issues section of the project repository.
