import type { Page } from '@playwright/test';
import { expect, test, type Tools } from './harness';

/** Checks `basic.html` (5 issues) in a new tab and returns the tab and a popup page. */
async function checked(tools: Tools) {
  const page = await tools.open('basic.html');
  const popup = await tools.popup();
  const result = await tools.check(page, popup);
  expect(result.items).toHaveLength(5);
  // Without this, the tests that expect a drop would also pass when nothing was ever kept.
  expect((await tools.lastResult(page, popup))?.items).toHaveLength(5);
  expect((await tools.badge(page.url())).text).toBe('5');
  return { page, popup };
}

async function expectDropped(tools: Tools, page: Page, popup: Page) {
  await expect.poll(async () => tools.lastResult(page, popup)).toBeNull();
  await expect.poll(async () => (await tools.badge(page.url())).text).toBe('');
  expect((await tools.badge(page.url())).title).toBe('Plain A11y');
}

test.describe('the result kept for a tab', () => {
  test('comes back when the popup is opened again, and the popup shows it', async ({ tools }) => {
    const { page, popup } = await checked(tools);
    const kept = await tools.lastResult(page, popup);
    expect(kept?.items).toHaveLength(5);
    expect(kept?.url).toBe(`${tools.baseUrl}/basic.html`);
    expect(Date.now() - (kept?.checkedAt ?? 0)).toBeLessThan(60_000);

    // The popup page is opened again while the checked tab is in front.
    await popup.reload();
    await expect(popup.getByText('Issues found: 5')).toBeVisible();
    await expect(popup.getByText(/Showing the result of the check at/)).toBeVisible();
    await expect(popup.getByRole('button', { name: 'Check page' })).toBeVisible();
    expect(await popup.getByRole('listitem').count()).toBeGreaterThan(0);
  });

  test('belongs to its tab: another tab has none', async ({ tools }) => {
    const { popup } = await checked(tools);
    const other = await tools.open('aaa.html');
    expect(await tools.lastResult(other, popup)).toBeNull();
  });

  test('is replaced by a new check', async ({ tools }) => {
    const { page, popup } = await checked(tools);
    const first = await tools.lastResult(page, popup);
    await page.waitForTimeout(20);
    await tools.check(page, popup);
    const second = await tools.lastResult(page, popup);
    expect((second?.checkedAt ?? 0) > (first?.checkedAt ?? 0)).toBe(true);
  });

  test('is dropped, with the badge, when the tab is reloaded', async ({ tools }) => {
    const { page, popup } = await checked(tools);
    await page.reload();
    await expectDropped(tools, page, popup);
  });

  test('is dropped when the tab loads another page, and coming back needs a new check', async ({ tools }) => {
    const { page, popup } = await checked(tools);
    await page.goto(`${tools.baseUrl}/clean.html`);
    await expectDropped(tools, page, popup);
    await page.goto(`${tools.baseUrl}/basic.html`);
    await page.waitForLoadState('load');
    expect(await tools.lastResult(page, popup)).toBeNull();
    expect((await tools.badge(page.url())).text).toBe('');
  });

  test('is dropped when the tab goes back in its history', async ({ tools }) => {
    const first = await tools.open('clean.html');
    const popup = await tools.popup();
    await first.goto(`${tools.baseUrl}/basic.html`);
    await tools.check(first, popup);
    expect((await tools.lastResult(first, popup))?.items).toHaveLength(5);
    await first.goBack();
    await expectDropped(tools, first, popup);
  });

  test('is dropped when a single-page site changes the address, where Chrome keeps the badge itself', async ({ tools }) => {
    const { page, popup } = await checked(tools);
    await page.evaluate(() => history.pushState({}, '', '/basic.html?route=2'));
    await expectDropped(tools, page, popup);
  });

  test('is dropped when only the fragment changes', async ({ tools }) => {
    const { page, popup } = await checked(tools);
    await page.evaluate(() => {
      location.hash = '#section';
    });
    await expectDropped(tools, page, popup);
  });

  test('stays when the page adds an iframe later', async ({ tools }) => {
    const { page, popup } = await checked(tools);
    await page.evaluate(() => {
      const frame = document.createElement('iframe');
      frame.src = '/clean.html';
      document.body.append(frame);
    });
    await page.frameLocator('iframe').locator('body').waitFor();
    await page.waitForTimeout(500);
    expect((await tools.lastResult(page, popup))?.items).toHaveLength(5);
    expect((await tools.badge(page.url())).text).toBe('5');
  });

  test('is removed when the tab is closed, and it never goes to storage.local', async ({ tools }) => {
    const { page, popup } = await checked(tools);
    const before = await tools.storageKeys();
    expect(before.session.filter((key) => key.startsWith('result:'))).toHaveLength(1);
    expect(before.local.filter((key) => key.startsWith('result:'))).toEqual([]);

    await page.close();
    await expect
      .poll(async () => (await tools.storageKeys()).session.filter((key) => key.startsWith('result:')))
      .toEqual([]);
    expect(popup.isClosed()).toBe(false);
  });
});
