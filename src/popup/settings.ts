import { ROLE_ORDER } from '../report/groupReport';
import type { Role } from '../dictionary/dictionary';

export type RoleFilter = Role | 'all';

/** The part of storage.local we use: this makes it easy to fake in tests. */
export interface StorageArea {
  get(key: string): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
}

const ROLE_FILTER_KEY = 'roleFilter';

function isRoleFilter(value: unknown): value is RoleFilter {
  return (
    value === 'all' ||
    ROLE_ORDER.some((role) => role === value)
  );
}

export async function loadRoleFilter(
  area: StorageArea = browser.storage.local,
): Promise<RoleFilter> {
  const stored = await area.get(ROLE_FILTER_KEY);
  const value = stored[ROLE_FILTER_KEY];
  return isRoleFilter(value) ? value : 'all';
}

export async function saveRoleFilter(
  filter: RoleFilter,
  area: StorageArea = browser.storage.local,
): Promise<void> {
  await area.set({ [ROLE_FILTER_KEY]: filter });
}

const SHOW_AAA_KEY = 'showAaa';

/** Whether the “AAA recommendations” block is expanded. Shown unless the person hid it. */
export async function loadShowAaa(
  area: StorageArea = browser.storage.local,
): Promise<boolean> {
  const stored = await area.get(SHOW_AAA_KEY);
  const value = stored[SHOW_AAA_KEY];
  return typeof value === 'boolean' ? value : true;
}

export async function saveShowAaa(
  show: boolean,
  area: StorageArea = browser.storage.local,
): Promise<void> {
  await area.set({ [SHOW_AAA_KEY]: show });
}
