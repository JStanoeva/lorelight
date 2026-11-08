import { useId, useState } from "react";
import { flushSync } from "react-dom";
import { Link } from "react-router";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import FormField from "../../../shared/components/FormField.jsx";
import SubmitButton from "../../../shared/components/SubmitButton.jsx";
import { useForm } from "../../../shared/hooks/useForm.js";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import { countCharacters } from "../../../shared/utils/validators.js";
import { PROJECT_GENRES } from "../constants/genres.js";
import { PROJECT_FORMATS } from "../constants/projectFormats.js";
import { PROJECT_DESCRIPTION_MAX, toProjectPayload, validateProject } from "../utils/projectValidation.js";

// onSubmit(payload) may return a message (e.g. project not found) to show above the fields
export default function ProjectForm({ initialValues, submitLabel, pendingLabel, cancelTo, onSubmit }) {
  const { values, getShownError, handleChange, handleBlur, validateBeforeSubmit } = useForm(
    initialValues,
    validateProject,
  );
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const publicId = useId();
  const publicHintId = useId();

  // A blur error could push this target down before mouseup and lose the click; left button
  // only, so a middle-click on Cancel still opens a new tab
  function handleMouseDown(event) {
    if (event.button === 0) {
      event.preventDefault();
    }
  }

  // The disabled submit lost focus, so it returns to the title; focus() won't scroll if the title
  // already has it, so the alert (rendered first by flushSync) is scrolled into view
  function showServerError(form, message) {
    // The user left the page (e.g. through a header link) while the request was running
    if (!form.isConnected) {
      return;
    }

    flushSync(() => {
      setServerError(message);
      setFailedAttempts((count) => count + 1);
      setIsPending(false);
    });
    form.elements.namedItem("title").focus({ preventScroll: true });
    form.querySelector('[role="alert"]').scrollIntoView({ block: "nearest" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    // Saved now: after the await, event.currentTarget is already null
    const form = event.currentTarget;

    if (isPending || !validateBeforeSubmit(form)) {
      return;
    }

    setIsPending(true);

    try {
      const message = await onSubmit(toProjectPayload(values));
      if (message) {
        showServerError(form, message);
      }
    } catch (error) {
      showServerError(form, getErrorMessage(error));
    }
  }

  const descriptionLength = countCharacters(values.description.trim());

  return (
    <form className="card flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
      {/* A new key per failure, so the same message is announced again */}
      {serverError && <ErrorMessage key={failedAttempts} message={serverError} />}

      <FormField
        label="Title"
        name="title"
        value={values.title}
        onChange={handleChange}
        onBlur={handleBlur}
        error={getShownError("title")}
        hint="3–80 characters."
        autoComplete="off"
      />

      <FormField
        as="textarea"
        label="Description (optional)"
        name="description"
        rows={6}
        value={values.description}
        onChange={handleChange}
        onBlur={handleBlur}
        error={getShownError("description")}
        hint={`What is this world about? ${descriptionLength.toLocaleString("en-US")} / ${PROJECT_DESCRIPTION_MAX.toLocaleString("en-US")} characters.`}
        className="resize-y"
      />

      <FormField
        label="Cover image link (optional)"
        name="cover_url"
        type="url"
        inputMode="url"
        value={values.cover_url}
        onChange={handleChange}
        onBlur={handleBlur}
        error={getShownError("cover_url")}
        hint="A link to an image, starting with https://. Without one, your project gets a generated emblem."
        autoComplete="off"
        spellCheck={false}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          as="select"
          label="Format"
          name="format"
          value={values.format}
          onChange={handleChange}
          onBlur={handleBlur}
          error={getShownError("format")}
        >
          <option value="">Choose a format</option>
          {PROJECT_FORMATS.map((format) => (
            <option key={format.value} value={format.value}>
              {format.label}
            </option>
          ))}
        </FormField>

        <FormField
          as="select"
          label="Genre (optional)"
          name="genre"
          value={values.genre}
          onChange={handleChange}
          onBlur={handleBlur}
          error={getShownError("genre")}
        >
          <option value="">No genre</option>
          {PROJECT_GENRES.map((genre) => (
            <option key={genre.value} value={genre.value}>
              {genre.label}
            </option>
          ))}
        </FormField>
      </div>

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
            Make this project public
          </label>
          <p id={publicHintId} className="field-hint">
            Everyone can see a public project and its public lore. While a project is private, all of its
            lore stays hidden from others, even entries marked public.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-night-700 pt-5">
        {/* Leaving can't stop a running request: the page would still open the saved project */}
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
