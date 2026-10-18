import { useCallback, useEffect, useState } from "react";
import { useViewerKey } from "../../auth/hooks/useViewerKey.js";
import { folderService } from "../services/folderService.js";

// The folders of one project, sorted by name. Without a project (projectId is ""),
// the service returns an empty list without sending a request.
export function useFolders(projectId) {
  const viewerKey = useViewerKey();
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: [], error: null });

  // A new key means "a new request is needed": a different project, a different viewer or a
  // refetch(). No key while the session is still being read, so nothing loads for the wrong viewer.
  const requestKey = viewerKey && `${projectId}|${viewerKey}|${reloadCount}`;

  useEffect(() => {
    if (!requestKey) {
      return;
    }

    // Mount / update: fetch whenever the key changes.
    let isStale = false;

    folderService.getFoldersByProject(projectId).then(
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
  }, [projectId, requestKey]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  // Loading is derived, so the effect never calls setState synchronously.
  const isLoading = !requestKey || result.key !== requestKey;

  return {
    folders: isLoading ? [] : result.data,
    error: isLoading ? null : result.error,
    isLoading,
    refetch,
  };
}
