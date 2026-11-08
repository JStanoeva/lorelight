import { useState } from "react";
import { Outlet, useParams } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useLoreEntry } from "../../lore/hooks/useLoreEntry.js";
import { useRetryFocus } from "../../profile/hooks/useRetryFocus.js";
import { useProject } from "../hooks/useProject.js";
import { withoutFolder, withSavedFolder } from "../utils/projectContents.js";
import ProjectWorkspace from "./ProjectWorkspace.jsx";

// Renders the sidebar once around Project and Lore Details, so it keeps its filter, open folders
// and scroll, and the project isn't reloaded; the pages read the data with useOutletContext()
export default function ProjectWorkspaceLayout() {
  // A layout route also sees its child route's params: projectId or entryId
  const { projectId: routeProjectId, entryId } = useParams();
  const { user } = useAuth();
  // Ids typed into the URL may be uppercase, while the database returns them in lowercase
  const openEntryId = entryId?.toLowerCase();

  // On Project Details entryId is undefined, and the service answers without a request
  const entryState = useLoreEntry(entryId);
  const { entry } = entryState;

  // Kept while the next entry loads (entry is null), so useProject keeps its data; set during
  // render, React's documented alternative to an effect
  const [projectId, setProjectId] = useState(null);
  const currentProjectId = (routeProjectId ?? entry?.project_id)?.toLowerCase();
  if (currentProjectId && currentProjectId !== projectId) {
    setProjectId(currentProjectId);
  }

  const projectState = useProject(projectId);
  const { project, entries, folders, updateData } = projectState;

  function handleFolderSaved(savedFolder) {
    updateData((data) => withSavedFolder(data, savedFolder));
  }

  function handleFolderDeleted(folderId) {
    updateData((data) => withoutFolder(data, folderId));
  }

  // While an entry loads (or fails), keep the previous project's sidebar only if it lists it
  let isWorkspaceShown = false;
  if (project) {
    if (routeProjectId) {
      isWorkspaceShown = true;
    } else if (entry) {
      isWorkspaceShown = entry.project_id === project.id;
    } else {
      isWorkspaceShown = entries.some((item) => item.id === openEntryId);
    }
  }

  // Lives here, not in the pages: a page remounts when the sidebar appears around it, which would
  // forget that Try again was pressed
  const retryFocus = useRetryFocus(
    entryState.isLoading || projectState.isLoading,
    entryId ? entryState.refetch : projectState.refetch,
  );

  const outletContext = { entryState, projectState, retryFocus };

  if (isWorkspaceShown) {
    return (
      <ProjectWorkspace
        project={project}
        folders={folders}
        entries={entries}
        isOwner={user?.id === project.owner_id}
        // openEntryId highlights the row while the entry is still loading
        activeEntryId={entry?.id ?? openEntryId}
        onFolderSaved={handleFolderSaved}
        onFolderDeleted={handleFolderDeleted}
      >
        <Outlet context={outletContext} />
      </ProjectWorkspace>
    );
  }

  return (
    <section className="page">
      <Outlet context={outletContext} />
    </section>
  );
}
