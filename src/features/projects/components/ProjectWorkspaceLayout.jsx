import { useState } from "react";
import { Outlet, useParams } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useLoreEntry } from "../../lore/hooks/useLoreEntry.js";
import { useRetryFocus } from "../../profile/hooks/useRetryFocus.js";
import { useProject } from "../hooks/useProject.js";
import { withoutFolder, withSavedFolder } from "../utils/projectContents.js";
import ProjectWorkspace from "./ProjectWorkspace.jsx";

// The layout route around Project Details and Lore Details. It loads the data both pages need and
// renders the project's sidebar here, once: while the user moves between the project's overview and
// its entries, only the page beside the sidebar changes, so the sidebar keeps its filter text, open
// folders and scroll position, and the project isn't loaded again (only the entry that opens is).
// The pages read the data with useOutletContext().
export default function ProjectWorkspaceLayout() {
  // A layout route also sees its child route's params: projectId on Project Details,
  // entryId on Lore Details
  const { projectId: routeProjectId, entryId } = useParams();
  const { user } = useAuth();
  // Ids typed into the URL may be uppercase, while the database returns them in lowercase
  const openEntryId = entryId?.toLowerCase();

  // The open entry. On Project Details entryId is undefined, and the service answers
  // "no entry" without sending a request.
  const entryState = useLoreEntry(entryId);
  const { entry } = entryState;

  // The project to load: the one in the URL, or the open entry's project. While the next entry
  // loads, `entry` is null but this id stays the same, so useProject keeps its data. Updating state
  // during render when a value changes is React's documented way to do this without an effect:
  // React renders again at once, before anything reaches the screen.
  const [projectId, setProjectId] = useState(null);
  const currentProjectId = (routeProjectId ?? entry?.project_id)?.toLowerCase();
  if (currentProjectId && currentProjectId !== projectId) {
    setProjectId(currentProjectId);
  }

  const projectState = useProject(projectId);
  const { project, entries, folders, updateData } = projectState;

  // Folder changes made in the sidebar update the loaded data at once, without reloading
  function handleFolderSaved(savedFolder) {
    updateData((data) => withSavedFolder(data, savedFolder));
  }

  function handleFolderDeleted(folderId) {
    updateData((data) => withoutFolder(data, folderId));
  }

  // The sidebar is shown only beside its own project's pages. On Project Details the loaded project
  // is the one in the URL. On Lore Details it's the entry's project, and while the entry loads (or if
  // it fails to load) the project the user came from, if it lists this entry.
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

  // Try again on Lore Details or Project Details moves focus to the page's heading once the entry
  // and the project have both loaded (or failed again). It lives here, not in the pages: when the
  // project loads, the sidebar appears around the page and the page mounts again, which would
  // forget that Try again was pressed. Project Details has no entry, so only its project reloads.
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
        // On Lore Details the entry's row is highlighted, already while the entry loads
        activeEntryId={entry?.id ?? openEntryId}
        onFolderSaved={handleFolderSaved}
        onFolderDeleted={handleFolderDeleted}
      >
        <Outlet context={outletContext} />
      </ProjectWorkspace>
    );
  }

  // No sidebar: while the project loads (the first visit, or another project), when it fails to
  // load or isn't found, or when it doesn't list the entry being opened
  return (
    <section className="page">
      <Outlet context={outletContext} />
    </section>
  );
}
