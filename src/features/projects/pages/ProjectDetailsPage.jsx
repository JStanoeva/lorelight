import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import NotFoundState from "../../../shared/components/NotFoundState.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import DeleteProjectDialog from "../components/DeleteProjectDialog.jsx";
import ProjectHeader from "../components/ProjectHeader.jsx";
import ProjectLoreSection from "../components/ProjectLoreSection.jsx";
import ProjectWorkspace from "../components/ProjectWorkspace.jsx";
import { useProject } from "../hooks/useProject.js";
import { withoutFolder, withSavedFolder } from "../utils/projectContents.js";

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { project, entries, folders, isLoading, error, refetch, updateData } = useProject(projectId);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Folder changes made in the sidebar update the loaded data at once, without reloading
  function handleFolderSaved(savedFolder) {
    updateData((data) => withSavedFolder(data, savedFolder));
  }

  function handleFolderDeleted(folderId) {
    updateData((data) => withoutFolder(data, folderId));
  }

  if (isLoading) {
    return (
      <section className="page">
        <Loader label="Loading the project…" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <ErrorMessage message={getErrorMessage(error)} onRetry={refetch} />
      </section>
    );
  }

  // Invalid id, a deleted project, or someone else's private project
  if (!project) {
    return (
      <section className="page">
        <NotFoundState title="Project not found" text="This project doesn't exist, or it's private." />
      </section>
    );
  }

  const isOwner = user?.id === project.owner_id;

  return (
    <ProjectWorkspace
      project={project}
      folders={folders}
      entries={entries}
      isOwner={isOwner}
      onFolderSaved={handleFolderSaved}
      onFolderDeleted={handleFolderDeleted}
    >
      <ProjectHeader
        project={project}
        entryCount={entries.length}
        isOwner={isOwner}
        onDelete={() => setIsDeleteOpen(true)}
      />
      <ProjectLoreSection projectId={project.id} entries={entries} folders={folders} isOwner={isOwner} />

      {/* isOwner too: if the user logs out (e.g. in another tab) while it's open, it disappears */}
      {isOwner && isDeleteOpen && (
        <DeleteProjectDialog
          project={project}
          entryCount={entries.length}
          onCancel={() => setIsDeleteOpen(false)}
          onDeleted={() => navigate("/projects")}
        />
      )}
    </ProjectWorkspace>
  );
}
