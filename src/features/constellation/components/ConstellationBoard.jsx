import { useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Icon from "../../../shared/components/Icon.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import CategoryChips from "../../lore/components/CategoryChips.jsx";
import { getCategory } from "../../lore/utils/getCategory.js";
import { getBoardCountText } from "../utils/constellationText.js";
import { countByCategory } from "../utils/threads.js";
import BoardFrame from "./BoardFrame.jsx";
import BoardNotice from "./BoardNotice.jsx";
import EmptyBoardNotice from "./EmptyBoardNotice.jsx";
import PinBoard from "./PinBoard.jsx";
import "../styles/constellation.css";

const CHIPS_LABEL = "Filter by category";

// A Constellation as a pin board: the category chips (the threads' key and the filter), the count
// line, and the framed board with the cards (or an error or empty notice; while loading, the ghost
// cards on their own). Everything comes in as props, so a creator's profile can show the same board
// read-only (isOwner false).
//   entries                 the saves, newest first; isLoading / error / onRetry: the load's state
//   isOwner                 the viewer's own Constellation: Remove buttons
//   ownerId, ownerName      whose Constellation it is (the id seeds the board's stars)
//   category                the chosen category ("" for all); onCategoryChange(value) changes it
//   onRemove(loreId)        sends the removal and returns its Promise
//   onRemoved(loreId)       takes the entry off `entries` once the database has confirmed it
export default function ConstellationBoard({
  entries,
  isLoading,
  error,
  onRetry,
  isOwner,
  ownerId,
  ownerName,
  category,
  onCategoryChange,
  onRemove,
  onRemoved,
}) {
  // The count line: it stays in place, so focus moves there when what had it disappears
  const countRef = useRef(null);
  // The last confirmed removal. `count` goes up with every one, so the line is replaced and
  // announced again even when two removed entries share a title.
  const [removal, setRemoval] = useState({ title: "", count: 0 });
  // Filtering happens here: every save is loaded anyway, so the counts come for free
  const counts = useMemo(() => countByCategory(entries), [entries]);
  const shownEntries = useMemo(
    () => (category ? entries.filter((entry) => getCategory(entry.category).value === category) : entries),
    [entries, category],
  );

  const chosenCategory = category ? getCategory(category) : null;
  const isLoaded = !isLoading && !error;
  const plaque = isOwner ? "Pinned by you" : `Pinned by ${ownerName}`;

  function handleCategoryChange(nextCategory) {
    const focused = document.activeElement;
    // The chip of a category without entries disappears once another one is chosen. flushSync
    // renders the change right away, so we can tell whether the focused chip has left the page.
    flushSync(() => onCategoryChange(nextCategory));
    if (focused && !focused.isConnected) {
      countRef.current?.focus();
    }
  }

  // The button disappears with the empty view, so focus moves to the count line
  function handleShowAll() {
    onCategoryChange("");
    countRef.current?.focus();
  }

  // Try again disappears with the error, so focus moves to the count line, as above
  function handleRetry() {
    onRetry();
    countRef.current?.focus();
  }

  // Runs inside the card's transition, after the database has confirmed the removal
  function handleRemoved(entry) {
    setRemoval((current) => ({ title: entry.title, count: current.count + 1 }));
    onRemoved(entry.id);
  }

  let board;
  if (isLoading) {
    // The loading animation on its own: the glowing ghost cards and the Loader, but no frame and no
    // placeholder chips. An empty Constellation has no chips (and its frame sits higher), so those
    // would appear and then vanish or jump. The chips, the frame and the cards appear once known.
    board = (
      <div className="board-loading">
        <BoardNotice kind="loading" isOwner={isOwner} />
      </div>
    );
  } else if (error) {
    board = (
      <BoardFrame seed={ownerId} plaque={plaque} isCompact>
        <BoardNotice kind="error" errorMessage={getErrorMessage(error)} onRetry={handleRetry} />
      </BoardFrame>
    );
  } else if (shownEntries.length === 0) {
    board = (
      <BoardFrame seed={ownerId} plaque={plaque} isCompact>
        <EmptyBoardNotice
          category={entries.length > 0 ? chosenCategory : null}
          isOwner={isOwner}
          ownerName={ownerName}
          onShowAll={handleShowAll}
        />
      </BoardFrame>
    );
  } else {
    board = (
      <PinBoard
        entries={shownEntries}
        selectedCategory={category}
        isOwner={isOwner}
        seed={ownerId}
        plaque={plaque}
        fallbackFocusRef={countRef}
        onRemove={onRemove}
        onRemoved={handleRemoved}
      />
    );
  }

  return (
    <>
      {isLoaded && entries.length > 0 && (
        <CategoryChips value={category} onChange={handleCategoryChange} counts={counts} label={CHIPS_LABEL} />
      )}

      <div className="constellation-board site-column">
        <div className="board-summary">
          {/* Stays mounted (empty while loading), so screen readers hear every new count.
              tabIndex -1: it can take focus from code, but isn't a Tab stop. An empty Constellation
              says so in its notice below, so "Nothing pinned yet" is hidden (screen readers still
              read it), except while the line has keyboard focus (after the last card is removed):
              then it shows, so the focus ring surrounds words instead of nothing. */}
          <p ref={countRef} tabIndex={-1} role="status" className="board-count group">
            {isLoaded && entries.length > 0 && (
              <>
                <Icon name="star" size={12} className="board-count-star" />
                {getBoardCountText(shownEntries.length, entries.length, chosenCategory?.label ?? "")}
              </>
            )}
            {isLoaded && entries.length === 0 && (
              <span className="sr-only group-focus-visible:not-sr-only">Nothing pinned yet</span>
            )}
          </p>

          {/* Always rendered, so screen readers notice when the text appears. Shown only after the
              database has confirmed a removal. */}
          <p role="status" className="board-removed">
            {removal.title && (
              <>
                <Icon name="check" size={14} />
                {/* A new key per removal replaces the text, so it's announced every time */}
                <span key={removal.count}>Removed “{removal.title}” from your Constellation.</span>
              </>
            )}
          </p>
        </div>

        {board}
      </div>
    </>
  );
}
