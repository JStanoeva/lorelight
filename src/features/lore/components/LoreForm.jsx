import { useId, useState } from "react";
import { flushSync } from "react-dom";
import { Link } from "react-router";
import { useFolders } from "../../projects/hooks/useFolders.js";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import FormField from "../../../shared/components/FormField.jsx";
import SubmitButton from "../../../shared/components/SubmitButton.jsx";
import { useForm } from "../../../shared/hooks/useForm.js";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import { countCharacters } from "../../../shared/utils/validators.js";
import { LORE_CATEGORIES } from "../constants/categories.js";
import {
  FOLDER_GONE_MESSAGE,
  LORE_DESCRIPTION_MAX,
  LORE_DESCRIPTION_MIN,
  toLorePayload,
  validateLore,
} from "../utils/loreValidation.js";
import TagsField from "./TagsField.jsx";

// onSubmit(payload) saves and navigates away, or returns a message for the form to show.
export default function LoreForm({
  initialValues,
  projects,
  currentFolder = null,
  submitLabel,
  pendingLabel,
  cancelTo,
  onSubmit,
}) {
  const projectIds = projects.map((project) => project.id);
  const { values, getShownError, handleChange, handleBlur, setValue, validateBeforeSubmit } = useForm(
    initialValues,
    (currentValues) => validateLore(currentValues, projectIds),
  );
  const {
    folders,
    isLoading: isLoadingFolders,
    error: foldersError,
    refetch: refetchFolders,
  } = useFolders(values.project_id);
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const publicId = useId();
  const publicHintId = useId();

  // Going back to the starting project restores its folder, so switching away and back
  // (e.g. with the arrow keys) doesn't quietly take the entry out of its folder.
  function handleProjectChange(event) {
    handleChange(event);
    const isStartingProject = event.target.value === initialValues.project_id;
    setValue("folder_id", isStartingProject ? initialValues.folder_id : "");
  }

  // Leaving a field can show its error and push the checkbox and Cancel down before mouse-up,
  // losing the click. Left button only, so a middle-click on Cancel still opens a new tab.
  function handleMouseDown(event) {
    if (event.button === 0) {
      event.preventDefault();
    }
  }

  // The button disappears while reloading, so focus moves to the select instead of the page body
  function handleRetryFolders(event) {
    event.currentTarget.form.elements.namedItem("folder_id").focus();
    refetchFolders();
  }

  // The disabled submit button lost focus, so it returns to the form. focus() doesn't scroll when
  // the field already has focus, so the alert is scrolled to; flushSync renders it first.
  function showServerError(form, message) {
    // The user left the page while the request was running
    if (!form.isConnected) {
      return;
    }

    flushSync(() => {
      setServerError(message);
      setFailedAttempts((count) => count + 1);
      setIsPending(false);
    });
    const fieldName = message === FOLDER_GONE_MESSAGE ? "folder_id" : "project_id";
    form.elements.namedItem(fieldName).focus({ preventScroll: true });
    form.querySelector('[role="alert"]').scrollIntoView({ block: "nearest" });
  }

  // Edit only: if the folders can't be loaded, still offer the entry's folder so saving keeps it.
  // If that folder was deleted meanwhile, the database rejects it (23503).
  const canKeepCurrentFolder =
    Boolean(foldersError && currentFolder) && values.project_id === initialValues.project_id;
  const folderOptions = canKeepCurrentFolder ? [currentFolder] : folders;

  // An unlisted folder (another project's ?folderId=, or deleted) shows as "No folder" and isn't
  // saved. While the folders load, the choice is kept so a quick submit doesn't lose it.
  const isFolderListed = folderOptions.some((folder) => folder.id === values.folder_id);
  const folderId = isLoadingFolders || isFolderListed ? values.folder_id : "";

  async function handleSubmit(event) {
    event.preventDefault();
    // Saved now: after the await, event.currentTarget is already null
    const form = event.currentTarget;

    if (isPending || !validateBeforeSubmit(form)) {
      return;
    }

    setIsPending(true);

    try {
      const message = await onSubmit(toLorePayload({ ...values, folder_id: folderId }));
      if (message) {
        // Cleared so the select shows "No folder" even if the folders can't be loaded again
        if (message === FOLDER_GONE_MESSAGE) {
          setValue("folder_id", "");
          refetchFolders();
        }
        showServerError(form, message);
      }
    } catch (error) {
      showServerError(form, getErrorMessage(error));
    }
  }

  const sortedProjects = [...projects].sort((a, b) =>
    a.title.localeCompare(b.title, "en", { sensitivity: "base" }),
  );
  const descriptionLength = countCharacters(values.description.trim());

  // Always one line under the Folder select, so the fields below don't jump while the folders load
  let folderHint = "Only this project's folders are listed.";
  if (!values.project_id) {
    folderHint = "Choose a project first.";
  } else if (isLoadingFolders) {
    folderHint = "Loading this project's folders…";
  } else if (canKeepCurrentFolder) {
    folderHint = "We couldn't load this project's other folders. Try again, or keep this entry's folder.";
  } else if (foldersError) {
    folderHint = "We couldn't load this project's folders. Try again, or save the entry without one.";
  } else if (folders.length === 0) {
    folderHint = "This project has no folders yet.";
  }

  return (
    <form className="card flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
      {/* A new key per failure re-creates the alert, so a repeated message is announced again */}
      {serverError && <ErrorMessage key={failedAttempts} message={serverError} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          as="select"
          label="Project"
          name="project_id"
          value={values.project_id}
          onChange={handleProjectChange}
          onBlur={handleBlur}
          error={getShownError("project_id")}
        >
          <option value="">Choose a project</option>
          {sortedProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </FormField>

        {/* Not disabled while the folders load: a disabled select leaves the Tab order */}
        <div className="flex flex-col gap-2">
          <FormField
            as="select"
            label="Folder (optional)"
            name="folder_id"
            value={folderId}
            onChange={handleChange}
            disabled={!values.project_id}
            hint={folderHint}
          >
            {/* useFolders reports loading even without a project, hence the project check */}
            <option value="">{values.project_id && isLoadingFolders ? "Loading folders…" : "No folder"}</option>
            {folderOptions.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </FormField>
          {foldersError && (
            <button type="button" onClick={handleRetryFolders} className="btn btn-ghost self-start">
              Try again
            </button>
          )}
        </div>
      </div>

      <FormField
        label="Title"
        name="title"
        value={values.title}
        onChange={handleChange}
        onBlur={handleBlur}
        error={getShownError("title")}
        hint="3–100 characters."
        autoComplete="off"
      />

      <FormField
        as="select"
        label="Category"
        name="category"
        value={values.category}
        onChange={handleChange}
        onBlur={handleBlur}
        error={getShownError("category")}
      >
        <option value="">Choose a category</option>
        {LORE_CATEGORIES.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </FormField>

      <FormField
        as="textarea"
        label="Description"
        name="description"
        rows={8}
        value={values.description}
        onChange={handleChange}
        onBlur={handleBlur}
        error={getShownError("description")}
        hint={`At least ${LORE_DESCRIPTION_MIN} characters. ${descriptionLength.toLocaleString("en-US")} / ${LORE_DESCRIPTION_MAX.toLocaleString("en-US")} characters.`}
        className="resize-y"
      />

      <TagsField
        value={values.tagsText}
        onChange={handleChange}
        onBlur={handleBlur}
        error={getShownError("tagsText")}
      />

      <FormField
        label="Image link (optional)"
        name="image_url"
        type="url"
        inputMode="url"
        value={values.image_url}
        onChange={handleChange}
        onBlur={handleBlur}
        error={getShownError("image_url")}
        hint="A link to an image, starting with https://. Without one, your entry gets a generated image."
        autoComplete="off"
        spellCheck={false}
      />

      <div className="flex items-start gap-3">
        <input
          id={publicId}
          type="checkbox"
          name="is_public"
          checked={values.is_public}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          aria-describedby={publicHintId}
          className="mt-0.5 size-5 shrink-0 accent-gold-400"
        />
        <div className="flex flex-col gap-1">
          <label htmlFor={publicId} onMouseDown={handleMouseDown} className="label">
            Make this entry public
          </label>
          <p id={publicHintId} className="field-hint">
            Others can see a public entry only while its project is public too.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-night-700 pt-5">
        {/* Leaving can't stop a running request: the page would still open the saved entry */}
        {isPending ? (
          <button type="button" disabled className="btn btn-ghost">
            Cancel
          </button>
        ) : (
          <Link to={cancelTo} onMouseDown={handleMouseDown} className="btn btn-ghost">
            Cancel
          </Link>
        )}
        <SubmitButton isPending={isPending} label={submitLabel} pendingLabel={pendingLabel} />
      </div>
    </form>
  );
}
