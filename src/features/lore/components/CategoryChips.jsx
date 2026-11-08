import { useEffect, useId, useRef } from "react";
import { LORE_CATEGORIES } from "../constants/categories.js";
import CategoryChip from "./CategoryChip.jsx";
import "../styles/category-chips.css";

// The row's right fade on phones (the 3.5rem mask in category-chips.css)
const FADE_WIDTH = 56;
// The row's 1rem left padding on phones, which also covers its short left fade
const ROW_PADDING = 16;

// Scrolls only the row, never the page, so the chip sits clear of both faded edges.
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

// counts is optional, e.g. { character: 3 }: it adds numbers and hides empty categories.
export default function CategoryChips({ value, onChange, counts, label = "Browse by category" }) {
  const scrollerRef = useRef(null);
  const labelId = useId();
  const categories = counts
    ? LORE_CATEGORIES.filter((category) => counts[category.value] > 0 || category.value === value)
    : LORE_CATEGORIES;
  const totalCount = counts ? Object.values(counts).reduce((sum, count) => sum + count, 0) : undefined;

  // Shows the pressed chip on phones (e.g. after ?category=event). The focused chip wins: pressing
  // the pressed chip again presses the far-away "All", but focus stays on the chip.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const focused = document.activeElement;
    const chip = scroller.contains(focused) ? focused : scroller.querySelector('[aria-pressed="true"]');

    if (chip) {
      showChip(scroller, chip);
    }
  }, [value]);

  // Tab doesn't scroll a chip that is already partly visible, so it could stay under the fade
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
