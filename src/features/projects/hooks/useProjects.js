import { useCallback, useEffect, useState } from "react";
import { projectService } from "../services/projectService.js";

export function useProjects(ownerId) {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: [], error: null });

  // A new key (another owner or a refetch) means a new request
  const requestKey = `${ownerId}|${reloadCount}`;

  useEffect(() => {
    let isStale = false;

    projectService.getProjectsByOwner(ownerId).then(
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
  }, [ownerId, requestKey]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  // Loading is derived, so the effect never calls setState synchronously.
  const isLoading = result.key !== requestKey;

  return {
    projects: isLoading ? [] : result.data,
    error: isLoading ? null : result.error,
    isLoading,
    refetch,
  };
}
