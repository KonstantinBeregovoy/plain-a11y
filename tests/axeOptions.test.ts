import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { AXE_RUN_OPTIONS } from '../src/content/axeOptions';

describe('AXE_RUN_OPTIONS', () => {
  it('switches the target-size rule on', () => {
    expect(AXE_RUN_OPTIONS.rules).toMatchObject({
      'target-size': { enabled: true },
    });
  });

  it('refers to a rule that exists in the installed axe-core', () => {
    expect(axe.getRules().some((rule) => rule.ruleId === 'target-size')).toBe(true);
  });

  it('changes nothing else: only target-size is configured, and preload stays off', () => {
    expect(Object.keys(AXE_RUN_OPTIONS.rules ?? {})).toEqual(['target-size']);
    expect(AXE_RUN_OPTIONS.preload).toBe(false);
    expect(Object.keys(AXE_RUN_OPTIONS).sort()).toEqual(['preload', 'rules']);
  });
});
