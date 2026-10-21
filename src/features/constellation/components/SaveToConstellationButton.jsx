import { useId, useRef, useState, useTransition } from "react";
import { Link, useLocation } from "react-router";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Icon from "../../../shared/components/Icon.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useSaveStatus } from "../hooks/useSaveStatus.js";
import { constellationService } from "../services/constellationService.js";
import { getConstellationErrorMessage } from "../utils/constellationErrors.js";
import "../../../shared/styles/pill-button.css";

// The Save button on Lore Details: one pill ("☆ Save") that adds the entry to the user's
// Constellation or takes it out again. It works like the Appreciate pill next to it: its name is
// always "Save to Constellation" (the last words only for screen readers) and aria-pressed says
// whether the entry is saved. Only for entries others can see (the database accepts saves of public
// lore only), the author's own included. Nothing claims success before the database has accepted
// it: while the request is on its way the pill shows that it's being processed, and only then does
// the star fill (or empty). Logged-in users also see a short note that Constellations are public.
export default function SaveToConstellationButton({ loreId }) {
  const { user, isAuthLoading } = useAuth();
  const location = useLocation();
  const { isSaved, isLoading, error: statusError, refetch, setIsSaved } = useSaveStatus(loreId);
  const descriptionId = useId();
  const publicNoteId = useId();
  // isPending is true from the click until the request (the async function given to
  // startTransition) has finished and its result is on screen
  const [isPending, startTransition] = useTransition();
  const [requestError, setRequestError] = useState("");
  // Counts the failed requests: a new key per failure, so the same message is announced again
  const [failedAttempts, setFailedAttempts] = useState(0);
  // True from a click until its request has finished. Two clicks in the same moment both still see
  // the old isPending value, but a ref changes at once, so the second click is ignored.
  const isRequestingRef = useRef(false);
  const pillRef = useRef(null);

  // Guests go to Login, which sends them back to this entry afterwards (GuestGuard reads state.from).
  // A link, because it leads to another page; it isn't a toggle for them, so there's no aria-pressed.
  if (!isAuthLoading && !user) {
    return (
      <div className="save-to-constellation">
        <Link to="/login" state={{ from: location }} className="pill-button" aria-describedby={descriptionId}>
          <span className="pill-button-action">
            <Icon name="starOutline" className="pill-button-glyph" />
            <span>
              Save<span className="sr-only"> to Constellation</span>
            </span>
          </span>
        </Link>
        {/* `hidden` keeps it from being read twice: aria-describedby still reads hidden text */}
        <span id={descriptionId} hidden>
          Log in to save this entry to your Constellation.
        </span>
      </div>
    );
  }

  // Until the session and the user's save are loaded, the button can't be "pressed" or "not
  // pressed" yet. While a request is on its way, the current state stays until the answer comes.
  const isStatusKnown = !isAuthLoading && !isLoading && !statusError;
  // A click does nothing then. aria-disabled instead of disabled: a disabled button would drop
  // keyboard focus to the page, so the user would lose their place.
  const isWaiting = !isStatusKnown || isPending;
  const isPressed = isStatusKnown && isSaved;

  let statusNote = "";
  if (statusError) {
    statusNote = "We couldn't check whether you've saved it.";
  } else if (!isStatusKnown) {
    statusNote = "Checking whether you've saved it…";
  }

  // Until the answer comes, the old state is still the true one
  let pendingNote = "";
  if (isPending) {
    pendingNote = isSaved ? "Removing from your Constellation…" : "Saving to your Constellation…";
  }

  function handleClick() {
    if (isWaiting || isRequestingRef.current) {
      return;
    }

    const isSaving = !isSaved;
    isRequestingRef.current = true;
    setRequestError("");

    // An async Action: isPending stays true until this function has finished, so the pill shows
    // that the request is being processed. Nothing else changes before the database has answered.
    startTransition(async () => {
      try {
        if (isSaving) {
          await constellationService.saveLore(loreId, user.id);
        } else {
          await constellationService.unsaveLore(loreId, user.id);
        }

        // State updates after an await only belong to the transition when they're wrapped in
        // startTransition again. Then they reach the screen together with the end of isPending.
        startTransition(() => {
          setIsSaved(isSaving);
        });
      } catch (error) {
        // Nothing was changed, so there's nothing to undo: only say what went wrong
        const message = isSaving
          ? `This entry couldn't be saved to your Constellation. ${getConstellationErrorMessage(error, "save")}`
          : `This entry couldn't be removed from your Constellation. ${getConstellationErrorMessage(error, "remove")}`;
        startTransition(() => {
          setRequestError(message);
          setFailedAttempts((current) => current + 1);
        });
      } finally {
        isRequestingRef.current = false;
      }
    });
  }

  // The Try again button disappears with the error, so focus moves to the pill instead of the page
  function handleRetry() {
    refetch();
    pillRef.current.focus();
  }

  return (
    <div className="save-to-constellation">
      <button
        ref={pillRef}
        type="button"
        className="pill-button"
        aria-pressed={isStatusKnown ? isSaved : undefined}
        aria-disabled={isWaiting || undefined}
        aria-describedby={user ? `${descriptionId} ${publicNoteId}` : descriptionId}
        data-checking={!isStatusKnown || undefined}
        data-pending={isPending || undefined}
        onClick={handleClick}
      >
        <span className="pill-button-action">
          <Icon name={isPressed ? "star" : "starOutline"} className="pill-button-glyph" />
          {/* One span, so the "…" sits right after the word (the action's gap would push it away) */}
          <span>
            Save<span className="sr-only"> to Constellation</span>
            {/* While the request is on its way: a cue that doesn't rely on colour or motion */}
            {isPending && <span aria-hidden="true">…</span>}
          </span>
        </span>
      </button>
      <span id={descriptionId} hidden>
        {statusNote}
      </span>
      {/* Focus stays on the pill, and a changed description isn't announced, so this hidden status
          line tells screen reader users that the request is being processed. It's always rendered,
          so a screen reader notices when its text changes. */}
      <span role="status" className="sr-only">
        {pendingNote}
      </span>

      {requestError && (
        <p key={failedAttempts} className="pill-button-error" role="alert">
          {requestError}
        </p>
      )}

      {/* Said before the click, so saving never surprises anyone: Constellations are public */}
      {user && (
        <p id={publicNoteId} className="pill-button-note">
          <Icon name="eye" size={14} />
          Your Constellation is public, so anyone can see the entries you save.
        </p>
      )}

      {statusError && (
        <div className="pill-button-status-error">
          <ErrorMessage
            message={`We couldn't check whether this entry is in your Constellation. ${getErrorMessage(statusError)}`}
            onRetry={handleRetry}
          />
        </div>
      )}
    </div>
  );
}
