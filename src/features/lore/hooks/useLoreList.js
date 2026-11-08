import { useCallback, useEffect, useState } from "react";
import { loreService } from "../services/loreService.js";

// Only public lore comes back, the same for every visitor, so the viewer isn't in the request key.
export function useLoreList({ q, category, sort, limit }) {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: [], error: null });

  // Plain values, not the filters object (new on every render). q comes last: the values before
  // it never contain "|", so two filter sets never share a key.
  const requestKey = `${category}|${sort}|${limit}|${reloadCount}|${q}`;

  useEffect(() => {
    let isStale = false;

    loreService.getPublicLore({ q, category, sort, limit }).then(
      (data) => {
        if (!isStale) setResult({ key: requestKey, data, error: null });
      },
      (error) => {
        if (!isStale) setResult({ key: requestKey, data: [], error });
      },
    );

    return () => {
      isStale = true;
    };
  }, [q, category, sort, limit, requestKey]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  // Loading is derived, so the effect never calls setState synchronously.
  const isLoading = result.key !== requestKey;

  return {
    entries: isLoading ? [] : result.data,
    // The last loaded entries, which the catalog keeps on screen while new filters load
    previousEntries: result.data,
    error: isLoading ? null : result.error,
    isLoading,
    refetch,
  };
}
