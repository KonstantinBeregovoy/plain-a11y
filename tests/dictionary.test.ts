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
];

function sentenceCount(text: string): number {
  return text.split(/[.!?…]+(?:\s|$)/).filter((part) => part.trim()).length;
}

describe('словарь', () => {
  it('покрывает все правила из задания', () => {
    expect(dictionary.map((entry) => entry.id).sort()).toEqual(
      [...REQUIRED_IDS].sort(),
    );
  });

  it('у каждой записи заполнены все поля', () => {
    for (const entry of dictionary) {
      expect(entry.id.trim(), entry.id).not.toBe('');
      expect(entry.title.trim(), entry.id).not.toBe('');
      expect(entry.whoIsAffected.trim(), entry.id).not.toBe('');
      expect(entry.howToFix.trim(), entry.id).not.toBe('');
      expect(ROLES, entry.id).toContain(entry.role);
    }
  });

  it('каждый id существует в axe.getRules()', () => {
    const axeIds = new Set(axe.getRules().map((rule) => rule.ruleId));
    for (const entry of dictionary) {
      expect(axeIds.has(entry.id), entry.id).toBe(true);
    }
  });

  it('id в словаре не повторяются', () => {
    const ids = dictionary.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('тексты простые: без WCAG и ARIA, не длиннее двух предложений', () => {
    for (const entry of dictionary) {
      for (const text of [entry.title, entry.whoIsAffected, entry.howToFix]) {
        expect(text, entry.id).not.toMatch(/wcag|aria/i);
        expect(sentenceCount(text), `${entry.id}: ${text}`).toBeLessThanOrEqual(2);
      }
    }
  });
});

describe('describeRule', () => {
  it('возвращает запись словаря для известного правила', () => {
    const rule = describeRule('image-alt', 'Images must have alternate text');
    expect(rule.title).toBe('У картинки нет текстового описания');
    expect(rule.role).toBe('content');
    expect(rule.whoIsAffected).not.toBeNull();
  });

  it('для неизвестного правила берёт help из axe и роль code', () => {
    expect(describeRule('some-new-rule', 'Some help text')).toEqual({
      id: 'some-new-rule',
      title: 'Some help text',
      whoIsAffected: null,
      howToFix: null,
      role: 'code',
    });
  });
});
