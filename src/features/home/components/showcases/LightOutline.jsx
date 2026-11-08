// Fills its positioned parent; pathLength="1" lets CSS draw it in, whatever the card's size
export default function LightOutline({ radius = 8 }) {
  return (
    <svg className="light-outline" aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="100%" height="100%" rx={radius} pathLength="1" />
    </svg>
  );
}
