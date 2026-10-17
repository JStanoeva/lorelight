import { useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import ProjectWorkspace from "../../projects/components/ProjectWorkspace.jsx";
import { useProject } from "../../projects/hooks/useProject.js";
import { withoutFolder, withSavedFolder } from "../../projects/utils/projectContents.js";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import NotFoundState from "../../../shared/components/NotFoundState.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import LoreArticle from "../components/LoreArticle.jsx";
import { useLoreEntry } from "../hooks/useLoreEntry.js";

export default function LoreDetailsPage() {
  const { entryId } = useParams();
  const { user } = useAuth();
  const { entry, isLoading, error, refetch } = useLoreEntry(entryId);

  // The sidebar shows the project of the last entry that loaded. While the next entry loads,
  // `entry` is null but this id stays the same, so useProject keeps its data and the sidebar stays
  // on screen. Updating state during render when a value changes is React's documented way to do
  // this without an effect: React renders again at once, before anything reaches the screen.
  const [projectId, setProjectId] = useState(null);
  if (entry && entry.project_id !== projectId) {
    setProjectId(entry.project_id);
  }

  const {
    project,
    entries,
    folders,
    isLoading: isProjectLoading,
    error: projectError,
    refetch: refetchProject,
    updateData,
  } = useProject(projectId);

  // Folder changes made in the sidebar update the loaded data at once, without reloading
  function handleFolderSaved(savedFolder) {
    updateData((data) => withSavedFolder(data, savedFolder));
  }

  function handleFolderDeleted(folderId) {
    updateData((data) => withoutFolder(data, folderId));
  }

  let content;

  if (isLoading) {
    content = <Loader label="Loading the lore entry…" />;
  } else if (error) {
    content = <ErrorMessage message={getErrorMessage(error)} onRetry={refetch} />;
  } else if (!entry) {
    // Invalid id, a deleted entry, someone else's private entry, or one inside a private project
    content = <NotFoundState title="Lore not found" text="This entry doesn't exist, or it's private." />;
  } else {
    // The folder comes from the sidebar's list, so renaming or deleting it there shows here at once.
    // Without the sidebar (its project failed to load), the copy loaded with the entry is used.
    const folder = project ? folders.find((item) => item.id === entry.folder_id) : entry.folder;
    content = (
      <LoreArticle entry={entry} folderName={folder?.name ?? null} isOwner={user?.id === entry.author_id} />
    );
  }

  // The entry is here, but its project (for the sidebar) is still loading
  if (entry && isProjectLoading) {
    return (
      <section className="page">
        <Loader label="Loading the lore entry…" />
      </section>
    );
  }

  // The project's workspace: the sidebar, and beside it the entry (or the loader of the next one)
  if (project && (entry || isLoading)) {
    return (
      <ProjectWorkspace
        project={project}
        folders={folders}
        entries={entries}
        isOwner={user?.id === project.owner_id}
        // While the next entry loads, its row in the sidebar is already highlighted
        activeEntryId={entry?.id ?? entryId}
        onFolderSaved={handleFolderSaved}
        onFolderDeleted={handleFolderDeleted}
      >
        {content}
      </ProjectWorkspace>
    );
  }

  // No sidebar: the first load, an error, "not found", or an entry whose project failed to load
  return (
    <section className="page">
      {entry && projectError && (
        <div className="mb-6">
          <ErrorMessage
            message={`The project's contents couldn't be loaded. ${getErrorMessage(projectError)}`}
            onRetry={refetchProject}
          />
        </div>
      )}
      {content}
    </section>
  );
}
