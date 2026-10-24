import {
  BAND_INNER,
  BAND_OUTER,
  HUB_RADIUS,
  LENS_RADIUS,
  LIMB_INNER,
  LIMB_OUTER,
  STAR_RING,
} from "../constants/orreryGeometry.js";
import { getNeighbourArcPath } from "../utils/constellationLayout.js";

const VIEW_BOX = "-500 -500 1000 1000";
// Fine graduation on the fixed outer ring: a tick every 5°, a longer one every 30°
const LIMB_TICKS = Array.from({ length: 72 }, (_, index) => index * 5);
// The longer ticks reach only a little inside the ring, so the longest category name never
// touches them, wherever the wheel has turned
const MAJOR_TICK_INNER = LIMB_INNER - 6;
const MAJOR_TICK_OUTER = LIMB_OUTER + 4;
// Hatching on the geared band around the lens: a tick every 4°
const BAND_HATCHES = Array.from({ length: 90 }, (_, index) => index * 4);
const BAND_DIAMONDS = [0, 90, 180, 270];

// The engraved metal of the orrery, all decorative (aria-hidden), in three layers:
// 1. the fixed outer ring with its graduation and the gold reading mark at the top,
// 2. a hatched band that is geared to the wheel and turns the other way, slower,
// 3. the turning wheel itself: the dotted orbit, faint arms from the hub and the neighbour
//    lines, which draw themselves in once and light up beside the chosen star.
// orrery.css rotates layers 2 and 3 with the --turn variable, so nothing here re-renders.
export default function OrreryEngraving({ layout, selectedIndex }) {
  return (
    <>
      <svg className="orrery-layer" viewBox={VIEW_BOX} aria-hidden="true" focusable="false">
        <circle r={LIMB_OUTER} className="orrery-ring orrery-ring-strong" />
        <circle r={LIMB_INNER} className="orrery-ring" />
        {LIMB_TICKS.map((degrees) =>
          degrees % 30 === 0 ? (
            <line
              key={degrees}
              y1={-MAJOR_TICK_INNER}
              y2={-MAJOR_TICK_OUTER}
              transform={`rotate(${degrees})`}
              className="orrery-tick orrery-tick-major"
            />
          ) : (
            <line
              key={degrees}
              y1={-LIMB_INNER}
              y2={-LIMB_OUTER}
              transform={`rotate(${degrees})`}
              className="orrery-tick"
            />
          ),
        )}
        <circle r={HUB_RADIUS} className="orrery-ring" />
        <circle r={HUB_RADIUS - 16} className="orrery-ring orrery-ring-dashed" />
        {/* The reading position: the chosen star turns to sit right under this mark */}
        <path d="M -11 -462 L 11 -462 L 0 -440 Z" className="orrery-fiducial" />
        <line y1={-432} y2={-392} className="orrery-reading-line" />
      </svg>

      <svg className="orrery-layer orrery-band" viewBox={VIEW_BOX} aria-hidden="true" focusable="false">
        <circle r={BAND_INNER} className="orrery-band-ring" />
        <circle r={BAND_OUTER} className="orrery-band-ring" />
        {BAND_HATCHES.map((degrees) => (
          <line
            key={degrees}
            y1={-BAND_INNER}
            y2={-BAND_OUTER}
            transform={`rotate(${degrees})`}
            className="orrery-band-hatch"
          />
        ))}
        {BAND_DIAMONDS.map((degrees) => (
          <path
            key={degrees}
            d={`M 0 ${-BAND_OUTER - 3} L 4 ${-(BAND_INNER + BAND_OUTER) / 2} L 0 ${-BAND_INNER + 3} L -4 ${-(BAND_INNER + BAND_OUTER) / 2} Z`}
            transform={`rotate(${degrees})`}
            className="orrery-band-diamond"
          />
        ))}
      </svg>

      <svg className="orrery-layer orrery-rete" viewBox={VIEW_BOX} aria-hidden="true" focusable="false">
        <circle r={STAR_RING} className="orrery-track" />
        {layout.stars.map((star) => (
          <line
            key={star.angle}
            y1={-HUB_RADIUS - 8}
            y2={-LENS_RADIUS + 2}
            transform={`rotate(${star.angle})`}
            className="orrery-spoke"
          />
        ))}
        {layout.lines.map(([from, to]) => (
          <path
            key={`${from}-${to}`}
            d={getNeighbourArcPath(layout.stars[from], layout.stars[to], STAR_RING)}
            pathLength="1"
            className={
              from === selectedIndex || to === selectedIndex
                ? "orrery-thread orrery-thread-lit"
                : "orrery-thread"
            }
            style={{ "--draw-delay": `${(from * 0.08).toFixed(2)}s` }}
          />
        ))}
      </svg>
    </>
  );
}
