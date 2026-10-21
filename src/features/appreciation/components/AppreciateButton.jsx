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

// The Appreciate button on Lore Details: one pill that holds the action and the count
// ("♡ Appreciate | 7"). Its name is always "Appreciate" and aria-pressed says whether the user
// appreciates the entry. The number is hidden from screen readers inside the pill and read as its
// description instead ("7 appreciations"), so the name never changes while the count does.
// Only for entries others can see (the database accepts appreciations of public lore only).
// Nothing claims success before the database has accepted it: while the request is on its way the
// pill shows that it's being processed, and only then does it light up (or go out) and the count
// change. `onCountChange(change)` updates the count on the page: 1 for an appreciation, -1 for a removal.
// `publicNoteId` is the id of the note under both pills that says appreciations show on the user's
// public profile; the pill points to it with aria-describedby.
export default function AppreciateButton({ entry, onCountChange, publicNoteId }) {
  const { user, isAuthLoading } = useAuth();
  const location = useLocation();
  const { hasAppreciated, isLoading, error: statusError, refetch, setHasAppreciated } = useAppreciation(entry.id);
  const descriptionId = useId();
  // isPending is true from the click until the request (the async function given to
  // startTransition) has finished and its result is on screen
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState("");
  // Counts the failed requests: a new key per failure, so the same message is announced again
  const [failedAttempts, setFailedAttempts] = useState(0);
  // Bumped on each new appreciation, so the heart's "pop" plays again (the key below remounts it)
  const [popCount, setPopCount] = useState(0);
  // True from a click until its request has finished. Two clicks in the same moment both still see
  // the old isPending value, but a ref changes at once, so the second click is ignored.
  const isRequestingRef = useRef(false);
  const pillRef = useRef(null);

  const count = entry.appreciation_count;

  // Guests go to Login, which sends them back to this entry afterwards (GuestGuard reads state.from).
  // A link, because it leads to another page; it isn't a toggle for them, so there's no aria-pressed.
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

  // Until the session and the user's appreciation are loaded, the button can't be "pressed" or
  // "not pressed" yet. While a request is on its way, the current state stays until the answer comes.
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

  // Until the answer comes, the old state is still the true one
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

    // An async Action: isPending stays true until this function has finished, so the pill shows
    // that the request is being processed. Nothing else changes before the database has answered.
    startTransition(async () => {
      try {
        if (isAppreciating) {
          await appreciationService.appreciate(entry.id, user.id);
        } else {
          await appreciationService.removeAppreciation(entry.id, user.id);
        }

        // State updates after an await only belong to the transition when they're wrapped in
        // startTransition again. Then they reach the screen together with the end of isPending.
        startTransition(() => {
          setHasAppreciated(isAppreciating);
          onCountChange(isAppreciating ? 1 : -1);
          if (isAppreciating) {
            setPopCount((current) => current + 1);
          }
        });
      } catch (error) {
        // Nothing was changed, so there's nothing to undo: only say what went wrong
        const action = isAppreciating ? "saved" : "removed";
        startTransition(() => {
          setSaveError(`Your appreciation couldn't be ${action}. ${getAppreciationErrorMessage(error)}`);
          setFailedAttempts((current) => current + 1);
          // After a failed removal the heart is still filled. The breathing replaced its pop
          // animation, so the pop would play again when the breathing stops. Resetting popCount
          // remounts the heart (new key) without the pop, so no celebration plays with the error.
          if (!isAppreciating) {
            setPopCount(0);
          }
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
    <div className="appreciate">
      <button
        ref={pillRef}
        type="button"
        className="pill-button appreciate-pill"
        aria-pressed={isStatusKnown ? hasAppreciated : undefined}
        aria-disabled={isWaiting || undefined}
        aria-describedby={publicNoteId ? `${descriptionId} ${publicNoteId}` : descriptionId}
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
        {/* While the request is on its way the count isn't known yet, so "…" covers it. The number
            stays in place (invisible), so the pill keeps its width under the pointer. */}
        <span className="appreciate-count" aria-hidden="true">
          <span className="appreciate-count-number">{formatPillCount(count)}</span>
          {isPending && <span className="appreciate-count-pending">…</span>}
        </span>
      </button>
      <span id={descriptionId} hidden>
        {formatAppreciationCount(count)}
        {statusNote}
      </span>
      {/* Focus stays on the pill, and a changed description isn't announced, so this hidden status
          line tells screen reader users that the request is being processed. It's always rendered,
          so a screen reader notices when its text changes. */}
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
