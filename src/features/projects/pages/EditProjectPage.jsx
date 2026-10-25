import { useRef } from "react";
import { useNavigate, useParams } from "react-router";
import OwnerGuard from "../../auth/guards/OwnerGuard.jsx";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import NotFoundState from "../../../shared/components/NotFoundState.jsx";
import PageTitle from "../../../shared/components/PageTitle.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import ProjectForm from "../components/ProjectForm.jsx";
import { useProject } from "../hooks/useProject.js";
import { projectService } from "../services/projectService.js";
import { toProjectFormValues } from "../utils/projectValidation.js";

export default function EditProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { project, isLoading, error, refetch } = useProject(projectId);
  const headingRef = useRef(null);

  async function handleSave(payload) {
    const updated = await projectService.updateProject(project.id, payload);

    // No row was updated: the project was deleted meanwhile (e.g. in another tab)
    if (!updated) {
      return "This project no longer exists. It may have been deleted.";
    }

    navigate(`/projects/${project.id}`);
  }

  // Try again disappears as soon as it's pressed, so focus moves to the page heading (h1), which stays
  function handleRetry() {
    refetch();
    headingRef.current.focus();
  }

  if (!isLoading && !error && !project) {
    return (
      <section className="page">
        <NotFoundState title="Project not found" text="This project doesn't exist, or it's private." />
      </section>
    );
  }

  let content;

  if (isLoading) {
    content = <Loader label="Loading the project…" />;
  } else if (error) {
    content = <ErrorMessage message={getErrorMessage(error)} onRetry={handleRetry} />;
  } else {
    content = (
      // Only the owner may edit; anyone else is sent to the project's details page
      <OwnerGuard ownerId={project.owner_id} redirectTo={`/projects/${project.id}`}>
        <p className="mb-8 text-parchment-300 wrap-anywhere">
          Editing <span className="font-semibold text-parchment-100">{project.title}</span>
        </p>
        <ProjectForm
          key={project.id}
          initialValues={toProjectFormValues(project)}
          submitLabel="Save changes"
          pendingLabel="Saving changes…"
          cancelTo={`/projects/${project.id}`}
          onSubmit={handleSave}
        />
      </OwnerGuard>
    );
  }

  return (
    <section className="page">
      <PageTitle title="Edit Project" />
      <div className="mx-auto max-w-2xl">
        {/* tabIndex -1: it can take focus from code (after Try again), but isn't a Tab stop */}
        <h1 ref={headingRef} tabIndex={-1} className="page-title">
          Edit Project
        </h1>
        <div className="mt-2">{content}</div>
      </div>
    </section>
  );
}
