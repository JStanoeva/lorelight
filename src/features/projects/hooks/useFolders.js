import { useCallback, useEffect, useState } from "react";
import { folderService } from "../services/folderService.js";

// The folders of one project, sorted by name. Without a project (projectId is ""),
// the service returns an empty list without sending a request.
export function useFolders(projectId) {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: [], error: null });

  // A new key means "a new request is needed": a different project or a refetch().
  const requestKey = `${projectId}|${reloadCount}`;

  useEffect(() => {
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
  const isLoading = result.key !== requestKey;

  return {
    folders: isLoading ? [] : result.data,
    error: isLoading ? null : result.error,
    isLoading,
    refetch,
  };
}
