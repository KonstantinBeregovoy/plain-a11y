import { ROLE_ORDER } from '../report/groupReport';
import type { Role } from '../dictionary/dictionary';

export type RoleFilter = Role | 'all';

/** Нужная часть storage.local: так её проще подменить в тесте. */
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
