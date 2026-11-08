import { useId, useRef, useState, useTransition } from "react";
import { Link, useLocation } from "react-router";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Icon from "../../../shared/components/Icon.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useAppreciation } from "../hooks/useAppreciation.js";
import { appreciationService } from "../services/appreciationService.js";
import { formatAppreciationCount, formatPillCount } from "../utils/appreciationCount.js";
import { getAppreciationErrorMessage } from "../utils/appreciationErrors.js";
import "../../../shared/styles/pill-button.css";
import "../styles/appreciate-button.css";

// The count is read as the description, not part of the name, so the name never changes.
// Nothing changes before the database answers; onCountChange gets 1 or -1.
export default function AppreciateButton({ entry, onCountChange }) {
  const { user, isAuthLoading } = useAuth();
  const location = useLocation();
  const { hasAppreciated, isLoading, error: statusError, refetch, setHasAppreciated } = useAppreciation(entry.id);
  const descriptionId = useId();
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState("");
  // A new key per failure, so the same message is announced again
  const [failedAttempts, setFailedAttempts] = useState(0);
  // Used as the heart's key, so bumping it replays the "pop"
  const [popCount, setPopCount] = useState(0);
  // A ref, not isPending: two clicks in the same moment both still see the old isPending
  const isRequestingRef = useRef(false);
  const pillRef = useRef(null);

  const count = entry.appreciation_count;

  // Guests get a link to Login (GuestGuard returns them via state.from), not a toggle
  if (!isAuthLoading && !user) {
    return (
      <div className="appreciate">
        <Link to="/login" state={{ from: location }} className="pill-button appreciate-pill" aria-describedby={descriptionId}>
          <span className="pill-button-action">
            <Icon name="heart" className="pill-button-glyph" />
            Appreciate
          </span>
          <span className="appreciate-count" aria-hidden="true">
            {formatPillCount(count)}
          </span>
        </Link>
        {/* `hidden` keeps it from being read twice: aria-describedby still reads hidden text */}
        <span id={descriptionId} hidden>
          {formatAppreciationCount(count)}. Log in to appreciate this entry.
        </span>
      </div>
    );
  }

  const isStatusKnown = !isAuthLoading && !isLoading && !statusError;
  // Used for aria-disabled, not disabled: a disabled button would drop keyboard focus to the page
  const isWaiting = !isStatusKnown || isPending;
  const isPressed = isStatusKnown && hasAppreciated;

  let statusNote = "";
  if (statusError) {
    statusNote = ". We couldn't check whether you've appreciated it.";
  } else if (!isStatusKnown) {
    statusNote = ". Checking whether you've appreciated it…";
  }

  let pendingNote = "";
  if (isPending) {
    pendingNote = hasAppreciated ? "Removing your appreciation…" : "Saving your appreciation…";
  }

  function handleClick() {
    if (isWaiting || isRequestingRef.current) {
      return;
    }

    const isAppreciating = !hasAppreciated;
    isRequestingRef.current = true;
    setSaveError("");

    startTransition(async () => {
      try {
        if (isAppreciating) {
          await appreciationService.appreciate(entry.id, user.id);
        } else {
          await appreciationService.removeAppreciation(entry.id, user.id);
        }

        // Updates after an await join the transition only when wrapped in startTransition again
        startTransition(() => {
          setHasAppreciated(isAppreciating);
          onCountChange(isAppreciating ? 1 : -1);
          if (isAppreciating) {
            setPopCount((current) => current + 1);
          }
        });
      } catch (error) {
        const action = isAppreciating ? "saved" : "removed";
        startTransition(() => {
          setSaveError(`Your appreciation couldn't be ${action}. ${getAppreciationErrorMessage(error)}`);
          setFailedAttempts((current) => current + 1);
          // Remount the still-filled heart without the pop, which would otherwise replay when
          // the pending animation stops
          if (!isAppreciating) {
            setPopCount(0);
          }
        });
      } finally {
        isRequestingRef.current = false;
      }
    });
  }

  // Try again disappears with the error, so focus moves to the pill instead of the page
  function handleRetry() {
    refetch();
    pillRef.current.focus();
  }

  return (
    <div className="appreciate">
      <button
        ref={pillRef}
        type="button"
        className="pill-button appreciate-pill"
        aria-pressed={isStatusKnown ? hasAppreciated : undefined}
        aria-disabled={isWaiting || undefined}
        aria-describedby={descriptionId}
        data-checking={!isStatusKnown || undefined}
        data-pending={isPending || undefined}
        onClick={handleClick}
      >
        <span className="pill-button-action">
          <Icon
            key={popCount}
            name={isPressed ? "heartFilled" : "heart"}
            className={isPressed && popCount > 0 ? "pill-button-glyph is-popping" : "pill-button-glyph"}
          />
          Appreciate
        </span>
        <span className="appreciate-count" aria-hidden="true">
          <span className="appreciate-count-number">{formatPillCount(count)}</span>
          {isPending && <span className="appreciate-count-pending">…</span>}
        </span>
      </button>
      <span id={descriptionId} hidden>
        {formatAppreciationCount(count)}
        {statusNote}
      </span>
      {/* A changed description isn't announced, so this always-rendered status line announces
          the pending request */}
      <span role="status" className="sr-only">
        {pendingNote}
      </span>

      {saveError && (
        <p key={failedAttempts} className="pill-button-error" role="alert">
          {saveError}
        </p>
      )}

      {statusError && (
        <div className="pill-button-status-error">
          <ErrorMessage
            message={`We couldn't check whether you've appreciated this entry. ${getErrorMessage(statusError)}`}
            onRetry={handleRetry}
          />
        </div>
      )}
    </div>
  );
}
