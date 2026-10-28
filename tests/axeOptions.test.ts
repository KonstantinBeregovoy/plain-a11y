import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { AAA_RULE_IDS, AXE_RUN_OPTIONS } from '../src/content/axeOptions';

describe('AXE_RUN_OPTIONS', () => {
  it('switches the target-size rule on', () => {
    expect(AXE_RUN_OPTIONS.rules).toMatchObject({
      'target-size': { enabled: true },
    });
  });

  it('switches the three AAA rules on', () => {
    expect([...AAA_RULE_IDS].sort()).toEqual([
      'color-contrast-enhanced',
      'identical-links-same-purpose',
      'meta-refresh-no-exceptions',
    ]);
    for (const id of AAA_RULE_IDS) {
      expect(AXE_RUN_OPTIONS.rules, id).toMatchObject({ [id]: { enabled: true } });
    }
  });

  it('refers only to rules that exist in axe-core and are off by default', () => {
    const rules = new Map(axe.getRules().map((rule) => [rule.ruleId, rule]));
    for (const id of Object.keys(AXE_RUN_OPTIONS.rules ?? {})) {
      expect(rules.has(id), id).toBe(true);
      expect(rules.get(id)?.enabled, `${id} is off by default`).toBe(false);
    }
  });

  it('changes nothing else: only the four rules are configured, and preload stays off', () => {
    expect(Object.keys(AXE_RUN_OPTIONS.rules ?? {}).sort()).toEqual(
      ['target-size', ...AAA_RULE_IDS].sort(),
    );
    expect(AXE_RUN_OPTIONS.preload).toBe(false);
    expect(Object.keys(AXE_RUN_OPTIONS).sort()).toEqual(['preload', 'rules']);
  });
});
