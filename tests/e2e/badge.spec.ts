import { expect, test } from './harness';

test.describe('the toolbar badge', () => {
  test('shows the number of elements with issues of the checked tab only', async ({ tools }) => {
    const checked = await tools.open('basic.html');
    const untouched = await tools.open('aaa.html');
    const popup = await tools.popup();
    expect(await tools.badge(`${tools.baseUrl}/basic.html`)).toEqual({ text: '', title: 'Plain A11y' });

    const result = await tools.check(checked, popup);
    // Five kinds of problem, six elements: the icon counts the elements.
    expect(result.items).toHaveLength(5);
    expect(result.items.reduce((sum, item) => sum + item.nodeCount, 0)).toBe(6);
    expect(await tools.badge(`${tools.baseUrl}/basic.html`)).toEqual({
      text: '6',
      title: 'Plain A11y: 6 issues in the last check',
    });
    expect(await tools.badgeColor(`${tools.baseUrl}/basic.html`)).toEqual([160, 29, 23, 255]);
    expect(await tools.badge(`${tools.baseUrl}/aaa.html`)).toEqual({ text: '', title: 'Plain A11y' });
    expect(untouched.url()).toBe(`${tools.baseUrl}/aaa.html`);
  });

  test('is empty for a page without issues, because it must never look like “passed”', async ({ tools }) => {
    const page = await tools.open('clean.html');
    const popup = await tools.popup();
    await tools.check(page, popup);
    expect(await tools.badge(`${tools.baseUrl}/clean.html`)).toEqual({ text: '', title: 'Plain A11y' });
  });

  test('is reset when the tab loads another page', async ({ tools }) => {
    const page = await tools.open('basic.html');
    const popup = await tools.popup();
    await tools.check(page, popup);
    expect((await tools.badge(`${tools.baseUrl}/basic.html`)).text).toBe('6');

    await page.goto(`${tools.baseUrl}/clean.html?next=1`);
    await expect
      .poll(async () => (await tools.badge(`${tools.baseUrl}/clean.html?next=1`)).text)
      .toBe('');
    expect((await tools.badge(`${tools.baseUrl}/clean.html?next=1`)).title).toBe('Plain A11y');
  });

  test('names the three groups in the tooltip, and counts only the issues in the number', async ({ tools }) => {
    const page = await tools.open('aaa.html');
    const popup = await tools.popup();
    const result = await tools.check(page, popup);
    expect(result.items.map((item) => item.id).sort()).toEqual(['image-alt', 'meta-refresh']);
    expect(result.aaa).toHaveLength(1);
    expect(await tools.badge(page.url())).toEqual({
      text: '2',
      title: 'Plain A11y: 2 issues, 1 AAA recommendation in the last check',
    });
  });

  test('shows an amber mark, not a number, when only manual review is left', async ({ tools }) => {
    const page = await tools.open('review.html');
    const popup = await tools.popup();
    const result = await tools.check(page, popup);
    expect(result.items).toEqual([]);
    expect(await tools.badge(page.url())).toEqual({
      text: '!',
      title: 'Plain A11y: 2 to review by hand in the last check',
    });
    expect(await tools.badgeColor(page.url())).toEqual([255, 193, 7, 255]);
  });

  test('also shows the amber mark for a name that differs from the visible text, which a person decides', async ({ tools }) => {
    const page = await tools.open('mismatch.html');
    const popup = await tools.popup();
    const result = await tools.check(page, popup);
    expect(result.items).toEqual([]);
    expect(result.review.map((item) => item.id)).toEqual(['label-content-name-mismatch']);
    expect((await tools.badge(page.url())).text).toBe('!');
  });
});
