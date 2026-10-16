import { useNavigate } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import ProjectForm from "../components/ProjectForm.jsx";
import { projectService } from "../services/projectService.js";
import { EMPTY_PROJECT_VALUES } from "../utils/projectValidation.js";

export default function CreateProjectPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleCreate(payload) {
    const project = await projectService.createProject(payload, user.id);
    navigate(`/projects/${project.id}`);
  }

  return (
    <section className="page">
      <div className="mx-auto max-w-2xl">
        <h1 className="page-title">Create Project</h1>
        <p className="mt-2 text-parchment-300">
          A project holds the lore of one world. It starts private: only you can see it until you make it
          public.
        </p>

        <div className="mt-8">
          <ProjectForm
            initialValues={EMPTY_PROJECT_VALUES}
            submitLabel="Create project"
            pendingLabel="Creating project…"
            cancelTo="/projects"
            onSubmit={handleCreate}
          />
        </div>
      </div>
    </section>
  );
}
