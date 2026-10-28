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
  it('covers all rules from the task', () => {
    expect(dictionary.map((entry) => entry.id).sort()).toEqual(
      [...REQUIRED_IDS].sort(),
    );
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
