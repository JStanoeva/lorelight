import { useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Icon from "../../../shared/components/Icon.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useAppreciation } from "../hooks/useAppreciation.js";
import { appreciationService } from "../services/appreciationService.js";
import { formatAppreciationCount, formatPillCount } from "../utils/appreciationCount.js";
import { getAppreciationErrorMessage } from "../utils/appreciationErrors.js";
import "../styles/appreciate-button.css";

// The Appreciate button on Lore Details: one pill that holds the action and the count
// ("♡ Appreciate | 7"). Its name is always "Appreciate" and aria-pressed says whether the user
// appreciates the entry. The number is hidden from screen readers inside the pill and read as its
// description instead ("7 appreciations"), so the name never changes while the count does.
// Only for entries others can see (the database accepts appreciations of public lore only).
// `onCountChange(change)` updates the count on the page at once: 1 for an appreciation, -1 for a
// removal, and the opposite change when the request fails.
export default function AppreciateButton({ entry, onCountChange }) {
  const { user, isAuthLoading } = useAuth();
  const location = useLocation();
  const { hasAppreciated, isLoading, error: statusError, refetch, setHasAppreciated } = useAppreciation(entry.id);
  const descriptionId = useId();
  const [isPending, setIsPending] = useState(false);
  const [saveError, setSaveError] = useState("");
  // Counts the failed requests: a new key per failure, so the same message is announced again
  const [failedAttempts, setFailedAttempts] = useState(0);
  // Bumped on each new appreciation, so the heart's "pop" plays again (the key below remounts it)
  const [popCount, setPopCount] = useState(0);
  // True from a click until its request has finished. Two clicks in the same moment both still see
  // the old isPending state, but a ref changes at once, so the second click is ignored.
  const isRequestingRef = useRef(false);
  const pillRef = useRef(null);

  const count = entry.appreciation_count;
  const countSegment = (
    <span className="appreciate-count" aria-hidden="true">
      {formatPillCount(count)}
    </span>
  );

  // Guests go to Login, which sends them back to this entry afterwards (GuestGuard reads state.from).
  // A link, because it leads to another page; it isn't a toggle for them, so there's no aria-pressed.
  if (!isAuthLoading && !user) {
    return (
      <div className="appreciate">
        <Link to="/login" state={{ from: location }} className="appreciate-pill" aria-describedby={descriptionId}>
          <span className="appreciate-action">
            <Icon name="heart" className="appreciate-glyph" />
            Appreciate
          </span>
          {countSegment}
        </Link>
        {/* `hidden` keeps it from being read twice: aria-describedby still reads hidden text */}
        <span id={descriptionId} hidden>
          {formatAppreciationCount(count)}. Log in to appreciate this entry.
        </span>
      </div>
    );
  }

  // Until the session and the user's appreciation are loaded, the button can't be "pressed" or
  // "not pressed" yet. While a request is on its way, the result is already shown.
  const isStatusKnown = !isAuthLoading && !isLoading && !statusError;
  // A click does nothing then. aria-disabled instead of disabled: a disabled button would drop
  // keyboard focus to the page, so the user would lose their place.
  const isWaiting = !isStatusKnown || isPending;
  const isPressed = isStatusKnown && hasAppreciated;

  let statusNote = "";
  if (statusError) {
    statusNote = ". We couldn't check whether you've appreciated it.";
  } else if (!isStatusKnown) {
    statusNote = ". Checking whether you've appreciated it…";
  }

  async function handleClick() {
    if (isWaiting || isRequestingRef.current) {
      return;
    }

    const isAppreciating = !hasAppreciated;
    const change = isAppreciating ? 1 : -1;
    isRequestingRef.current = true;
    setIsPending(true);
    setSaveError("");

    // Optimistic: the new state and count show at once, and are undone if the request fails
    setHasAppreciated(isAppreciating);
    onCountChange(change);
    if (isAppreciating) {
      setPopCount((current) => current + 1);
    }

    try {
      if (isAppreciating) {
        await appreciationService.appreciate(entry.id, user.id);
      } else {
        await appreciationService.removeAppreciation(entry.id, user.id);
      }
    } catch (error) {
      setHasAppreciated(!isAppreciating);
      onCountChange(-change);
      // A failed removal fills the heart again: reset the pop, so the error doesn't replay it
      if (!isAppreciating) {
        setPopCount(0);
      }
      const action = isAppreciating ? "saved" : "removed";
      setSaveError(`Your appreciation couldn't be ${action}. ${getAppreciationErrorMessage(error)}`);
      setFailedAttempts((current) => current + 1);
    } finally {
      isRequestingRef.current = false;
      setIsPending(false);
    }
  }

  // The Try again button disappears with the error, so focus moves to the pill instead of the page
  function handleRetry() {
    refetch();
    pillRef.current.focus();
  }

  return (
    <div className="appreciate">
      <button
        ref={pillRef}
        type="button"
        className="appreciate-pill"
        aria-pressed={isStatusKnown ? hasAppreciated : undefined}
        aria-disabled={isWaiting || undefined}
        aria-describedby={descriptionId}
        data-checking={!isStatusKnown || undefined}
        data-pending={isPending || undefined}
        onClick={handleClick}
      >
        <span className="appreciate-action">
          <Icon
            key={popCount}
            name={isPressed ? "heartFilled" : "heart"}
            className={isPressed && popCount > 0 ? "appreciate-glyph is-popping" : "appreciate-glyph"}
          />
          Appreciate
        </span>
        {countSegment}
      </button>
      <span id={descriptionId} hidden>
        {formatAppreciationCount(count)}
        {statusNote}
      </span>

      {saveError && (
        <p key={failedAttempts} className="appreciate-error" role="alert">
          {saveError}
        </p>
      )}

      {statusError && (
        <div className="appreciate-status-error">
          <ErrorMessage
            message={`We couldn't check whether you've appreciated this entry. ${getErrorMessage(statusError)}`}
            onRetry={handleRetry}
          />
        </div>
      )}
    </div>
  );
}
