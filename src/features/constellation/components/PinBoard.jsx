import { useId, useMemo, useRef, useState } from "react";
import { getCategory } from "../../lore/utils/getCategory.js";
import { usePinPositions } from "../hooks/usePinPositions.js";
import { getPinLayout } from "../utils/pinLayout.js";
import { buildThreads, countByCategory } from "../utils/threads.js";
import { getThreadHint } from "../utils/constellationText.js";
import BoardFrame from "./BoardFrame.jsx";
import BoardThreads from "./BoardThreads.jsx";
import PinCard from "./PinCard.jsx";

function getCategoryOf(entries, entryId) {
  const entry = entries.find((item) => item.id === entryId);
  return entry ? getCategory(entry.category).value : "";
}

// A real grid under the tilted cards keeps the reading and Tab order newest first, row by row.
// onRemove(loreId) returns a Promise; onRemoved(entry) runs once the database confirmed it.
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
  // Kept apart, so the mouse leaving one card doesn't switch off the glow of the focused card
  const [hoveredId, setHoveredId] = useState(null);
  const [focusedId, setFocusedId] = useState(null);

  const layoutKey = entries.map((entry) => entry.id).join(",");
  const pins = usePinPositions(surfaceRef, listRef, layoutKey);
  // The board re-renders on every hover; rebuild the threads only for new positions
  const threads = useMemo(() => buildThreads(entries, pins), [entries, pins]);
  const litCategory = getCategoryOf(entries, hoveredId) || getCategoryOf(entries, focusedId) || selectedCategory;
  const hasThread = Object.values(countByCategory(entries)).some((count) => count > 1);
  const categoryLabel = selectedCategory ? getCategory(selectedCategory).label : "";

  // Skips cards waiting for their own removal: two removals can overlap, and such a card is leaving
  function findTitleLink(items) {
    return items
      .map((item) => titleLinksRef.current.get(item.id))
      .find((link) => link && !link.closest("[data-pending]"));
  }

  // Runs while the removed card is still on screen: if it holds focus, focus moves to the next
  // card, the one before, or fallbackFocusRef, so it never falls back to the page
  function handleRemoved(entry) {
    onRemoved(entry);

    // Looked up now: a card filtered away and back while it waited is a new card with a new link
    const cell = titleLinksRef.current.get(entry.id)?.closest("[data-pin-cell]");
    if (!cell?.contains(document.activeElement)) {
      return;
    }

    const index = entries.findIndex((item) => item.id === entry.id);
    const nextLink = findTitleLink(entries.slice(index + 1));
    if (nextLink) {
      // The next card moves up into the removed card's place, so don't scroll to where it is now
      nextLink.focus({ preventScroll: true });
      return;
    }

    // The card before (or the count line) doesn't move, so the usual scrolling is right
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
        className={entries.length < 3 ? "pin-list pin-list-few" : "pin-list"}
        style={{ "--pin-count": entries.length }}
        data-category={selectedCategory || undefined}
        data-lit={litCategory || undefined}
      >
        {entries.map((entry) => {
          const category = getCategory(entry.category);
          const layout = getPinLayout(entry.id);

          return (
            <li
              key={entry.id}
              className="pin-item"
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
                  // A new function each render, so React calls it with null, then the link, every
                  // time: harmless, the Map is complete after each render
                  if (link) {
                    titleLinksRef.current.set(entry.id, link);
                  } else {
                    titleLinksRef.current.delete(entry.id);
                  }
                }}
                onRemove={onRemove}
                onRemoved={handleRemoved}
              />
              {/* One column, a category chosen: a straight thread down to the next card's pin */}
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
