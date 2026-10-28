import { describe, expect, it } from 'vitest';
import { formatPageUrl, toMarkdown } from '../src/report/toMarkdown';
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

describe('formatPageUrl', () => {
  it('drops the query string and the fragment', () => {
    expect(formatPageUrl('https://example.com/a/b?token=secret&x=1#section')).toBe(
      'https://example.com/a/b',
    );
  });

  it('keeps scheme, host, port and path of a plain address', () => {
    expect(formatPageUrl('https://example.com/')).toBe('https://example.com/');
    expect(formatPageUrl('http://localhost:3000/app')).toBe('http://localhost:3000/app');
  });

  it('drops credentials embedded in the address', () => {
    expect(formatPageUrl('https://user:pass@example.com/x?y=1')).toBe(
      'https://example.com/x',
    );
  });

  it('handles file addresses', () => {
    expect(formatPageUrl('file:///home/user/page.html?x=1#y')).toBe(
      'file:///home/user/page.html',
    );
  });

  it('cuts an unparsable address at the first ? or #', () => {
    expect(formatPageUrl('not a url?token=1#x')).toBe('not a url');
    expect(formatPageUrl('')).toBe('');
  });

  it('is applied in the report header', () => {
    const markdown = toMarkdown([], {
      url: 'https://example.com/page?token=secret#top',
      date: new Date(2026, 9, 27),
    });
    expect(markdown).toContain('Page: https://example.com/page\n');
    expect(markdown).not.toContain('secret');
  });
});

describe('toMarkdown manual review section', () => {
  const REVIEW = [
    item('tabindex', 'unknown'), // code
    item('image-alt', 'unknown'), // content
    item('color-contrast', 'unknown'), // design
  ];

  it('adds a section after the role sections, grouped by role', () => {
    const markdown = toMarkdown([item('label', 'critical')], META, REVIEW);
    const lines = markdown.split('\n');
    const heading = lines.indexOf('## Needs manual review');
    expect(heading).toBeGreaterThan(lines.indexOf('## Code'));
    const items = lines.slice(heading).filter((line) => line.startsWith('- [ ] '));
    expect(items).toHaveLength(3);
    expect(items[0]).toMatch(/^- \[ \] Design: Text is hard to read against its background\. If confirmed, how to fix: /);
    expect(items[1]).toMatch(/^- \[ \] Content: Image has no text description\./);
    expect(items[2]).toMatch(/^- \[ \] Code: Tab order has been changed\./);
    expect(markdown).toContain('could not decide these items on its own');
  });

  it('has no such section when nothing needs a review', () => {
    expect(toMarkdown([item('label', 'critical')], META, [])).not.toContain('manual review');
    expect(toMarkdown([item('label', 'critical')], META)).not.toContain('manual review');
  });

  it('mentions the number of review items when no issues were found', () => {
    const many = toMarkdown([], META, REVIEW);
    expect(many).toContain(
      'The automated check found no issues, but 3 items need a manual review (listed below).',
    );
    expect(many).toContain('only part of the accessibility requirements');
    expect(many).toContain('## Needs manual review');
    expect(toMarkdown([], META, [item('image-alt', 'unknown')])).toContain(
      'but 1 item needs a manual review',
    );
  });

  it('keeps the old wording for an empty result without review items', () => {
    const markdown = toMarkdown([], META, []);
    expect(markdown).toContain('The automated check found no issues. It covers');
    expect(markdown).not.toContain('manual review');
  });

  it('shows items without a dictionary entry with the axe text and no fix', () => {
    const markdown = toMarkdown([], META, [item('brand-new-rule', 'unknown', 'Some new rule')]);
    expect(markdown).toContain('- [ ] Code: Some new rule.');
    expect(markdown).not.toContain('If confirmed');
  });
});

describe('toMarkdown AAA recommendations section', () => {
  const AAA = [
    item('meta-refresh-no-exceptions', 'minor'), // code
    item('color-contrast-enhanced', 'minor'), // design
  ];

  it('adds a section at the end, after the review section', () => {
    const markdown = toMarkdown(
      [item('label', 'critical')],
      META,
      [item('video-caption', 'unknown')],
      AAA,
    );
    const lines = markdown.split('\n');
    const aaaHeading = lines.indexOf('## AAA recommendations');
    expect(aaaHeading).toBeGreaterThan(lines.indexOf('## Needs manual review'));
    const entries = lines.slice(aaaHeading).filter((line) => line.startsWith('- [ ] '));
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatch(/^- \[ \] Design: Text contrast is below the enhanced level\. How to fix: /);
    expect(entries[1]).toMatch(/^- \[ \] Code: Page reloads or redirects by itself after a delay\./);
    expect(markdown).toContain('Optional recommendations beyond the standard level.');
    expect(markdown.trimEnd().split('\n').at(-1)).toBe(entries[1]);
  });

  it('has no such section when the list is empty (for example when the block is hidden)', () => {
    expect(toMarkdown([item('label', 'critical')], META, [], [])).not.toContain('AAA');
    expect(toMarkdown([item('label', 'critical')], META)).not.toContain('AAA');
  });

  it('does not count AAA items as issues: an empty issue list still says no issues were found', () => {
    const markdown = toMarkdown([], META, [], AAA);
    expect(markdown).toContain('The automated check found no issues. It covers');
    expect(markdown).toContain('## AAA recommendations');
  });
});
