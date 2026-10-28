import { describe, expect, it } from 'vitest';
import { toMarkdown } from '../src/report/toMarkdown';
import type { ViolationItem } from '../src/report/violations';

function item(
  id: string,
  impact: ViolationItem['impact'],
  help = `help ${id}`,
): ViolationItem {
  return { id, help, impact, nodeCount: 1, targets: [] };
}

const META = { url: 'https://example.com/page', date: new Date(2026, 9, 27) };

describe('toMarkdown', () => {
  it('builds the report for a fixed input', () => {
    const markdown = toMarkdown(
      [
        item('tabindex', 'minor'),
        item('link-name', 'serious'),
        item('image-alt', 'critical'),
        item('color-contrast', 'serious'),
        item('label', 'critical'),
        item('brand-new-rule', 'moderate', 'Some new rule must pass'),
      ],
      META,
    );
    expect(markdown).toMatchSnapshot();
  });

  it('writes the address and date in the header', () => {
    const markdown = toMarkdown([item('image-alt', 'critical')], META);
    expect(markdown).toContain('Page: https://example.com/page');
    expect(markdown).toContain('Date: 2026-10-27');
  });

  it('makes checkbox items, more severe first within a role', () => {
    const markdown = toMarkdown(
      [item('tabindex', 'minor'), item('label', 'critical')],
      META,
    );
    const checkboxes = markdown.split('\n').filter((line) => line.startsWith('- [ ] '));
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toMatch(/^- \[ \] Critical: Form field has no label\. How to fix: /);
    expect(checkboxes[1]).toMatch(/^- \[ \] Minor: /);
  });

  it('says no issues were found for an empty result and reminds about the limitation', () => {
    const markdown = toMarkdown([], META);
    expect(markdown).toContain('The automated check found no issues.');
    expect(markdown).toContain('only part of the accessibility requirements');
    expect(markdown).not.toContain('- [ ]');
    expect(markdown).not.toContain('## ');
  });
});
