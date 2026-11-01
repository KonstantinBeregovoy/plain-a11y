import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { AxeResults } from 'axe-core';
import { expect, test } from './harness';

const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');

type AxeWindow = { axe: { run(): Promise<AxeResults> } };

test.describe('the popup page in a real browser', () => {
  for (const scheme of ['light', 'dark'] as const) {
    test(`has no axe violations in the ${scheme} scheme`, async ({ tools }) => {
      const popup = await tools.popup();
      await popup.emulateMedia({ colorScheme: scheme });
      await expect(popup.getByRole('button', { name: 'Check page' })).toBeVisible();
      // The page of an extension forbids injected scripts, so the source is evaluated directly.
      await popup.evaluate(axeSource);
      const results = await popup.evaluate(
        async () => (await (window as unknown as AxeWindow).axe.run()) as AxeResults,
      );
      expect(results.violations.map((violation) => `${violation.id}: ${violation.nodes.length}`)).toEqual([]);
      expect(results.passes.length).toBeGreaterThan(5);
    });
  }

  test('lets the check button be reached and pressed with the keyboard', async ({ tools }) => {
    const popup = await tools.popup();
    await popup.keyboard.press('Tab');
    const focused = await popup.evaluate(() => document.activeElement?.textContent?.trim());
    expect(focused).toBe('Check page');
  });

  test('the audit itself can fail: it reports a contrast problem that is made on purpose', async ({ tools }) => {
    const popup = await tools.popup();
    await popup.evaluate(() => {
      document.body.style.color = '#cccccc';
      document.body.style.backgroundColor = '#ffffff';
    });
    await popup.evaluate(axeSource);
    const results = await popup.evaluate(
      async () => (await (window as unknown as AxeWindow).axe.run()) as AxeResults,
    );
    expect(results.violations.map((violation) => violation.id)).toContain('color-contrast');
  });
});
