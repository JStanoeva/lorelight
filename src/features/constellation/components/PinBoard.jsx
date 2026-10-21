import { useId, useMemo, useRef, useState } from "react";
import { getCategory } from "../../lore/utils/getCategory.js";
import { usePinPositions } from "../hooks/usePinPositions.js";
import { getPinLayout } from "../utils/pinLayout.js";
import { buildThreads, countByCategory } from "../utils/threads.js";
import { getThreadHint } from "../utils/constellationText.js";
import BoardFrame from "./BoardFrame.jsx";
import BoardThreads from "./BoardThreads.jsx";
import PinCard from "./PinCard.jsx";

// The category of one of the shown entries, by id ("" when it isn't on the board, e.g. removed)
function getCategoryOf(entries, entryId) {
  const entry = entries.find((item) => item.id === entryId);
  return entry ? getCategory(entry.category).value : "";
}

// The pin board with the shown entries: slightly tilted cards on a grid (so the reading and Tab
// order stays newest first, row by row), with the star-threads of each category behind them.
// Screen readers get a plain list of articles; the threads are decoration.
//   entries           the entries to show (already filtered by the chosen category)
//   selectedCategory  the chosen category ("" for all): its constellation glows
//   fallbackFocusRef  where focus goes when the last card is removed
//   onRemove(loreId)  returns a Promise; onRemoved(entry) runs once the database confirmed it
export default function PinBoard({
  entries,
  selectedCategory,
  isOwner,
  seed,
  plaque,
  fallbackFocusRef,
  onRemove,
  onRemoved,
}) {
  const headingId = useId();
  const surfaceRef = useRef(null);
  const listRef = useRef(null);
  // The cards' title links by entry id, so focus can move to a neighbour after a removal
  const titleLinksRef = useRef(new Map());
  // The card under the mouse and the card holding keyboard focus (entry ids, null for none). Kept
  // apart, so the mouse leaving one card doesn't switch off the glow of the card with focus.
  const [hoveredId, setHoveredId] = useState(null);
  const [focusedId, setFocusedId] = useState(null);

  const layoutKey = entries.map((entry) => entry.id).join(",");
  const pins = usePinPositions(surfaceRef, listRef, layoutKey);
  // The board re-renders on every hover, so the threads are only built again for new positions
  const threads = useMemo(() => buildThreads(entries, pins), [entries, pins]);
  // The card the mouse points at comes first, then the card with focus, then the chosen category
  const litCategory = getCategoryOf(entries, hoveredId) || getCategoryOf(entries, focusedId) || selectedCategory;
  const hasThread = Object.values(countByCategory(entries)).some((count) => count > 1);
  const categoryLabel = selectedCategory ? getCategory(selectedCategory).label : "";

  // The first of these entries whose card is still on the board and isn't waiting for its own
  // removal (two removals can overlap, and such a card leaves at the same moment)
  function findTitleLink(items) {
    return items
      .map((item) => titleLinksRef.current.get(item.id))
      .find((link) => link && !link.closest("[data-pending]"));
  }

  // Called right after the database confirmed a removal, while the card is still on screen. If
  // focus is in that card, it moves to the next card (or the one before it), or to
  // fallbackFocusRef when it was the last one, so it never falls back to the page itself.
  function handleRemoved(entry) {
    onRemoved(entry);

    // Looked up on the board as it is now: a card that was filtered away and back while it waited
    // is a new card, with its own title link
    const cell = titleLinksRef.current.get(entry.id)?.closest("[data-pin-cell]");
    if (!cell?.contains(document.activeElement)) {
      return;
    }

    const index = entries.findIndex((item) => item.id === entry.id);
    const nextLink = findTitleLink(entries.slice(index + 1));
    if (nextLink) {
      // The next card moves up into the removed card's place, right where the user is looking, so
      // the page shouldn't scroll to where that card is now (it would end up far below)
      nextLink.focus({ preventScroll: true });
      return;
    }

    // The card before it (or the count line) stays where it is, so the usual scrolling is right
    const previousLink = findTitleLink(entries.slice(0, Math.max(index, 0)).reverse());
    (previousLink ?? fallbackFocusRef.current)?.focus();
  }

  return (
    <BoardFrame seed={seed} plaque={plaque} surfaceRef={surfaceRef}>
      <BoardThreads threads={threads} litCategory={litCategory} />

      <h2 id={headingId} className="sr-only">
        Saved entries
      </h2>
      <ol
        ref={listRef}
        aria-labelledby={headingId}
        // With one or two cards, the columns shrink to the cards and sit in the middle
        className={entries.length < 3 ? "pin-list pin-list-few" : "pin-list"}
        style={{ "--pin-count": entries.length }}
        data-category={selectedCategory || undefined}
        // While a constellation glows, the other categories' pins fade (see .star-pin in the CSS)
        data-lit={litCategory || undefined}
      >
        {entries.map((entry) => {
          const category = getCategory(entry.category);
          const layout = getPinLayout(entry.id);

          return (
            <li
              key={entry.id}
              className="pin-item"
              // The card's hang, for the CSS
              style={{ "--tilt": `${layout.tilt}deg`, "--drop": `${layout.drop}rem` }}
              data-pin-cell={entry.id}
              onMouseEnter={() => setHoveredId(entry.id)}
              onMouseLeave={() => setHoveredId(null)}
              onFocus={() => setFocusedId(entry.id)}
              onBlur={() => setFocusedId(null)}
            >
              <PinCard
                entry={entry}
                isOwner={isOwner}
                isHighlighted={litCategory === category.value}
                linkRef={(link) => {
                  // React calls this with the link when the card appears and with null when it
                  // leaves, and also (null, then the link) on every re-render, because the
                  // function is new each time. That's harmless: the Map is complete after each
                  // render.
                  if (link) {
                    titleLinksRef.current.set(entry.id, link);
                  } else {
                    titleLinksRef.current.delete(entry.id);
                  }
                }}
                onRemove={onRemove}
                onRemoved={handleRemoved}
              />
              {/* Phones: with a category chosen, a straight thread down to the next card's pin,
                  in the same dotted stardust as a lit thread on the board (BoardThreads) */}
              <svg
                className={`pin-drop pin-thread ${category.starClassName}`}
                data-state="lit"
                aria-hidden="true"
                focusable="false"
              >
                <line x1="50%" y1="0" x2="50%" y2="100%" className="pin-thread-glow" />
                <line x1="50%" y1="0" x2="50%" y2="100%" className="pin-thread-dots" />
              </svg>
            </li>
          );
        })}
      </ol>

      {!hasThread && (
        <p className={selectedCategory ? "pin-board-hint" : "pin-board-hint pin-board-hint-all"}>
          {getThreadHint(isOwner, categoryLabel)}
        </p>
      )}
    </BoardFrame>
  );
}
