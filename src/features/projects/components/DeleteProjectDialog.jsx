import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import ConfirmDialog from "../../../shared/components/ConfirmDialog.jsx";
import FormField from "../../../shared/components/FormField.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import { useProjects } from "../hooks/useProjects.js";
import { projectService } from "../services/projectService.js";

function formatEntryCount(count) {
  return count === 1 ? "1 lore entry" : `${count} lore entries`;
}

// Rendered only while open, and only for the owner. `entryCount` is the number of entries in the
// project; `onDeleted` runs after a successful delete (the page then navigates to My Projects).
export default function DeleteProjectDialog({ project, entryCount, onCancel, onDeleted }) {
  // The owner's other projects are the places the lore can move to
  const { projects, isLoading: isLoadingProjects, error: projectsError } = useProjects(project.owner_id);
  const [choice, setChoice] = useState("delete");
  const [targetId, setTargetId] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  // Delete was pressed while "Move" had no project chosen. The select's error is derived from it,
  // so it goes away as soon as a project is chosen.
  const [hasMissedTarget, setHasMissedTarget] = useState(false);
  const selectRef = useRef(null);

  // Lore can only move to another of the user's own projects
  const otherProjects = projects.filter((item) => item.id !== project.id);
  const canMove = entryCount > 0 && otherProjects.length > 0;
  const isMoving = canMove && choice === "move";
  // Until the other projects have loaded, the "move" choice can't be offered yet, so the
  // destructive button waits instead of making "delete with the lore" the only option
  const isCheckingProjects = entryCount > 0 && isLoadingProjects;

  async function handleConfirm() {
    // Like every other form: the error appears under the field it's about, and focus moves there.
    // flushSync renders the error first, so the screen reader reads it together with the field.
    if (isMoving && !targetId) {
      flushSync(() => setHasMissedTarget(true));
      selectRef.current.focus();
      return;
    }

    setIsPending(true);
    setError("");

    try {
      const deleted = isMoving
        ? await projectService.moveLoreAndDeleteProject(project.id, targetId)
        : await projectService.deleteProject(project.id);

      if (!deleted) {
        setError("This project no longer exists. It may have been deleted already.");
        setIsPending(false);
        return;
      }

      onDeleted();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setIsPending(false);
    }
  }

  return (
    <ConfirmDialog
      isOpen
      title={`Delete "${project.title}"?`}
      error={error}
      confirmLabel="Delete project"
      pendingLabel={isMoving ? "Moving lore and deleting…" : "Deleting…"}
      isPending={isPending}
      isConfirmDisabled={isCheckingProjects}
      onConfirm={handleConfirm}
      onCancel={onCancel}
    >
      {entryCount === 0 ? (
        <p>This project has no lore yet. Deleting it can't be undone.</p>
      ) : (
        <fieldset className="flex flex-col gap-3" disabled={isPending}>
          <legend className="mb-1">
            This project has {formatEntryCount(entryCount)}. What should happen to the lore?
          </legend>

          <label className="flex items-start gap-3">
            <input
              type="radio"
              name="delete-choice"
              value="delete"
              checked={!isMoving}
              onChange={(event) => setChoice(event.target.value)}
              className="mt-1 accent-gold-400"
            />
            <span>Delete it with the project. Its appreciations and Constellation saves go too.</span>
          </label>

          {canMove && (
            <label className="flex items-start gap-3">
              <input
                type="radio"
                name="delete-choice"
                value="move"
                checked={isMoving}
                onChange={(event) => setChoice(event.target.value)}
                className="mt-1 accent-gold-400"
              />
              <span>Move it to another of my projects first, then delete this one.</span>
            </label>
          )}

          {isMoving && (
            // FormField passes the ref on to the <select> (in React 19, ref is a normal prop)
            <FormField
              as="select"
              ref={selectRef}
              label="Move the lore to"
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
              hint="Moved entries arrive outside any folder."
              error={hasMissedTarget && !targetId ? "Choose the project that should receive the lore." : undefined}
            >
              <option value="">Choose a project</option>
              {otherProjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </FormField>
          )}

          {isCheckingProjects && (
            <p className="field-hint" role="status">
              Checking your other projects…
            </p>
          )}

          {!canMove && !isLoadingProjects && (
            <p className="field-hint">
              {projectsError
                ? "Your other projects couldn't be loaded, so moving the lore isn't available right now."
                : "To keep this lore, create another project first and move the lore there."}
            </p>
          )}
        </fieldset>
      )}
    </ConfirmDialog>
  );
}
