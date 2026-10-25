import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import NotFoundState from "../../../shared/components/NotFoundState.jsx";
import PageTitle from "../../../shared/components/PageTitle.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import DeleteProjectDialog from "../components/DeleteProjectDialog.jsx";
import ProjectHeader from "../components/ProjectHeader.jsx";
import ProjectLoreSection from "../components/ProjectLoreSection.jsx";

// The project's overview. ProjectWorkspaceLayout loads the project (useProject with the URL's
// projectId) and shows its sidebar beside this page.
export default function ProjectDetailsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projectState } = useOutletContext();
  const { project, entries, folders, isLoading, error, refetch } = projectState;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (isLoading) {
    return <Loader label="Loading the project…" />;
  }

  if (error) {
    return <ErrorMessage message={getErrorMessage(error)} onRetry={refetch} />;
  }

  // Invalid id, a deleted project, or someone else's private project
  if (!project) {
    return <NotFoundState title="Project not found" text="This project doesn't exist, or it's private." />;
  }

  const isOwner = user?.id === project.owner_id;

  return (
    <>
      <PageTitle title={project.title} />
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
    </>
  );
}
