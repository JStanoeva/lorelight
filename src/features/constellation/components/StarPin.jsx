import { PIN_STAR_PATH } from "../utils/pinLayout.js";

// The glowing star-pin that holds a card on the board, in its category's colour (`colorClassName`,
// a text colour class: the SVG paints with currentColor). `data-pin` lets usePinPositions find it,
// so the threads start and end here. Decorative: the card names its category in text.
export default function StarPin({ colorClassName }) {
  return (
    <span className={`star-pin ${colorClassName}`} data-pin="true" aria-hidden="true">
      <svg viewBox="-12 -12 24 24" focusable="false" className="star-pin-glyph">
        <circle r="11" className="star-pin-halo" />
        <path d={PIN_STAR_PATH} className="star-pin-star" />
        <circle r="1.9" className="star-pin-core" />
      </svg>
    </span>
  );
}
