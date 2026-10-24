// A line of lavender light that traces a card's outline. It fills its positioned parent; the
// rect's pathLength="1" lets CSS draw it in with stroke-dashoffset, whatever the card's size.
export default function LightOutline({ radius = 8 }) {
  return (
    <svg className="light-outline" aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="100%" height="100%" rx={radius} pathLength="1" />
    </svg>
  );
}
