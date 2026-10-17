import { useCallback, useEffect, useState } from "react";
import { loreService } from "../../lore/services/loreService.js";
import { folderService } from "../services/folderService.js";
import { projectService } from "../services/projectService.js";

const EMPTY_RESULT = { project: null, entries: [], folders: [] };

export function useProject(projectId) {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: EMPTY_RESULT, error: null });

  // A new key means "a new request is needed": a different project or a refetch().
  const requestKey = `${projectId}|${reloadCount}`;

  useEffect(() => {
    // Mount / update: load the project, its lore and its folders at the same time.
    let isStale = false;

    Promise.all([
      projectService.getProjectById(projectId),
      loreService.getLoreByProject(projectId),
      folderService.getFoldersByProject(projectId),
    ]).then(
      ([project, entries, folders]) => {
        // A missing or hidden project means "not found", whatever the other requests returned.
        const data = project ? { project, entries, folders } : EMPTY_RESULT;
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

  // Applies a change the page has just saved (e.g. a renamed folder) to the data it already has,
  // so the screen updates at once instead of reloading everything. `updater(data)` returns new data.
  const updateData = useCallback(
    (updater) => setResult((current) => ({ ...current, data: updater(current.data) })),
    [],
  );

  // Loading is derived, so the effect never calls setState synchronously.
  const isLoading = result.key !== requestKey;
  const data = isLoading ? EMPTY_RESULT : result.data;

  return {
    project: data.project,
    entries: data.entries,
    folders: data.folders,
    error: isLoading ? null : result.error,
    isLoading,
    refetch,
    updateData,
  };
}
