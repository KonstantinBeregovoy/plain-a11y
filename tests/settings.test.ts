import { describe, expect, it } from 'vitest';
import {
  loadRoleFilter,
  saveRoleFilter,
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
