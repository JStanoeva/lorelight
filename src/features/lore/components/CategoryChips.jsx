import { useEffect, useId, useRef } from "react";
import { LORE_CATEGORIES } from "../constants/categories.js";
import CategoryChip from "./CategoryChip.jsx";
import "../styles/category-chips.css";

// Room kept free at the row's right edge, where it fades out on phones (the 3.5rem mask in
// category-chips.css)
const FADE_WIDTH = 56;
// The row's 1rem left padding on phones (category-chips.css), which also covers its short left fade
const ROW_PADDING = 16;

// Scrolls the row just far enough that the chip sits clear of both faded edges. Only the row
// moves, never the page. On wide screens the row can't scroll, so this changes nothing.
function showChip(scroller, chip) {
  const visibleStart = scroller.scrollLeft + ROW_PADDING;
  const visibleEnd = scroller.scrollLeft + scroller.clientWidth - FADE_WIDTH;
  const chipEnd = chip.offsetLeft + chip.offsetWidth;

  if (chip.offsetLeft < visibleStart) {
    scroller.scrollTo({ left: chip.offsetLeft - ROW_PADDING });
  } else if (chipEnd > visibleEnd) {
    scroller.scrollTo({ left: chipEnd - scroller.clientWidth + FADE_WIDTH });
  }
}

// "All" plus the 12 categories as toggle buttons (aria-pressed), one pressed at a time.
// Pressing the pressed category again goes back to All. On wider screens they wrap into
// balanced, centred rows (7 + 6 from 768px); on phones they become one row that scrolls sideways.
// `counts` (optional, e.g. { character: 3 }, used by My Constellation) puts the number of entries
// on each chip and leaves out the categories without any (except the pressed one); "All" gets
// the total. Without it (the Lore Catalog) every category is shown, without numbers.
export default function CategoryChips({ value, onChange, counts, label = "Browse by category" }) {
  const scrollerRef = useRef(null);
  const labelId = useId();
  const categories = counts
    ? LORE_CATEGORIES.filter((category) => counts[category.value] > 0 || category.value === value)
    : LORE_CATEGORIES;
  const totalCount = counts ? Object.values(counts).reduce((sum, count) => sum + count, 0) : undefined;

  // On phones the pressed chip can sit outside the visible part of the row (after opening a
  // link with ?category=event, or after "Clear all"), so the row scrolls to show it. The chip
  // the user is on comes first: pressing the pressed chip again makes the far-away "All" the
  // pressed one, and the chip that keeps focus must stay in view.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const focused = document.activeElement;
    const chip = scroller.contains(focused) ? focused : scroller.querySelector('[aria-pressed="true"]');

    if (chip) {
      showChip(scroller, chip);
    }
  }, [value]);

  // Keyboard focus moves the row too: Tab doesn't scroll a chip that is already partly visible,
  // so it could stay under the fade
  function handleFocus(event) {
    showChip(event.currentTarget, event.target);
  }

  return (
    <div role="group" aria-labelledby={labelId} className="catalog-index site-column">
      <p id={labelId} className="catalog-index-label">
        {label}
      </p>
      <div ref={scrollerRef} onFocus={handleFocus} className="catalog-chips-scroller">
        <ul className="catalog-chips">
          <li>
            <CategoryChip
              label="All"
              starClassName="text-parchment-300"
              count={totalCount}
              isPressed={value === ""}
              onClick={() => onChange("")}
            />
          </li>
          {categories.map((category) => {
            const isPressed = value === category.value;

            return (
              <li key={category.value}>
                <CategoryChip
                  label={category.label}
                  starClassName={category.starClassName}
                  count={counts ? (counts[category.value] ?? 0) : undefined}
                  isPressed={isPressed}
                  onClick={() => onChange(isPressed ? "" : category.value)}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
