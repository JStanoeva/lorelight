import { Link } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import EmptyState from "../../../shared/components/EmptyState.jsx";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import ProjectCard from "../components/ProjectCard.jsx";
import { useProjects } from "../hooks/useProjects.js";

export default function MyProjectsPage() {
  const { user } = useAuth();
  const { projects, isLoading, error, refetch } = useProjects(user.id);

  let content;

  if (isLoading) {
    content = <Loader label="Loading your projects…" />;
  } else if (error) {
    content = <ErrorMessage message={getErrorMessage(error)} onRetry={refetch} />;
  } else if (projects.length === 0) {
    content = (
      <EmptyState
        title="You don't have any projects yet"
        text="A project holds the lore of one world: its characters, places, factions and history. Create your first one to start writing."
      >
        <Link to="/projects/create" className="btn btn-primary">
          Create your first project
        </Link>
      </EmptyState>
    );
  } else {
    content = (
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <li key={project.id}>
            <ProjectCard project={project} showVisibility />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title">My Projects</h1>
        <Link to="/projects/create" className="btn btn-primary">
          New Project
        </Link>
      </div>

      <div className="mt-8">{content}</div>
    </section>
  );
}
