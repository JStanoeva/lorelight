import { useCallback, useEffect, useState } from "react";
import { appreciationService } from "../../appreciation/services/appreciationService.js";
import { useViewerKey } from "../../auth/hooks/useViewerKey.js";
import { constellationService } from "../../constellation/services/constellationService.js";
import { loreService } from "../../lore/services/loreService.js";
import { projectService } from "../../projects/services/projectService.js";
import { profileService } from "../services/profileService.js";

const EMPTY_RESULT = { profile: null, projects: [], lore: [], constellation: [], appreciated: [] };

// A Creator Profile: the profile and its four collections (projects, lore, Constellation saves and
// appreciated lore), loaded at the same time. Row Level Security gives the owner all of their
// projects and lore and visitors only the public ones, so the viewer is part of the request key.
// Each list is loaded in full: the profile shows the three newest, the "All …" pages the rest.
export function useProfile(userId) {
  const viewerKey = useViewerKey();
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: EMPTY_RESULT, error: null });

  // A new key means "a new request is needed": a different profile, a different viewer or a
  // refetch(). No key while the session is still being read, so nothing loads for the wrong viewer.
  const requestKey = viewerKey && `${userId}|${viewerKey}|${reloadCount}`;

  useEffect(() => {
    if (!requestKey) {
      return;
    }

    // Mount / update: load the profile and its collections at the same time. If any request
    // fails, the whole profile shows the error (one Try again loads everything again).
    let isStale = false;

    Promise.all([
      profileService.getProfileById(userId),
      projectService.getProjectsByOwner(userId),
      loreService.getLoreByAuthor(userId),
      constellationService.getConstellation(userId),
      appreciationService.getAppreciatedLore(userId),
    ]).then(
      ([profile, projects, lore, constellation, appreciated]) => {
        // A missing profile means "not found", whatever the other requests returned.
        const data = profile ? { profile, projects, lore, constellation, appreciated } : EMPTY_RESULT;
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
  }, [userId, requestKey]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  // Loading is derived, so the effect never calls setState synchronously.
  const isLoading = !requestKey || result.key !== requestKey;
  const data = isLoading ? EMPTY_RESULT : result.data;

  return {
    profile: data.profile,
    projects: data.projects,
    lore: data.lore,
    constellation: data.constellation,
    appreciated: data.appreciated,
    error: isLoading ? null : result.error,
    isLoading,
    refetch,
  };
}
