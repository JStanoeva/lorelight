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

// Only for public entries: the database accepts saves of public lore only. Nothing claims
// success before the database has answered; meanwhile the pill shows the request is pending.
export default function SaveToConstellationButton({ loreId }) {
  const { user, isAuthLoading } = useAuth();
  const location = useLocation();
  const { isSaved, isLoading, error: statusError, refetch, setIsSaved } = useSaveStatus(loreId);
  const descriptionId = useId();
  const [isPending, startTransition] = useTransition();
  const [requestError, setRequestError] = useState("");
  // A new key per failure, so the same message is announced again
  const [failedAttempts, setFailedAttempts] = useState(0);
  // Two clicks in the same moment both still see the old isPending; a ref changes at once
  const isRequestingRef = useRef(false);
  const pillRef = useRef(null);

  // Guests get a link to Login, which sends them back here afterwards (GuestGuard reads state.from)
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

  const isStatusKnown = !isAuthLoading && !isLoading && !statusError;
  // aria-disabled, not disabled: a disabled button would drop keyboard focus to the page
  const isWaiting = !isStatusKnown || isPending;
  const isPressed = isStatusKnown && isSaved;

  let statusNote = "";
  if (statusError) {
    statusNote = "We couldn't check whether you've saved it.";
  } else if (!isStatusKnown) {
    statusNote = "Checking whether you've saved it…";
  }

  // isSaved still holds the old state until the answer comes
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

    // An async Action: isPending stays true until this function has finished
    startTransition(async () => {
      try {
        if (isSaving) {
          await constellationService.saveLore(loreId, user.id);
        } else {
          await constellationService.unsaveLore(loreId, user.id);
        }

        // Updates after an await need startTransition again to join the transition, so they
        // show up together with the end of isPending
        startTransition(() => {
          setIsSaved(isSaving);
        });
      } catch (error) {
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
        aria-describedby={descriptionId}
        data-checking={!isStatusKnown || undefined}
        data-pending={isPending || undefined}
        onClick={handleClick}
      >
        <span className="pill-button-action">
          <Icon name={isPressed ? "star" : "starOutline"} className="pill-button-glyph" />
          <span>
            Save<span className="sr-only"> to Constellation</span>
          </span>
        </span>
      </button>
      <span id={descriptionId} hidden>
        {statusNote}
      </span>
      {/* Focus stays on the pill and a changed description isn't announced, so this
          always-rendered status line announces the pending request */}
      <span role="status" className="sr-only">
        {pendingNote}
      </span>

      {requestError && (
        <p key={failedAttempts} className="pill-button-error" role="alert">
          {requestError}
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
