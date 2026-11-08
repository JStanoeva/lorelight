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

// Props only, so a creator's profile can show the same board read-only (isOwner false).
// onRemove(loreId) returns the request's Promise; onRemoved(loreId) runs once it's confirmed.
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
  // The count line stays mounted, so focus moves there when the focused element disappears
  const countRef = useRef(null);
  const [removal, setRemoval] = useState({ title: "", count: 0 });
  // Filtered here, not in the query: every save is loaded anyway, so the counts come for free
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
    // A chip without entries disappears once another is chosen; flushSync renders that now, so
    // we can tell whether the focused chip has left the page
    flushSync(() => onCategoryChange(nextCategory));
    if (focused && !focused.isConnected) {
      countRef.current?.focus();
    }
  }

  // "Show all" disappears with the empty view; flushSync renders first, so the count line
  // already holds the new count when it gets focus
  function handleShowAll() {
    flushSync(() => onCategoryChange(""));
    countRef.current?.focus();
  }

  // Try again disappears with the error, so focus moves to the count line
  function handleRetry() {
    onRetry();
    countRef.current?.focus();
  }

  function handleRemoved(entry) {
    setRemoval((current) => ({ title: entry.title, count: current.count + 1 }));
    onRemoved(entry.id);
  }

  let board;
  if (isLoading) {
    // No frame or chips while loading: an empty Constellation has no chips (its frame sits
    // higher), so placeholders would vanish or jump once the saves arrive
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
          {/* Stays mounted, so every new count is announced. "Nothing pinned yet" shows only while
              focused (after the last removal), so the focus ring surrounds words. */}
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

          {/* Always rendered, so screen readers notice when the text appears */}
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
