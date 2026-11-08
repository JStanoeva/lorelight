import { useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useProjects } from "../../projects/hooks/useProjects.js";
import EmptyState from "../../../shared/components/EmptyState.jsx";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import PageTitle from "../../../shared/components/PageTitle.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import LoreForm from "../components/LoreForm.jsx";
import { loreService } from "../services/loreService.js";
import { EMPTY_LORE_VALUES, getLoreSaveErrorMessage } from "../utils/loreValidation.js";

export default function CreateLorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projects, isLoading, error, refetch } = useProjects(user.id);
  const headingRef = useRef(null);

  // Database ids are lowercase, so lowercasing lets a hand-typed uppercase id match
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
    initialValues = { ...EMPTY_LORE_VALUES, project_id: projects[0].id };
  }

  async function handleCreate(payload) {
    try {
      const entry = await loreService.createLore(payload, user.id);
      navigate(`/lore/${entry.id}`);
    } catch (createError) {
      return getLoreSaveErrorMessage(createError);
    }
  }

  // Try again disappears when pressed, so focus moves to the heading, which stays
  function handleRetry() {
    refetch();
    headingRef.current.focus();
  }

  let content;

  if (isLoading) {
    content = <Loader label="Loading your projects…" />;
  } else if (error) {
    content = <ErrorMessage message={getErrorMessage(error)} onRetry={handleRetry} />;
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
      // The form reads initialValues only when it mounts, so a different ?projectId or ?folderId
      // gives a new key and a fresh form
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
      <PageTitle title="Create Lore" />
      <div className="mx-auto max-w-2xl">
        <h1 ref={headingRef} tabIndex={-1} className="page-title">
          Create Lore
        </h1>
        <p className="mt-2 text-parchment-300">
          A lore entry is one piece of your world: a character, a place, a legend. It starts private: only you
          can see it until you make it public.
        </p>

        <div className="mt-8">{content}</div>
      </div>
    </section>
  );
}
