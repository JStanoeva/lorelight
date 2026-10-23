import { useState } from "react";
import { flushSync } from "react-dom";
import { Link } from "react-router";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import FormField from "../../../shared/components/FormField.jsx";
import SubmitButton from "../../../shared/components/SubmitButton.jsx";
import { useForm } from "../../../shared/hooks/useForm.js";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import { countCharacters } from "../../../shared/utils/validators.js";
import { BIO_MAX, DISPLAY_NAME_MAX, toProfilePayload, validateProfile } from "../utils/profileValidation.js";
import AvatarLinkField from "./AvatarLinkField.jsx";
import StarColorField from "./StarColorField.jsx";

// `profileId` seeds the generated nebula of the avatar preview. `onSubmit(payload)` saves and
// navigates away; if it returns a message instead, the form shows it above the fields.
export default function ProfileForm({ profileId, initialValues, cancelTo, onSubmit }) {
  const { values, getShownError, handleChange, handleBlur, setValue, validateBeforeSubmit } = useForm(
    initialValues,
    validateProfile,
  );
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Leaving a field can show its error and push the controls below it (the colour tiles, Cancel)
  // down before the mouse is released, so the click would be lost. Only the left button, so a
  // middle-click on Cancel still opens a new tab.
  function handleMouseDown(event) {
    if (event.button === 0) {
      event.preventDefault();
    }
  }

  // The submit button was disabled, so focus goes back into the form, to the first field (the
  // avatar link). focus() doesn't scroll when that field already had focus, so the page scrolls
  // to the alert itself; flushSync renders the alert first, so it's there to scroll to.
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
    form.elements.namedItem("avatar_url").focus({ preventScroll: true });
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
      const message = await onSubmit(toProfilePayload(values));
      if (message) {
        showServerError(form, message);
      }
    } catch (error) {
      showServerError(form, getErrorMessage(error));
    }
  }

  const displayNameLength = countCharacters(values.display_name.trim());
  const bioLength = countCharacters(values.bio.trim());

  return (
    <form className="card flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
      {/* A new key on every failure re-creates the alert, so it is announced again even
          when the message is the same as last time */}
      {serverError && <ErrorMessage key={failedAttempts} message={serverError} />}

      <AvatarLinkField
        seed={profileId}
        value={values.avatar_url}
        starColor={values.star_color}
        error={getShownError("avatar_url")}
        onChange={handleChange}
        onBlur={handleBlur}
        onClear={() => setValue("avatar_url", "")}
        onMouseDown={handleMouseDown}
      />

      <FormField
        label="Display name"
        name="display_name"
        value={values.display_name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={getShownError("display_name")}
        hint={`Shown on your profile and next to your lore. ${displayNameLength} / ${DISPLAY_NAME_MAX} characters.`}
        autoComplete="off"
      />

      <FormField
        as="textarea"
        label="Bio (optional)"
        name="bio"
        rows={5}
        value={values.bio}
        onChange={handleChange}
        onBlur={handleBlur}
        error={getShownError("bio")}
        hint={`A few lines about you and your worlds. ${bioLength} / ${BIO_MAX} characters.`}
        className="resize-y"
      />

      <StarColorField
        value={values.star_color}
        error={getShownError("star_color")}
        onChange={handleChange}
        onMouseDown={handleMouseDown}
      />

      <div className="flex flex-wrap justify-end gap-3 border-t border-night-700 pt-5">
        {/* Leaving can't stop a request that's already running: the page would still open the profile */}
        {isPending ? (
          <button type="button" disabled className="btn btn-ghost">
            Cancel
          </button>
        ) : (
          <Link to={cancelTo} onMouseDown={handleMouseDown} className="btn btn-ghost">
            Cancel
          </Link>
        )}
        <SubmitButton isPending={isPending} label="Save changes" pendingLabel="Saving changes…" />
      </div>
    </form>
  );
}
