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

describe('настройки', () => {
  it('по умолчанию фильтр «all»', async () => {
    expect(await loadRoleFilter(memoryArea())).toBe('all');
  });

  it('сохранённый фильтр читается обратно', async () => {
    const area = memoryArea();
    await saveRoleFilter('design', area);
    expect(await loadRoleFilter(area)).toBe('design');
    await saveRoleFilter('all', area);
    expect(await loadRoleFilter(area)).toBe('all');
  });

  it('мусор в хранилище заменяется на «all»', async () => {
    expect(await loadRoleFilter(memoryArea({ roleFilter: 'admin' }))).toBe('all');
    expect(await loadRoleFilter(memoryArea({ roleFilter: 42 }))).toBe('all');
  });
});
