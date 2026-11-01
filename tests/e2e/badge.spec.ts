import { expect, test } from './harness';

test.describe('the toolbar badge', () => {
  test('shows the number of issues of the checked tab only', async ({ tools }) => {
    const checked = await tools.open('basic.html');
    const untouched = await tools.open('aaa.html');
    const popup = await tools.popup();
    expect(await tools.badge(`${tools.baseUrl}/basic.html`)).toEqual({ text: '', title: 'Plain A11y' });

    const result = await tools.check(checked, popup);
    expect(result.items).toHaveLength(5);
    expect(await tools.badge(`${tools.baseUrl}/basic.html`)).toEqual({
      text: '5',
      title: 'Plain A11y: 5 issues found in the last check',
    });
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
    expect((await tools.badge(`${tools.baseUrl}/basic.html`)).text).toBe('5');

    await page.goto(`${tools.baseUrl}/clean.html?next=1`);
    await expect
      .poll(async () => (await tools.badge(`${tools.baseUrl}/clean.html?next=1`)).text)
      .toBe('');
    expect((await tools.badge(`${tools.baseUrl}/clean.html?next=1`)).title).toBe('Plain A11y');
  });
});
