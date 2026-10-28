import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { describeRule, dictionary } from '../src/dictionary/dictionary';

const ROLES = ['design', 'content', 'code'];
const REQUIRED_IDS = [
  'color-contrast',
  'image-alt',
  'label',
  'link-name',
  'button-name',
  'heading-order',
  'document-title',
  'html-has-lang',
  'frame-title',
  'tabindex',
  'target-size',
];

function sentenceCount(text: string): number {
  return text.split(/[.!?…]+(?:\s|$)/).filter((part) => part.trim()).length;
}

describe('dictionary', () => {
  it('still contains the rules from the earlier tasks (TASK-2, TASK-9)', () => {
    const ids = new Set(dictionary.map((entry) => entry.id));
    for (const id of REQUIRED_IDS) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it('has every field filled in for each entry', () => {
    for (const entry of dictionary) {
      expect(entry.id.trim(), entry.id).not.toBe('');
      expect(entry.title.trim(), entry.id).not.toBe('');
      expect(entry.whoIsAffected.trim(), entry.id).not.toBe('');
      expect(entry.howToFix.trim(), entry.id).not.toBe('');
      expect(ROLES, entry.id).toContain(entry.role);
    }
  });

  it('only uses ids that exist in axe.getRules()', () => {
    const axeIds = new Set(axe.getRules().map((rule) => rule.ruleId));
    for (const entry of dictionary) {
      expect(axeIds.has(entry.id), entry.id).toBe(true);
    }
  });

  it('has no duplicate ids', () => {
    const ids = dictionary.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps texts plain: no WCAG or ARIA, at most two sentences', () => {
    for (const entry of dictionary) {
      for (const text of [entry.title, entry.whoIsAffected, entry.howToFix]) {
        expect(text, entry.id).not.toMatch(/wcag|aria/i);
        expect(sentenceCount(text), `${entry.id}: ${text}`).toBeLessThanOrEqual(2);
      }
    }
  });
});

describe('describeRule', () => {
  it('returns the dictionary entry for a known rule', () => {
    const rule = describeRule('image-alt', 'Images must have alternate text');
    expect(rule.title).toBe('Image has no text description');
    expect(rule.role).toBe('content');
    expect(rule.whoIsAffected).not.toBeNull();
  });

  it('falls back to the axe help text and the code role for an unknown rule', () => {
    expect(describeRule('some-new-rule', 'Some help text')).toEqual({
      id: 'some-new-rule',
      title: 'Some help text',
      whoIsAffected: null,
      howToFix: null,
      role: 'code',
    });
  });
});

describe('dictionary coverage by part', () => {
  function ruleIds(category: string): string[] {
    return axe
      .getRules()
      .filter((rule) => rule.tags.includes(`cat.${category}`) && rule.enabled)
      .map((rule) => rule.ruleId);
  }

  // Categories described so far and how many rules axe runs by default in each,
  // counting entries written in earlier tasks (for example tabindex in keyboard).
  const PARTS: [string, number][] = [
    ['aria', 24], // TASK-10
    ['semantics', 11], // TASK-11 (10 new)
    ['keyboard', 8], // TASK-11 (7 new)
    ['structure', 6], // TASK-11 (6 new)
    ['text-alternatives', 12], // TASK-12 (9 new)
    ['name-role-value', 7], // TASK-12 (5 new)
    ['forms', 5], // TASK-12 (4 new)
    ['tables', 4], // TASK-13
    ['language', 4], // TASK-13 (3 new)
    ['time-and-media', 3], // TASK-13
    ['parsing', 2], // TASK-13
    ['sensory-and-visual-cues', 2], // TASK-13
    ['color', 2], // TASK-13 (1 new)
  ];

  for (const [category, count] of PARTS) {
    it(`describes every ${category} rule that axe runs by default (${count})`, () => {
      const described = new Set(dictionary.map((entry) => entry.id));
      const ids = ruleIds(category);
      expect(ids).toHaveLength(count);
      expect(ids.filter((id) => !described.has(id))).toEqual([]);
    });
  }

  it('hands technical rules to code, wording rules to content, layout rules to design', () => {
    const notCode = dictionary
      .filter((entry) => entry.role !== 'code')
      .map((entry) => `${entry.id}:${entry.role}`)
      .sort();
    expect(notCode).toEqual(
      [
        'area-alt:content',
        'color-contrast:design',
        'document-title:content',
        'empty-heading:content',
        'empty-table-header:content',
        'heading-order:content',
        'image-alt:content',
        'image-redundant-alt:content',
        'input-image-alt:content',
        'label-title-only:design',
        'link-in-text-block:design',
        'link-name:content',
        'object-alt:content',
        'page-has-heading-one:content',
        'role-img-alt:content',
        'svg-img-alt:content',
        'target-size:design',
        'video-caption:content',
      ].sort(),
    );
  });

  it('has an entry for every rule axe runs by default, plus the ones we switch on (TASK-13)', () => {
    // When more rules are switched on later (for example the AAA rules in TASK-15),
    // add them to EXTRA together with their dictionary entries.
    const EXTRA = ['target-size'];
    const enabled = axe
      .getRules()
      .filter((rule) => rule.enabled)
      .map((rule) => rule.ruleId);
    expect(enabled).toHaveLength(90);
    const expected = [...enabled, ...EXTRA].sort();
    expect(dictionary.map((entry) => entry.id).sort()).toEqual(expected);
  });
});
