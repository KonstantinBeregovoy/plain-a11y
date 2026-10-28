import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync('src/popup/style.css', 'utf8');

/** Every font size declared in the stylesheet, from `font-size` and from the `font` shorthand. */
function fontSizes(): { declaration: string; value: number; unit: string }[] {
  const found = [
    ...css.matchAll(/font-size:\s*([\d.]+)(\w+)\s*;/g),
    ...css.matchAll(/\bfont:\s*([\d.]+)(\w+)[\s/]/g),
  ];
  return found.map((match) => ({
    declaration: match[0].trim(),
    value: Number(match[1]),
    unit: match[2] ?? '',
  }));
}

describe('popup font sizes', () => {
  it('finds the declared font sizes', () => {
    expect(fontSizes().length).toBeGreaterThanOrEqual(6);
  });

  it('sets every font size in rem so the browser font setting applies', () => {
    for (const size of fontSizes()) {
      expect(size.unit, size.declaration).toBe('rem');
    }
  });

  it('never goes below 12px (0.75rem)', () => {
    for (const size of fontSizes()) {
      expect(size.value, size.declaration).toBeGreaterThanOrEqual(0.75);
    }
  });

  it('keeps the agreed scale: headings 16/14/13px, body and issue titles 13px, captions 12px', () => {
    const px = (name: RegExp) => {
      const match = css.match(name);
      return match ? Number(match[1]) * 16 : NaN;
    };
    expect(px(/\bfont:\s*([\d.]+)rem/)).toBe(13);
    expect(px(/h1 \{[^}]*font-size:\s*([\d.]+)rem/)).toBe(16);
    expect(px(/\.severity h2 \{[^}]*font-size:\s*([\d.]+)rem/)).toBe(14);
    expect(px(/\.severity h3 \{[^}]*font-size:\s*([\d.]+)rem/)).toBe(13);
    expect(px(/\.violations h4 \{[^}]*font-size:\s*([\d.]+)rem/)).toBe(13);
    expect(px(/\.meta \{[^}]*font-size:\s*([\d.]+)rem/)).toBe(12);
  });
});
