import { describe, expect, it } from 'vitest';
import {
  forgetResult,
  loadResult,
  resultKey,
  saveResult,
  startsNewPage,
  type SessionStore,
} from '../src/background/lastResult';
import type { StoredCheck } from '../src/report/messages';

function memoryStore(): SessionStore & { data: Map<string, unknown> } {
  const data = new Map<string, unknown>();
  return {
    data,
    get: async (key) => data.get(key),
    set: async (key, value) => void data.set(key, value),
    remove: async (key) => void data.delete(key),
  };
}

const CHECK: StoredCheck = {
  url: 'https://example.com/page',
  checkedAt: 1_700_000_000_000,
  items: [{ id: 'image-alt', help: 'h', impact: 'critical', nodeCount: 2, targets: ['img'] }],
  review: [],
  aaa: [],
};

describe('the kept result of a tab', () => {
  it('is read back as it was saved', async () => {
    const store = memoryStore();
    await saveResult(7, CHECK, store);
    expect(await loadResult(7, store)).toEqual(CHECK);
  });

  it('is kept per tab: another tab has none, and a new check replaces the old one', async () => {
    const store = memoryStore();
    await saveResult(7, CHECK, store);
    expect(await loadResult(8, store)).toBeNull();
    const newer = { ...CHECK, checkedAt: CHECK.checkedAt + 1, items: [] };
    await saveResult(7, newer, store);
    expect(await loadResult(7, store)).toEqual(newer);
    expect(store.data.size).toBe(1);
  });

  it('is removed for one tab only', async () => {
    const store = memoryStore();
    await saveResult(7, CHECK, store);
    await saveResult(8, CHECK, store);
    await forgetResult(7, store);
    expect(await loadResult(7, store)).toBeNull();
    expect(await loadResult(8, store)).toEqual(CHECK);
  });

  it('is ignored when the stored value is damaged', async () => {
    const store = memoryStore();
    for (const broken of [
      'text',
      42,
      null,
      { url: 'https://example.com/' },
      { ...CHECK, checkedAt: '1' },
      { ...CHECK, items: 'none' },
      { ...CHECK, aaa: undefined },
    ]) {
      store.data.set(resultKey(7), broken);
      expect(await loadResult(7, store), JSON.stringify(broken)).toBeNull();
    }
  });

  it('stores nothing but the lists, the address and the time', async () => {
    const store = memoryStore();
    await saveResult(7, CHECK, store);
    expect(Object.keys(store.data.get(resultKey(7)) as object).sort()).toEqual(
      ['aaa', 'checkedAt', 'items', 'review', 'url'],
    );
  });

  it('rejects when the storage fails, so the caller can ignore it', async () => {
    const failing: SessionStore = {
      get: async () => Promise.reject(new Error('quota')),
      set: async () => Promise.reject(new Error('quota')),
      remove: async () => Promise.reject(new Error('quota')),
    };
    await expect(saveResult(7, CHECK, failing)).rejects.toThrow('quota');
    await expect(loadResult(7, failing)).rejects.toThrow('quota');
    await expect(forgetResult(7, failing)).rejects.toThrow('quota');
  });
});

describe('the signal that a tab shows another page', () => {
  it('is a status "loading" (Chrome: navigation, reload, back, pushState, fragment)', () => {
    expect(startsNewPage({ status: 'loading' })).toBe(true);
    expect(startsNewPage({ status: 'loading', url: 'https://example.com/a' })).toBe(true);
  });

  it('is a new address even when the status is "complete" (Firefox: pushState, fragment)', () => {
    expect(startsNewPage({ status: 'complete', url: 'https://example.com/a#x' })).toBe(true);
    expect(startsNewPage({ url: 'https://example.com/a#x' })).toBe(true);
  });

  it('is not the end of a load, a title or an icon change', () => {
    expect(startsNewPage({ status: 'complete' })).toBe(false);
    expect(startsNewPage({})).toBe(false);
  });
});
