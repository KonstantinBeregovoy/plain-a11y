import { useEffect, useState } from 'react';
import { loadShowAaa, saveShowAaa } from './settings';

/** Whether the AAA block is expanded, restored from storage and saved on change. */
export function useShowAaa() {
  const [showAaa, setShowAaa] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadShowAaa()
      .then((saved) => {
        if (!cancelled) setShowAaa(saved);
      })
      .catch(() => {
        // Without saved settings the block stays expanded.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function changeShowAaa(value: boolean) {
    setShowAaa(value);
    saveShowAaa(value).catch(() => {
      // Saving failed: the choice simply will not be remembered.
    });
  }

  return { showAaa, changeShowAaa };
}
