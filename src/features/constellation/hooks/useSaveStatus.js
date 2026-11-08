import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useViewerKey } from "../../auth/hooks/useViewerKey.js";
import { constellationService } from "../services/constellationService.js";

export function useSaveStatus(loreId) {
  const viewerKey = useViewerKey();
  // Only the id: the user object is replaced on a token refresh, which mustn't cause a new request
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

    let isStale = false;

    constellationService.isSaved(loreId, userId).then(
      (data) => {
        if (!isStale) setResult({ key: requestKey, data, error: null });
      },
      (error) => {
        if (!isStale) setResult({ key: requestKey, data: false, error });
      },
    );

    return () => {
      isStale = true;
    };
  }, [loreId, userId, requestKey]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  // Applies an answer the database just accepted. Only this request key's answer changes, so a
  // click that finishes after the entry or viewer changed can't leak into the new answer.
  const setIsSaved = useCallback(
    (value) => setResult((current) => (current.key === requestKey ? { ...current, data: value } : current)),
    [requestKey],
  );

  // Loading is derived, so the effect never calls setState synchronously.
  const isLoading = !requestKey || result.key !== requestKey;

  return {
    isSaved: isLoading ? false : result.data,
    error: isLoading ? null : result.error,
    isLoading,
    refetch,
    setIsSaved,
  };
}
