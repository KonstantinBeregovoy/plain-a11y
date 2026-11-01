import { expect, test } from './harness';

const ids = (items: { id: string }[]) => items.map((item) => item.id).sort();

test.describe('the check, through the real path', () => {
  test('finds the five expected rules on basic.html', async ({ tools }) => {
    const page = await tools.open('basic.html');
    const popup = await tools.popup();
    const result = await tools.check(page, popup);
    expect(ids(result.items)).toEqual(['color-contrast', 'image-alt', 'label', 'link-name', 'target-size']);
    expect(result.url).toBe(`${tools.baseUrl}/basic.html`);
    for (const item of result.items) expect(item.targets.length, item.id).toBeGreaterThan(0);
  });

  test('puts a name that differs from the visible text into the review, not into the issues', async ({ tools }) => {
    const page = await tools.open('mismatch.html');
    const popup = await tools.popup();
    const result = await tools.check(page, popup);
    expect(result.items).toEqual([]);
    expect(ids(result.review)).toEqual(['label-content-name-mismatch']);
  });

  test('finds nothing on a page without problems, and does not claim anything else', async ({ tools }) => {
    const page = await tools.open('clean.html');
    const popup = await tools.popup();
    const result = await tools.check(page, popup);
    expect(result.items).toEqual([]);
    expect(result.aaa).toEqual([]);
  });

  test('puts what axe cannot decide into the review list, not into the issues', async ({ tools }) => {
    const page = await tools.open('review.html');
    const popup = await tools.popup();
    const result = await tools.check(page, popup);
    expect(result.items).toEqual([]);
    expect(ids(result.review)).toEqual(['color-contrast', 'video-caption']);
  });

  test('keeps AAA recommendations apart from the issues', async ({ tools }) => {
    const page = await tools.open('aaa.html');
    const popup = await tools.popup();
    const result = await tools.check(page, popup);
    expect(ids(result.aaa)).toEqual(['color-contrast-enhanced']);
    expect(result.items.map((item) => item.id)).not.toContain('color-contrast-enhanced');
  });

  test('can be run again on the same tab without injecting a second listener', async ({ tools }) => {
    const page = await tools.open('basic.html');
    const popup = await tools.popup();
    const first = await tools.check(page, popup);
    const second = await tools.check(page, popup);
    expect(ids(second.items)).toEqual(ids(first.items));
  });
});
