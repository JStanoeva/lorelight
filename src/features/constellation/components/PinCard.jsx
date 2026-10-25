import { useRef, useState, useTransition } from "react";
import { Link } from "react-router";
import CoverImage from "../../../shared/components/CoverImage.jsx";
import Icon from "../../../shared/components/Icon.jsx";
import { formatDate } from "../../../shared/utils/formatDate.js";
import StarGlyph from "../../home/components/StarGlyph.jsx";
import LorePlaceholder from "../../lore/components/LorePlaceholder.jsx";
import { getCategory } from "../../lore/utils/getCategory.js";
import { getConstellationErrorMessage } from "../utils/constellationErrors.js";
import StarPin from "./StarPin.jsx";
import "../../../shared/styles/creator-link.css";

// One saved entry, pinned to the board: a small "polaroid" with the picture (the entry's image or
// its emblem print), the category, the title (a link over the whole card), the world, the author
// and when it was pinned. The owner can remove it. Nothing changes before the database has
// confirmed the removal: while the request is on its way the card says it's being removed; only
// then does it leave the board (`onRemoved` takes it off the list, announces it and moves focus).
// If the request fails, the card stays and says why. `linkRef` receives the title link, so focus
// can be moved to it.
export default function PinCard({ entry, isOwner, isHighlighted, linkRef, onRemove, onRemoved }) {
  const category = getCategory(entry.category);
  const authorName = entry.author?.display_name ?? "Unknown creator";
  // isPending is true from the click until the removal has finished and its result is on screen
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");
  // A new key per failure, so the same message is announced again
  const [failedAttempts, setFailedAttempts] = useState(0);
  // Two clicks in the same moment both still see the old isPending; a ref changes at once
  const isRequestingRef = useRef(false);

  function handleRemove() {
    if (isPending || isRequestingRef.current) {
      return;
    }

    isRequestingRef.current = true;
    setErrorMessage("");

    // An async Action: isPending stays true until this function has finished
    startTransition(async () => {
      try {
        await onRemove(entry.id);
        // State updates after an await only belong to the transition when they're wrapped in
        // startTransition again. So everything onRemoved changes (the list, the confirmation line)
        // shows up in the same moment as the end of isPending. The card is still on screen while
        // onRemoved runs, so the board can move focus on before the card disappears.
        startTransition(() => onRemoved(entry));
      } catch (error) {
        // Nothing was removed, so there's nothing to undo: only say what went wrong
        startTransition(() => {
          setErrorMessage(
            `This entry couldn't be removed from your Constellation. ${getConstellationErrorMessage(error, "remove")}`,
          );
          setFailedAttempts((count) => count + 1);
        });
      } finally {
        isRequestingRef.current = false;
      }
    });
  }

  return (
    <article
      className="pin-card"
      data-pending={isPending || undefined}
      data-highlighted={isHighlighted || undefined}
    >
      <StarPin colorClassName={category.starClassName} />

      <div className="card-interactive pin-card-paper">
        <div className="pin-card-picture">
          {/* alt="" because the title right below already names the entry */}
          <CoverImage
            src={entry.image_url}
            alt=""
            placeholder={<LorePlaceholder seed={entry.id} category={entry.category} />}
          />
          {/* The visible pending cue, inside the card (the hidden status line below speaks) */}
          {isPending && (
            <span className="pin-card-stamp" aria-hidden="true">
              <span className="pin-card-spinner" />
              Removing…
            </span>
          )}
        </div>

        <div className={`pin-card-body ${category.starClassName}`}>
          <span className={`badge ${category.badgeClassName}`}>
            <Icon name="star" size={10} className="pin-card-badge-star" />
            {category.label}
          </span>

          <h3 className="pin-card-title">
            {/* The link stretches over the whole card (see .card-link) */}
            <Link ref={linkRef} to={`/lore/${entry.id}`} className="card-link">
              {entry.title}
            </Link>
          </h3>

          {entry.project && (
            <p className="pin-card-world">
              <StarGlyph className="pin-card-world-star" />
              <span className="sr-only">World: </span>
              <span className="pin-card-world-name">{entry.project.title}</span>
            </p>
          )}

          {/* Two tidy lines: the author, then when it was pinned and the Remove button */}
          <div className="pin-card-foot">
            {/* Above the stretched title link (z-index), so it opens the profile, not the entry */}
            <Link to={`/profile/${entry.author_id}`} className="pin-card-author">
              <span className="creator-avatar" aria-hidden="true">
                {authorName.charAt(0).toUpperCase()}
              </span>
              <span className="sr-only">By </span>
              <span className="pin-card-author-name">{authorName}</span>
            </Link>
            {/* The date itself never breaks, so on a very narrow card it moves under "Pinned" */}
            <time dateTime={entry.saved_at} className="pin-card-date">
              Pinned <span className="pin-card-date-value">{formatDate(entry.saved_at)}</span>
            </time>

            {isOwner && (
              // aria-disabled instead of disabled while waiting: a disabled button would drop
              // keyboard focus to the page
              <button
                type="button"
                className="pin-card-remove"
                aria-disabled={isPending || undefined}
                onClick={handleRemove}
              >
                {isPending ? <span className="pin-card-spinner" aria-hidden="true" /> : <Icon name="close" size={12} />}
                Remove
                <span className="sr-only"> {entry.title} from your Constellation</span>
              </button>
            )}
          </div>

          {errorMessage && (
            <p key={failedAttempts} role="alert" className="pin-card-error">
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      {/* Focus stays on the button while it waits, so this hidden line tells screen reader users
          what is happening. Always rendered, so a change of its text is noticed. */}
      <span role="status" className="sr-only">
        {isPending ? `Removing “${entry.title}” from your Constellation…` : ""}
      </span>
    </article>
  );
}
