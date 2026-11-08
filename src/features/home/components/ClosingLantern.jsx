import { useId } from "react";
import { useInView } from "../../../shared/hooks/useInView.js";
import { useIsPageVisible } from "../../../shared/hooks/useIsPageVisible.js";
import {
  ARCH_LINES,
  DETAIL_LINES,
  ENGRAVED_STAR_PATHS,
  FILIGREE,
  FRAME_GLOW,
  GLASS,
  GLINT_ARC,
  GLINT_STAR_PATH,
  GOLD,
  GRADIENTS,
  HALO_RADIUS,
  INK,
  LIGHT,
  METAL_BACK,
  METAL_FRONT,
  OUTLINE,
  PANE_FACETS,
  RING_GROOVE,
  RIVETS,
  SIDE_PANES,
  SPANDRELS,
  SPARKLE_PATH,
  SPILL_LINES,
  STAR_CORE_RADIUS,
  STAR_EDGE,
  STAR_FACETS,
  STAR_GLOW_RADIUS,
  STAR_OUTLINE,
  VIEWBOX,
} from "../constants/lanternShapes.js";
import { useHomeMotion } from "../hooks/useHomeMotion.js";
import "../styles/closing-lantern.css";

const UNLIT_GLASS = "#1b1045";
const SPARKLES = ["roof", "post", "sill"];

// Every animation lives in closing-lantern.css and targets the layer classes below; with
// reduced motion the lantern is simply lit.
export default function ClosingLantern() {
  const { isMotionAllowed } = useHomeMotion();
  const [setRootElement, isInView] = useInView("120px");
  const isPageVisible = useIsPageVisible();
  const isMoving = isMotionAllowed && isInView && isPageVisible;

  // Gradient ids must be unique on the page; React 19's useId values (like _r_0_) work in url(#…)
  const idPrefix = `lantern${useId()}`;
  const paint = (id) => `url(#${idPrefix}-${id})`;

  return (
    <svg
      ref={setRootElement}
      className="lantern"
      data-motion={isMoving ? "running" : "paused"}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {GRADIENTS.map(([id, kind, attributes, stops]) => {
          const Gradient = kind === "linear" ? "linearGradient" : "radialGradient";
          return (
            <Gradient key={id} id={`${idPrefix}-${id}`} {...attributes}>
              {stops.map(([offset, color, opacity]) => (
                <stop key={offset} offset={offset} stopColor={color} stopOpacity={opacity} />
              ))}
            </Gradient>
          );
        })}
      </defs>

      <g className="lantern-metal" stroke={INK} strokeWidth="3" strokeLinejoin="round" paintOrder="stroke">
        {METAL_BACK.map(([d, fill]) => (
          <path key={d} d={d} fill={paint(fill)} fillRule="evenodd" />
        ))}
        <path d={GLASS} fill={UNLIT_GLASS} stroke="none" />
      </g>

      <g className="lantern-glass">
        <path d={GLASS} fill={paint("glass")} />
        {SIDE_PANES.map(([d, fill]) => (
          <path key={d} d={d} fill={paint(fill)} />
        ))}
        {PANE_FACETS.map(([d, fill, opacity]) => (
          <path key={d} d={d} fill={fill} fillOpacity={opacity} />
        ))}
      </g>

      <g className="lantern-metal">
        <path d={GLASS} fill={paint("glassShade")} />
        <g fill={paint("frieze")} stroke={INK} strokeWidth="3" strokeLinejoin="round" paintOrder="stroke">
          {SPANDRELS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g stroke={INK} strokeWidth="3" strokeLinejoin="round" paintOrder="stroke">
          {METAL_FRONT.map(([d, fill]) => (
            <path key={d} d={d} fill={paint(fill)} />
          ))}
        </g>
      </g>

      <g className="lantern-glow">
        <path d={FRAME_GLOW} fill={paint("frameGlow")} />
        <circle className="lantern-glow-breath" cx={LIGHT.x} cy={LIGHT.y} r={HALO_RADIUS} fill={paint("halo")} />
      </g>

      {/* An umber understroke, then the gold; pathLength="1" lets the CSS draw each line in */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g stroke={INK} strokeWidth="7">
          {OUTLINE.map((d) => (
            <path key={d} className="lantern-ink" pathLength="1" d={d} />
          ))}
        </g>
        <g stroke={INK} strokeWidth="4.2" strokeOpacity="0.85">
          {DETAIL_LINES.map((d) => (
            <path key={d} className="lantern-ink lantern-ink-detail" pathLength="1" d={d} />
          ))}
        </g>
        <g stroke={GOLD} strokeWidth="2.6">
          {OUTLINE.map((d) => (
            <path key={d} className="lantern-ink" pathLength="1" d={d} />
          ))}
        </g>
        <g stroke={GOLD} strokeWidth="1.8">
          {[...DETAIL_LINES, ...ARCH_LINES].map((d) => (
            <path key={d} className="lantern-ink lantern-ink-detail" pathLength="1" d={d} />
          ))}
        </g>
        <g className="lantern-engraving">
          <path d={RING_GROOVE} stroke={INK} strokeOpacity="0.5" strokeWidth="1.4" />
          <g stroke={GOLD} strokeWidth="1.5" strokeOpacity="0.9">
            {FILIGREE.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </g>
        <g className="lantern-spill" stroke={paint("spill")} strokeWidth="2.2">
          {SPILL_LINES.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </g>

      <g className="lantern-engraving">
        <g fill={GOLD}>
          {ENGRAVED_STAR_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g fill={GOLD} stroke={INK} strokeWidth="1.6">
          {RIVETS.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2.8" />
          ))}
        </g>
      </g>

      {/* The outer group ignites in the intro, the inner one breathes afterwards */}
      <g className="lantern-star">
        <g className="lantern-star-breath">
          <circle cx={LIGHT.x} cy={LIGHT.y} r={STAR_GLOW_RADIUS} fill={paint("starGlow")} />
          <path d={STAR_OUTLINE} fill="none" stroke={STAR_EDGE} strokeOpacity="0.55" strokeWidth="3" strokeLinejoin="round" />
          {STAR_FACETS.map(({ d, fill }) => (
            <path key={d} d={d} fill={fill} />
          ))}
          <circle cx={LIGHT.x} cy={LIGHT.y} r={STAR_CORE_RADIUS} fill={paint("starCore")} />
        </g>
      </g>

      <g className="lantern-pen" fill="none" strokeLinecap="round">
        {OUTLINE.map((d) => (
          <g key={d}>
            <path pathLength="1" d={d} stroke={GOLD} strokeOpacity="0.35" strokeWidth="16" />
            <path pathLength="1" d={d} stroke="#fff7e0" strokeWidth="5" />
          </g>
        ))}
      </g>

      {SPARKLES.map((name) => (
        <g key={name} className={`lantern-sparkle lantern-sparkle-${name}`}>
          <circle r="14" fill={paint("sparkle")} />
          <path d={SPARKLE_PATH} fill="#fff8e6" />
        </g>
      ))}
      <path className="lantern-glint-arc" d={GLINT_ARC} fill="none" stroke="#fff6dc" strokeWidth="3" strokeLinecap="round" />
      <g className="lantern-glint-star">
        <circle r="14" fill={paint("sparkle")} />
        <path d={GLINT_STAR_PATH} fill="#fffaf0" />
      </g>
    </svg>
  );
}
