import { useRef } from "react";
import { Link } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import EmptyState from "../../../shared/components/EmptyState.jsx";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import PageTitle from "../../../shared/components/PageTitle.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import ProjectCard from "../components/ProjectCard.jsx";
import ProjectsLoading from "../components/ProjectsLoading.jsx";
import { useProjects } from "../hooks/useProjects.js";
import "../styles/my-projects.css";

export default function MyProjectsPage() {
  const { user } = useAuth();
  const { projects, isLoading, error, refetch } = useProjects(user.id);
  const headingRef = useRef(null);
  // The New Project button appears only with the projects, so it never shows up just to vanish;
  // the empty state has its own button
  const hasProjects = !isLoading && !error && projects.length > 0;

  // Try again disappears when pressed, so focus moves to the heading, which stays
  function handleRetry() {
    refetch();
    headingRef.current.focus();
  }

  let content;

  if (isLoading) {
    content = <ProjectsLoading />;
  } else if (error) {
    content = <ErrorMessage message={getErrorMessage(error)} onRetry={handleRetry} />;
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

  // .page-hero, like the Lore Catalog and My Constellation, so the title stays put between them
  return (
    <div className="my-projects-page">
      <PageTitle title="My Projects" />
      <div className="my-projects-sky" aria-hidden="true" />

      <section className="page-hero" aria-labelledby="my-projects-title">
        <div className="my-projects-hero-content site-column">
          <p className="page-hero-eyebrow">The worlds you&apos;re building</p>
          {/* tabIndex -1: it can take focus from code (after Try again), but isn't a Tab stop */}
          <h1 ref={headingRef} tabIndex={-1} id="my-projects-title" className="page-hero-title">
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
