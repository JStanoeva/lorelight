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

// No optimistic removal: the card shows it's pending and leaves only once the database confirms
export default function PinCard({ entry, isOwner, isHighlighted, linkRef, onRemove, onRemoved }) {
  const category = getCategory(entry.category);
  const authorName = entry.author?.display_name ?? "Unknown creator";
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
        // Updates after an await need startTransition again to join the transition, so the list
        // change shows up together with the end of isPending
        startTransition(() => onRemoved(entry));
      } catch (error) {
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
          {/* aria-hidden: the status line below announces it */}
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

          <div className="pin-card-foot">
            <Link to={`/profile/${entry.author_id}`} className="pin-card-author">
              <span className="creator-avatar" aria-hidden="true">
                {authorName.charAt(0).toUpperCase()}
              </span>
              <span className="sr-only">By </span>
              <span className="pin-card-author-name">{authorName}</span>
            </Link>
            <time dateTime={entry.saved_at} className="pin-card-date">
              Pinned <span className="pin-card-date-value">{formatDate(entry.saved_at)}</span>
            </time>

            {isOwner && (
              // aria-disabled, not disabled: a disabled button would drop focus to the page
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

      {/* Focus stays on the button while it waits, so this always-rendered line announces it */}
      <span role="status" className="sr-only">
        {isPending ? `Removing “${entry.title}” from your Constellation…` : ""}
      </span>
    </article>
  );
}
