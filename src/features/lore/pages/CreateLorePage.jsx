import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useProjects } from "../../projects/hooks/useProjects.js";
import EmptyState from "../../../shared/components/EmptyState.jsx";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import LoreForm from "../components/LoreForm.jsx";
import { loreService } from "../services/loreService.js";
import { EMPTY_LORE_VALUES, FOLDER_GONE_MESSAGE } from "../utils/loreValidation.js";

// Readable messages for the two errors this form can run into, everything else as usual
function getCreateErrorMessage(error) {
  // 23503: the chosen folder was deleted after the form loaded it
  if (error?.code === "23503") {
    return FOLDER_GONE_MESSAGE;
  }
  // 42501: the database only accepts lore in the user's own projects (e.g. one deleted meanwhile)
  if (error?.code === "42501") {
    return "You can only add lore to your own projects. Choose one of them and try again.";
  }
  return getErrorMessage(error);
}

export default function CreateLorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projects, isLoading, error, refetch } = useProjects(user.id);

  // "Add Lore", the sidebar's "New lore entry" and a folder's "New lore entry here" link here
  // through getNewEntryPath (?projectId=…&folderId=…). The project is used only if it is one of
  // the user's own. Database ids are lowercase, so lowercasing lets a hand-typed uppercase id match.
  const projectIdParam = searchParams.get("projectId")?.toLowerCase();
  const folderIdParam = searchParams.get("folderId")?.toLowerCase();
  const projectFromUrl = projects.find((project) => project.id === projectIdParam);

  let initialValues = EMPTY_LORE_VALUES;
  if (projectFromUrl) {
    // The form drops the folder by itself if it isn't one of this project's folders
    initialValues = {
      ...EMPTY_LORE_VALUES,
      project_id: projectFromUrl.id,
      folder_id: folderIdParam ?? "",
    };
  } else if (projects.length === 1) {
    // Only one project: there is nothing to choose
    initialValues = { ...EMPTY_LORE_VALUES, project_id: projects[0].id };
  }

  async function handleCreate(payload) {
    try {
      const entry = await loreService.createLore(payload, user.id);
      navigate(`/lore/${entry.id}`);
    } catch (createError) {
      return getCreateErrorMessage(createError);
    }
  }

  let content;

  if (isLoading) {
    content = <Loader label="Loading your projects…" />;
  } else if (error) {
    content = <ErrorMessage message={getErrorMessage(error)} onRetry={refetch} />;
  } else if (projects.length === 0) {
    content = (
      <EmptyState
        title="Create a project first"
        text="Every lore entry belongs to a project, the world it is part of. Create your first project, then add its lore."
      >
        <Link to="/projects/create" className="btn btn-primary">
          Create a project
        </Link>
      </EmptyState>
    );
  } else {
    content = (
      // The form reads initialValues only when it mounts. A different ?projectId or ?folderId
      // gives a new key, so the form starts fresh (e.g. the header's Create Lore link from
      // /lore/create?projectId=…); on a plain /lore/create the key stays the same
      <LoreForm
        key={searchParams.toString()}
        initialValues={initialValues}
        projects={projects}
        submitLabel="Create entry"
        pendingLabel="Creating entry…"
        cancelTo={projectFromUrl ? `/projects/${projectFromUrl.id}` : "/projects"}
        onSubmit={handleCreate}
      />
    );
  }

  return (
    <section className="page">
      <div className="mx-auto max-w-2xl">
        <h1 className="page-title">Create Lore</h1>
        <p className="mt-2 text-parchment-300">
          A lore entry is one piece of your world: a character, a place, a legend. It starts private: only you
          can see it until you make it public.
        </p>

        <div className="mt-8">{content}</div>
      </div>
    </section>
  );
}
