import { useNavigate, useOutletContext } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { withoutEntry } from "../../projects/utils/projectContents.js";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import NotFoundState from "../../../shared/components/NotFoundState.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import LoreArticle from "../components/LoreArticle.jsx";

// One lore entry. ProjectWorkspaceLayout loads it (useLoreEntry with the URL's entryId) together with
// its project, and shows the project's sidebar beside this page.
export default function LoreDetailsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { entryState, projectState } = useOutletContext();
  const { entry, isLoading, error, refetch } = entryState;
  const {
    project,
    folders,
    isLoading: isProjectLoading,
    error: projectError,
    refetch: refetchProject,
    updateData,
  } = projectState;

  // Back on the project's page, the sidebar and the overview still show the contents loaded
  // earlier, so the deleted entry is taken out of them instead of loading everything again.
  // If they never loaded (an error), there's nothing to take it out of: they're loaded again.
  function handleDeleted() {
    if (project) {
      updateData((data) => withoutEntry(data, entry.id));
    } else {
      refetchProject();
    }
    navigate(`/projects/${entry.project_id}`);
  }

  if (isLoading) {
    return <Loader label="Loading the lore entry…" />;
  }

  if (error) {
    return <ErrorMessage message={getErrorMessage(error)} onRetry={refetch} />;
  }

  // Invalid id, a deleted entry, someone else's private entry, or one inside a private project
  if (!entry) {
    return <NotFoundState title="Lore not found" text="This entry doesn't exist, or it's private." />;
  }

  // The entry is here, but its project (for the sidebar) is still loading
  if (isProjectLoading) {
    return <Loader label="Loading the lore entry…" />;
  }

  // The folder comes from the sidebar's list, so renaming or deleting it there shows here at once.
  // Without the sidebar (its project failed to load), the copy loaded with the entry is used.
  const folder = project ? folders.find((item) => item.id === entry.folder_id) : entry.folder;

  return (
    <>
      {projectError && (
        <div className="mb-6">
          <ErrorMessage
            message={`The project's contents couldn't be loaded. ${getErrorMessage(projectError)}`}
            onRetry={refetchProject}
          />
        </div>
      )}
      <LoreArticle
        entry={entry}
        folderName={folder?.name ?? null}
        isOwner={user?.id === entry.author_id}
        onDeleted={handleDeleted}
      />
    </>
  );
}
