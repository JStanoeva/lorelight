import { useCallback, useEffect, useState } from "react";
import { useViewerKey } from "../../auth/hooks/useViewerKey.js";
import { loreService } from "../../lore/services/loreService.js";
import { folderService } from "../services/folderService.js";
import { projectService } from "../services/projectService.js";

const EMPTY_RESULT = { project: null, entries: [], folders: [] };

export function useProject(projectId) {
  const viewerKey = useViewerKey();
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: EMPTY_RESULT, error: null });

  // A new key means a new request; no key while the session is still being read
  const requestKey = viewerKey && `${projectId}|${viewerKey}|${reloadCount}`;

  useEffect(() => {
    if (!requestKey) {
      return;
    }

    let isStale = false;

    Promise.all([
      projectService.getProjectById(projectId),
      loreService.getLoreByProject(projectId),
      folderService.getFoldersByProject(projectId),
    ]).then(
      ([project, entries, folders]) => {
        // A missing or hidden project means "not found", whatever the other requests returned
        const data = project ? { project, entries, folders } : EMPTY_RESULT;
        if (!isStale) setResult({ key: requestKey, data, error: null });
      },
      (error) => {
        if (!isStale) setResult({ key: requestKey, data: EMPTY_RESULT, error });
      },
    );

    return () => {
      isStale = true;
    };
  }, [projectId, requestKey]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  // Applies a just-saved change without reloading, only for the current key, so a save that
  // finishes after the viewer or project changed can't touch the newly loaded data
  const updateData = useCallback(
    (updater) =>
      setResult((current) => (current.key === requestKey ? { ...current, data: updater(current.data) } : current)),
    [requestKey],
  );

  // Loading is derived, so the effect never calls setState synchronously.
  const isLoading = !requestKey || result.key !== requestKey;
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
