import { useNavigate, useOutletContext } from "react-router";
import { changeAppreciationCount } from "../../appreciation/utils/appreciationCount.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { withAppreciationChange, withoutEntry } from "../../projects/utils/projectContents.js";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import NotFoundState from "../../../shared/components/NotFoundState.jsx";
import PageTitle from "../../../shared/components/PageTitle.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import LoreArticle from "../components/LoreArticle.jsx";

// ProjectWorkspaceLayout loads the entry and its project and passes them as outlet context.
export default function LoreDetailsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { entryState, projectState, retryFocus } = useOutletContext();
  const { entry, isLoading, error, updateData: updateEntry } = entryState;
  const {
    project,
    folders,
    isLoading: isProjectLoading,
    error: projectError,
    refetch: refetchProject,
    updateData,
  } = projectState;
  const { headingRef, retry } = retryFocus;

  // The project's loaded contents drop the deleted entry instead of loading everything again.
  // If they never loaded (an error), there's nothing to take it out of, so they're loaded again.
  function handleDeleted() {
    if (project) {
      updateData((data) => withoutEntry(data, entry.id));
    } else {
      refetchProject();
    }
    navigate(`/projects/${entry.project_id}`);
  }

  // change is 1 (added) or -1 (removed). The project's loaded entries get it too, so the
  // overview's cards show the new number without loading the project again.
  function handleAppreciationChange(change) {
    updateEntry((current) => changeAppreciationCount(current, change));
    if (project) {
      updateData((data) => withAppreciationChange(data, entry.id, change));
    }
  }

  if (isLoading) {
    return <Loader label="Loading the lore entry…" />;
  }

  // No title without an entry, so the h1 is visually hidden; focus lands on it after Try again
  if (error) {
    return (
      <>
        <PageTitle title="Lore entry" />
        <h1 ref={headingRef} tabIndex={-1} className="sr-only">
          Lore entry
        </h1>
        <ErrorMessage message={getErrorMessage(error)} onRetry={retry} />
      </>
    );
  }

  if (!entry) {
    return (
      <div ref={headingRef} tabIndex={-1}>
        <NotFoundState title="Lore not found" text="This entry doesn't exist, or it's private." />
      </div>
    );
  }

  if (isProjectLoading) {
    return <Loader label="Loading the lore entry…" />;
  }

  // From the sidebar's list, so a rename or delete there shows here at once. Without the sidebar
  // (its project failed to load), the copy loaded with the entry is used.
  const folder = project ? folders.find((item) => item.id === entry.folder_id) : entry.folder;

  return (
    <>
      <PageTitle title={entry.title} />
      {projectError && (
        <div className="mb-6">
          <ErrorMessage
            message={`The project's contents couldn't be loaded. ${getErrorMessage(projectError)}`}
            onRetry={refetchProject}
          />
        </div>
      )}
      <LoreArticle
        headingRef={headingRef}
        entry={entry}
        folderName={folder?.name ?? null}
        isOwner={user?.id === entry.author_id}
        onDeleted={handleDeleted}
        onAppreciationChange={handleAppreciationChange}
      />
    </>
  );
}
