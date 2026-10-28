import { useEffect, useState } from 'react';
import { loadRoleFilter, saveRoleFilter, type RoleFilter } from './settings';

/** The selected role filter, restored from storage and saved on change. */
export function useRoleFilter() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  useEffect(() => {
    let cancelled = false;
    loadRoleFilter()
      .then((saved) => {
        if (!cancelled) setRoleFilter(saved);
      })
      .catch(() => {
        // Without saved settings the filter stays on “All”.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function changeRoleFilter(value: RoleFilter) {
    setRoleFilter(value);
    saveRoleFilter(value).catch(() => {
      // Saving failed: the filter simply will not be remembered.
    });
  }

  return { roleFilter, changeRoleFilter };
}
