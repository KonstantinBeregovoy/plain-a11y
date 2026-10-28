import { describe, expect, it } from 'vitest';
import {
  loadRoleFilter,
  loadShowAaa,
  saveRoleFilter,
  saveShowAaa,
  type StorageArea,
} from '../src/popup/settings';

function memoryArea(initial: Record<string, unknown> = {}): StorageArea {
  const data = { ...initial };
  return {
    get: async (key) => (key in data ? { [key]: data[key] } : {}),
    set: async (items) => {
      Object.assign(data, items);
    },
  };
}

describe('settings', () => {
  it('defaults to the “all” filter', async () => {
    expect(await loadRoleFilter(memoryArea())).toBe('all');
  });

  it('reads back a saved filter', async () => {
    const area = memoryArea();
    await saveRoleFilter('design', area);
    expect(await loadRoleFilter(area)).toBe('design');
    await saveRoleFilter('all', area);
    expect(await loadRoleFilter(area)).toBe('all');
  });

  it('replaces garbage in storage with “all”', async () => {
    expect(await loadRoleFilter(memoryArea({ roleFilter: 'admin' }))).toBe('all');
    expect(await loadRoleFilter(memoryArea({ roleFilter: 42 }))).toBe('all');
  });
});

describe('show AAA setting', () => {
  it('is on by default', async () => {
    expect(await loadShowAaa(memoryArea())).toBe(true);
  });

  it('reads back a saved choice', async () => {
    const area = memoryArea();
    await saveShowAaa(false, area);
    expect(await loadShowAaa(area)).toBe(false);
    await saveShowAaa(true, area);
    expect(await loadShowAaa(area)).toBe(true);
  });

  it('replaces garbage in storage with the default', async () => {
    expect(await loadShowAaa(memoryArea({ showAaa: 'no' }))).toBe(true);
    expect(await loadShowAaa(memoryArea({ showAaa: 0 }))).toBe(true);
  });

  it('does not touch the role filter', async () => {
    const area = memoryArea();
    await saveRoleFilter('code', area);
    await saveShowAaa(false, area);
    expect(await loadRoleFilter(area)).toBe('code');
  });
});
