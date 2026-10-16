import { useCallback, useEffect, useState } from "react";
import { loreService } from "../../lore/services/loreService.js";
import { projectService } from "../services/projectService.js";

const EMPTY_RESULT = { project: null, entries: [] };

export function useProject(projectId) {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: EMPTY_RESULT, error: null });

  // A new key means "a new request is needed": a different project or a refetch().
  const requestKey = `${projectId}|${reloadCount}`;

  useEffect(() => {
    // Mount / update: load the project and its lore at the same time.
    let isStale = false;

    Promise.all([
      projectService.getProjectById(projectId),
      loreService.getLoreByProject(projectId),
    ]).then(
      ([project, entries]) => {
        // A missing or hidden project means "not found", whatever the lore request returned.
        const data = project ? { project, entries } : EMPTY_RESULT;
        if (!isStale) setResult({ key: requestKey, data, error: null });
      },
      (error) => {
        if (!isStale) setResult({ key: requestKey, data: EMPTY_RESULT, error });
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
  const data = isLoading ? EMPTY_RESULT : result.data;

  return {
    project: data.project,
    entries: data.entries,
    error: isLoading ? null : result.error,
    isLoading,
    refetch,
  };
}
