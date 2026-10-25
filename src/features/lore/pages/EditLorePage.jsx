import { useRef } from "react";
import { useNavigate, useParams } from "react-router";
import OwnerGuard from "../../auth/guards/OwnerGuard.jsx";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useProjects } from "../../projects/hooks/useProjects.js";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import NotFoundState from "../../../shared/components/NotFoundState.jsx";
import PageTitle from "../../../shared/components/PageTitle.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import LoreForm from "../components/LoreForm.jsx";
import { useLoreEntry } from "../hooks/useLoreEntry.js";
import { loreService } from "../services/loreService.js";
import { getLoreSaveErrorMessage, toLoreFormValues } from "../utils/loreValidation.js";

export default function EditLorePage() {
  const { entryId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { entry, isLoading, error, refetch } = useLoreEntry(entryId);
  // The project select lists the user's own projects: changing it moves the entry
  const {
    projects,
    isLoading: isLoadingProjects,
    error: projectsError,
    refetch: refetchProjects,
  } = useProjects(user.id);
  const headingRef = useRef(null);

  async function handleSave(payload) {
    try {
      const updated = await loreService.updateLore(entry.id, payload);

      // No row was updated: the entry was deleted meanwhile (e.g. in another tab)
      if (!updated) {
        return "This entry no longer exists. It may have been deleted.";
      }

      navigate(`/lore/${entry.id}`);
    } catch (saveError) {
      return getLoreSaveErrorMessage(saveError);
    }
  }

  // Try again disappears as soon as it's pressed, so focus moves to the page heading (h1), which stays
  function handleRetry() {
    refetch();
    headingRef.current.focus();
  }

  function handleRetryProjects() {
    refetchProjects();
    headingRef.current.focus();
  }

  if (!isLoading && !error && !entry) {
    return (
      <section className="page">
        <NotFoundState title="Lore not found" text="This entry doesn't exist, or it's private." />
      </section>
    );
  }

  let content;

  if (isLoading) {
    content = <Loader label="Loading the lore entry…" />;
  } else if (error) {
    content = <ErrorMessage message={getErrorMessage(error)} onRetry={handleRetry} />;
  } else {
    let formContent;

    if (isLoadingProjects) {
      formContent = <Loader label="Loading your projects…" />;
    } else if (projectsError) {
      formContent = <ErrorMessage message={getErrorMessage(projectsError)} onRetry={handleRetryProjects} />;
    } else {
      formContent = (
        <>
          <p className="mb-8 text-parchment-300 wrap-anywhere">
            Editing <span className="font-semibold text-parchment-100">{entry.title}</span>
          </p>
          <LoreForm
            key={entry.id}
            initialValues={toLoreFormValues(entry)}
            projects={projects}
            currentFolder={entry.folder}
            submitLabel="Save changes"
            pendingLabel="Saving changes…"
            cancelTo={`/lore/${entry.id}`}
            onSubmit={handleSave}
          />
        </>
      );
    }

    content = (
      // Only the author may edit; anyone else is sent to the entry's details page
      <OwnerGuard ownerId={entry.author_id} redirectTo={`/lore/${entry.id}`}>
        {formContent}
      </OwnerGuard>
    );
  }

  return (
    <section className="page">
      <PageTitle title="Edit Lore" />
      <div className="mx-auto max-w-2xl">
        {/* tabIndex -1: it can take focus from code (after Try again), but isn't a Tab stop */}
        <h1 ref={headingRef} tabIndex={-1} className="page-title">
          Edit Lore
        </h1>
        <div className="mt-2">{content}</div>
      </div>
    </section>
  );
}
