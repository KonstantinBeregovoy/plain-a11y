import type { HighlightTarget } from '../../src/report/violations';
import { expect, test } from './harness';

test.describe('“Show on page”', () => {
  test('outlines every issue of basic.html, and removing it leaves the markup as it was', async ({ tools }) => {
    const page = await tools.open('basic.html');
    const popup = await tools.popup();
    const before = await tools.markup(page);
    const result = await tools.check(page, popup);
    const targets: HighlightTarget[] = result.items.flatMap((item) => item.targets);

    const shown = await tools.highlight(popup, targets);
    expect(shown.found).toBeGreaterThanOrEqual(result.items.length);
    expect(await tools.outlined(page)).toBeGreaterThan(0);

    await tools.clearHighlight(popup);
    expect(await tools.outlined(page)).toBe(0);
    // No read of the markup between the highlight and its removal: a read there once hid a defect.
    expect(await tools.markup(page)).toBe(before);
  });

  test('finds elements inside open shadow roots, also nested ones, and restores the markup', async ({ tools }) => {
    const page = await tools.open('shadow.html');
    const popup = await tools.popup();
    const before = await tools.markup(page);
    const result = await tools.check(page, popup);
    const targets: HighlightTarget[] = result.items.flatMap((item) => item.targets);
    expect(targets.some((target) => Array.isArray(target) && target.length > 1)).toBe(true);

    const shown = await tools.highlight(popup, targets);
    expect(shown.found).toBeGreaterThanOrEqual(3);
    await tools.clearHighlight(popup);
    expect(await tools.markup(page)).toBe(before);
  });

  test('outlines the nearest visible parent of an element with no visible area, and counts it', async ({ tools }) => {
    const page = await tools.open('basic.html');
    const popup = await tools.popup();
    const before = await tools.markup(page);
    // The empty link of basic.html is 0 by 0 pixels: nothing could be seen if it were outlined itself.
    const result = await tools.check(page, popup);
    const link = result.items.find((item) => item.id === 'link-name');
    expect(link).toBeDefined();
    const shown = await tools.highlight(popup, link?.targets ?? []);
    expect(shown).toMatchObject({ found: 1, nearest: 1, notVisible: 0 });

    // An element that has a visible area is outlined itself, and is not counted as "nearest".
    const image = result.items.find((item) => item.id === 'image-alt');
    expect(await tools.highlight(popup, image?.targets ?? [])).toMatchObject({ found: 1, nearest: 0, notVisible: 0 });
    await tools.clearHighlight(popup);
    expect(await tools.markup(page)).toBe(before);
  });

  test('is removed when the popup closes', async ({ tools }) => {
    const page = await tools.open('basic.html');
    const popup = await tools.popup();
    const before = await tools.markup(page);
    const result = await tools.check(page, popup);
    // The popup keeps a port open while it is visible; the service worker clears on its disconnect.
    await popup.evaluate(() => {
      Object.assign(window, { popupPort: chrome.runtime.connect({ name: 'popup' }) });
    });
    await tools.highlight(popup, result.items.flatMap((item) => item.targets));
    expect(await tools.outlined(page)).toBeGreaterThan(0);

    await popup.close();
    await expect.poll(() => tools.outlined(page)).toBe(0);
    expect(await tools.markup(page)).toBe(before);
  });
});
