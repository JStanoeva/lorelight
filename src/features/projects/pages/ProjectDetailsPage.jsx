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
  const { projectState, retryFocus } = useOutletContext();
  const { project, entries, folders, isLoading, error } = projectState;
  // Try again moves focus to the page's heading (see ProjectWorkspaceLayout)
  const { headingRef, retry } = retryFocus;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (isLoading) {
    return <Loader label="Loading the project…" />;
  }

  // Without a project there's no title to show, so the page's h1 is visually hidden. Focus lands on
  // it after another failed Try again.
  if (error) {
    return (
      <>
        <PageTitle title="Project" />
        <h1 ref={headingRef} tabIndex={-1} className="sr-only">
          Project
        </h1>
        <ErrorMessage message={getErrorMessage(error)} onRetry={retry} />
      </>
    );
  }

  // Invalid id, a deleted project, or someone else's private project.
  // tabIndex -1: focus can land here after Try again.
  if (!project) {
    return (
      <div ref={headingRef} tabIndex={-1}>
        <NotFoundState title="Project not found" text="This project doesn't exist, or it's private." />
      </div>
    );
  }

  const isOwner = user?.id === project.owner_id;

  return (
    <>
      <PageTitle title={project.title} />
      <ProjectHeader
        headingRef={headingRef}
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
