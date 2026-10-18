import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useViewerKey } from "../../auth/hooks/useViewerKey.js";
import { appreciationService } from "../services/appreciationService.js";

// Whether the logged-in user appreciates one lore entry. For guests the service answers false
// without sending a request.
export function useAppreciation(loreId) {
  const viewerKey = useViewerKey();
  // Only the id (a string): the user object may be replaced (e.g. after a token refresh) while
  // the id stays the same, and that mustn't cause a new request.
  const userId = useAuth().user?.id ?? null;
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: false, error: null });

  // A new key means "a new request is needed": a different entry, a different viewer or a
  // refetch(). No key while the session is still being read, so nothing loads for the wrong viewer.
  const requestKey = viewerKey && `${loreId}|${viewerKey}|${reloadCount}`;

  useEffect(() => {
    if (!requestKey) {
      return;
    }

    // Mount / update: fetch whenever the key changes.
    let isStale = false;

    appreciationService.hasAppreciated(loreId, userId).then(
      (data) => {
        if (!isStale) setResult({ key: requestKey, data, error: null });
      },
      (error) => {
        if (!isStale) setResult({ key: requestKey, data: false, error });
      },
    );

    // Unmount / before the next fetch: ignore this request's late response.
    return () => {
      isStale = true;
    };
  }, [loreId, userId, requestKey]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  // For the button: shows a click at once (and undoes it if the request fails) without asking the
  // database again. Only the answer of this request key is changed: a click that finishes after
  // the entry or the viewer changed (e.g. a logout in another tab) can't leak into the new answer.
  const setHasAppreciated = useCallback(
    (value) => setResult((current) => (current.key === requestKey ? { ...current, data: value } : current)),
    [requestKey],
  );

  // Loading is derived, so the effect never calls setState synchronously.
  const isLoading = !requestKey || result.key !== requestKey;

  return {
    hasAppreciated: isLoading ? false : result.data,
    error: isLoading ? null : result.error,
    isLoading,
    refetch,
    setHasAppreciated,
  };
}
