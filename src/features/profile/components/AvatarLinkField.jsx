import { useId, useState } from "react";
import FormField from "../../../shared/components/FormField.jsx";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue.js";
import { useImageCheck } from "../../../shared/hooks/useImageCheck.js";
import { isHttpUrl } from "../../../shared/utils/validators.js";
import { getStarColor } from "../utils/getStarColor.js";
import ProfileAvatar from "./ProfileAvatar.jsx";
import ProfileAvatarImage from "./ProfileAvatarImage.jsx";

const FAILED_TEXT = "This link doesn't open a picture, so your profile would show your nebula instead.";

// The link is checked once typing pauses; until then the portrait stays empty, so the nebula
// never flashes before a picture
export default function AvatarLinkField({ seed, value, starColor, error, onChange, onBlur, onClear, onMouseDown }) {
  // The saved link is checked silently on load (a broken one still gets its warning)
  const [isEdited, setIsEdited] = useState(false);
  // Links the status line to the field, so its warning is read again whenever the field gets focus
  const statusId = useId();
  const link = value.trim();
  const debouncedLink = useDebouncedValue(link, 500);
  const checkStatus = useImageCheck(isHttpUrl(debouncedLink) ? debouncedLink : null);
  const color = getStarColor(starColor);

  // "none" (no full link), "waiting" (typing hasn't paused, so the last check was for the previous
  // link), "checking", "loaded" or "failed"
  let status = checkStatus;
  if (!isHttpUrl(link)) {
    status = "none";
  } else if (debouncedLink !== link) {
    status = "waiting";
  }
  const isSettled = status !== "waiting" && status !== "checking";

  function handleChange(event) {
    setIsEdited(true);
    onChange(event);
  }

  // The button disappears with the link, so focus goes to the field first
  function handleClear(event) {
    event.currentTarget.form.elements.namedItem("avatar_url").focus();
    setIsEdited(true);
    onClear();
  }

  let statusText = "";
  let statusClass = "edit-avatar-status";
  if (status === "failed") {
    statusText = FAILED_TEXT;
    statusClass = "edit-avatar-status edit-avatar-status-warning";
  } else if (status === "checking" && isEdited) {
    statusText = "Checking the link…";
    statusClass = "edit-avatar-status edit-avatar-status-checking";
  }

  return (
    <div className="edit-avatar" style={{ "--star": color.hex }}>
      <div className="edit-avatar-preview">
        <ProfileAvatar seed={seed} size="small">
          {isSettled && (
            <ProfileAvatarImage src={status === "loaded" ? link : null} seed={seed} colorHex={color.hex} />
          )}
        </ProfileAvatar>

        <div className="edit-avatar-clear">
          {link !== "" && (
            <button type="button" onMouseDown={onMouseDown} onClick={handleClear} className="btn btn-ghost">
              Use my nebula
            </button>
          )}
        </div>
      </div>

      <div className="edit-avatar-field">
        {/* "photo" is the autocomplete token for a link to the user's picture */}
        <FormField
          label="Avatar link (optional)"
          name="avatar_url"
          type="url"
          inputMode="url"
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          error={error}
          hint="A link to a picture, starting with https://. Without one, your profile shows a generated nebula."
          describedById={statusId}
          autoComplete="photo"
          spellCheck={false}
        />

        {/* A warning, not an error: a broken link can still be saved. While the field shows an error
            the link isn't checked, so the line gives up its reserved room */}
        <p id={statusId} role="status" className={error ? `${statusClass} edit-avatar-status-collapsed` : statusClass}>
          {statusText}
          {status === "loaded" && isEdited && <span className="sr-only">The link opens a picture.</span>}
        </p>
      </div>
    </div>
  );
}
