import { useId } from "react";
import { createEmblemPrint } from "../utils/emblemPrint.js";
import { getCategory } from "../utils/getCategory.js";
import EmblemShapes from "./EmblemShapes.jsx";
import "../styles/lore-placeholder.css";

// The "Emblem Print": a pattern of the lore category's emblem (a cameo for characters, a crown for
// politics…), generated from `seed` (the entry id), so the same entry always gets the same print.
// Shown when an entry has no image or the image fails to load. The CSS picks what to draw from the
// placeholder's own size: the print, plus a large framed emblem on wide banners.
// The parent sets the size and must be `relative overflow-hidden`.
export default function LorePlaceholder({ seed, category }) {
  // Many placeholders share a page, so every symbol and pattern id must be unique.
  const idBase = `emblem-print-${useId()}`;
  const emblemId = `${idBase}-emblem`;
  const motifId = `${idBase}-motif`;
  const patternId = `${idBase}-pattern`;

  // getCategory falls back to "Other" for an unknown value, so the emblem and the colour always match.
  const { value, starClassName } = getCategory(category);
  const print = createEmblemPrint(seed, value);

  // Every line is drawn with currentColor, so the category's text colour paints the whole print.
  return (
    <div className={`emblem-print ${starClassName}`} aria-hidden="true">
      {/* The emblem and the motif, defined once and reused (<use>) by every layer below */}
      <svg className="emblem-print-defs" focusable="false">
        <defs>
          <symbol id={emblemId} viewBox="-50 -50 100 100" overflow="visible">
            <EmblemShapes shape={print.emblem} />
          </symbol>
          <symbol id={motifId} viewBox="-10 -10 20 20" overflow="visible">
            <EmblemShapes shape={print.motif} />
          </symbol>
        </defs>
      </svg>

      {/* Layer 1: the print. One tile in screen pixels, repeated edge to edge by the pattern */}
      <svg className="emblem-print-layer emblem-print-field" focusable="false">
        <defs>
          <pattern
            id={patternId}
            patternUnits="userSpaceOnUse"
            x={print.tile.x}
            y={print.tile.y}
            width={print.tile.width}
            height={print.tile.height}
            patternTransform={print.tile.transform}
          >
            <path
              d={print.rules}
              className={print.dash ? "emblem-print-rule emblem-print-rule--dots" : "emblem-print-rule"}
              strokeDasharray={print.dash}
            />
            {print.joints && (
              <path
                d={print.joints}
                className={print.hasGoldJoints ? "emblem-print-joint emblem-print-joint--gold" : "emblem-print-joint"}
              />
            )}
            <g opacity="0.5">
              {print.motifs.map((motif) => (
                <use
                  key={motif.key}
                  href={`#${motifId}`}
                  x={motif.x}
                  y={motif.y}
                  width={motif.size}
                  height={motif.size}
                  strokeWidth={motif.strokeWidth}
                />
              ))}
            </g>
            <g opacity={print.emblemOpacity}>
              {print.emblems.map((emblem) => (
                <use
                  key={emblem.key}
                  href={`#${emblemId}`}
                  x={emblem.offset}
                  y={emblem.offset}
                  width={emblem.size}
                  height={emblem.size}
                  strokeWidth={emblem.strokeWidth}
                  transform={emblem.transform}
                />
              ))}
            </g>
          </pattern>
        </defs>
        {/* The emblem's `ink` (loreEmblems.js) tones the bright colours down; the CSS scales the print
            up a little on large banners */}
        <g className="emblem-print-scale" opacity={print.emblem.ink}>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </g>
      </svg>

      <div className="emblem-print-vignette" style={{ background: print.vignette }} />

      {/* Layer 2 (wide banners only): one large emblem on a cartouche that interrupts the print.
          The 120-unit viewBox matches FEATURE_VIEWBOX in emblemPrint.js */}
      <div className="emblem-print-feature" style={{ left: print.feature.left }}>
        <svg viewBox="-60 -60 120 120" focusable="false">
          <path d={print.feature.shape.outer} className="emblem-print-feature-halo" />
          <path d={print.feature.shape.outer} className="emblem-print-feature-line" />
          <path d={print.feature.shape.inner} className="emblem-print-feature-gold" />
          <path d={print.feature.shape.beads} className="emblem-print-feature-beads" />
          <use
            href={`#${emblemId}`}
            x={print.feature.offset}
            y={print.feature.offset}
            width={print.feature.shape.emblemSize}
            height={print.feature.shape.emblemSize}
            strokeWidth={print.feature.strokeWidth}
          />
        </svg>
      </div>
    </div>
  );
}
