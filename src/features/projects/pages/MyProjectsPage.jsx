import { Link } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import EmptyState from "../../../shared/components/EmptyState.jsx";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import ProjectCard from "../components/ProjectCard.jsx";
import { useProjects } from "../hooks/useProjects.js";
import "../styles/my-projects.css";

export default function MyProjectsPage() {
  const { user } = useAuth();
  const { projects, isLoading, error, refetch } = useProjects(user.id);
  // The hero's New Project button appears together with the projects, never before them: while the
  // list loads, nobody knows yet whether there are any, and with none the empty state below has its
  // own "Create your first project" button. So the button never shows up just to vanish again.
  const hasProjects = !isLoading && !error && projects.length > 0;

  let content;

  if (isLoading) {
    content = <Loader label="Loading your projects…" />;
  } else if (error) {
    content = <ErrorMessage message={getErrorMessage(error)} onRetry={refetch} />;
  } else if (!hasProjects) {
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

  // The top matches the Lore Catalog's and My Constellation's (.page-hero), so the title stays in
  // place when switching between the three pages in the header
  return (
    <div className="my-projects-page">
      <div className="my-projects-sky" aria-hidden="true" />

      <section className="page-hero" aria-labelledby="my-projects-title">
        <div className="my-projects-hero-content site-column">
          <p className="page-hero-eyebrow">The worlds you&apos;re building</p>
          <h1 id="my-projects-title" className="page-hero-title">
            My Projects
          </h1>
          {hasProjects && (
            <Link to="/projects/create" className="btn btn-primary my-projects-new">
              New Project
            </Link>
          )}
        </div>
      </section>

      <div className="my-projects-list site-column">{content}</div>
    </div>
  );
}
