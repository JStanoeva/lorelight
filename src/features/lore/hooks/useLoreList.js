import { useCallback, useEffect, useState } from "react";
import { loreService } from "../services/loreService.js";

// The catalog's entries for the given filters. Only public lore of public projects comes back,
// the same for every visitor, so the viewer isn't part of the request key.
export function useLoreList({ q, category, sort, limit }) {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: [], error: null });

  // A new key means "a new request is needed": other filters or a refetch(). The key is built
  // from plain values, not the filters object (a new object every render would refetch forever).
  // q comes last: the values before it never contain "|", so two filter sets never share a key.
  const requestKey = `${category}|${sort}|${limit}|${reloadCount}|${q}`;

  useEffect(() => {
    // Mount / update: fetch whenever the key changes.
    let isStale = false;

    loreService.getPublicLore({ q, category, sort, limit }).then(
      (data) => {
        if (!isStale) setResult({ key: requestKey, data, error: null });
      },
      (error) => {
        if (!isStale) setResult({ key: requestKey, data: [], error });
      },
    );

    // Unmount / before the next fetch: ignore this request's late response.
    return () => {
      isStale = true;
    };
  }, [q, category, sort, limit, requestKey]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  // Loading is derived, so the effect never calls setState synchronously.
  const isLoading = result.key !== requestKey;

  return {
    entries: isLoading ? [] : result.data,
    // The last loaded entries ([] at first and after an error): the catalog keeps them on screen
    // while new filters load
    previousEntries: result.data,
    error: isLoading ? null : result.error,
    isLoading,
    refetch,
  };
}
