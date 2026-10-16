import { useId } from "react";
import { createSigil } from "../utils/sigil.js";
import "../styles/sigil.css";

// The "Archive Sigil": a seal generated from `seed` (a record id), so every project gets its own,
// and the same one on every visit. Shown when there is no image or the image fails to load.
// `tintClassName` is a text colour class (a lore category's starClassName); without it the seal is gold.
// The parent sets the size and must be `relative overflow-hidden`.
export default function ImagePlaceholder({ seed, tintClassName = "" }) {
  // Many placeholders share a page, so every gradient and pattern id must be unique.
  const idBase = `sigil-${useId()}`;
  const textureId = `${idBase}-texture`;
  const glowId = `${idBase}-glow`;

  const isTinted = Boolean(tintClassName);
  const sigil = createSigil(seed, isTinted);

  // Every line below is drawn with currentColor, so this one colour paints the whole seal.
  const rootClassName = isTinted ? `sigil ${tintClassName}` : "sigil";
  const rootStyle = isTinted ? undefined : { color: sigil.ink };

  return (
    <div className={rootClassName} style={rootStyle} aria-hidden="true">
      {/* Layer 1: fine texture in screen pixels, so it stays delicate at every size */}
      <svg className="sigil-layer" focusable="false">
        <defs>
          <pattern
            id={textureId}
            x="50%"
            y="50%"
            width={sigil.texture.size}
            height={sigil.texture.size}
            patternUnits="userSpaceOnUse"
          >
            <path d={sigil.texture.path} className="sigil-texture-ink" strokeWidth={sigil.texture.strokeWidth} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${textureId})`} opacity={sigil.textureOpacity} />
      </svg>

      {/* Layer 2: the seal. "meet" keeps it whole and centred at any aspect ratio, and anything
          drawn outside the viewBox (glow, echo rings, meridian) fills the extra width. */}
      <svg className="sigil-layer" viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid meet" focusable="false">
        <defs>
          {/* User-space units, so the centre disc below samples exactly the same colours */}
          <radialGradient id={glowId} gradientUnits="userSpaceOnUse" cx="0" cy="0" r="180">
            <stop offset="0" stopColor={sigil.glow.color} stopOpacity={sigil.glow.opacity} />
            <stop offset="0.5" stopColor={sigil.glow.color} stopOpacity={sigil.glow.opacity * 0.35} />
            <stop offset="1" stopColor={sigil.glow.color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle r="180" fill={`url(#${glowId})`} />

        <g className="sigil-detail" opacity="0.18">
          {sigil.echoRings.map((radius) => (
            <circle key={radius} r={radius} className="sigil-line" />
          ))}
          {sigil.echoBeads && <path d={sigil.echoBeads} className="sigil-beads" />}
        </g>

        {sigil.meridian && (
          <g opacity="0.42">
            <path d={sigil.meridian.lines} className="sigil-line" />
            <path d={sigil.meridian.lozenges} fill="currentColor" />
          </g>
        )}

        <g opacity="0.6">
          {sigil.rings.map((ring) => (
            <circle
              key={ring.radius}
              r={ring.radius}
              className={ring.isBold ? "sigil-line sigil-line--bold" : "sigil-line"}
            />
          ))}
          {sigil.borderBeads && <path d={sigil.borderBeads} className="sigil-beads sigil-detail" />}
        </g>

        <g opacity="0.7">
          <path d={sigil.rim.minor} className={`${sigil.rim.className} sigil-detail`} />
          <path d={sigil.rim.major} className="sigil-line sigil-line--bold" />
        </g>

        <g opacity="0.9">
          {sigil.spokes && <path d={sigil.spokes} className="sigil-line" opacity="0.6" />}
          {sigil.figure.paths.map((path) => (
            <path key={path} d={path} className="sigil-line sigil-line--bold" />
          ))}
          {sigil.figure.circles.map((circle) => (
            <circle
              key={`${circle.cx},${circle.cy}`}
              cx={circle.cx}
              cy={circle.cy}
              r={circle.r}
              className="sigil-line sigil-line--bold"
            />
          ))}
          {sigil.vertexDots && <path d={sigil.vertexDots} className="sigil-beads sigil-beads--large" />}
        </g>

        {/* Centre: a clean disc (background + the same glow) under the logo's star, a ring or a small seal */}
        <circle r={sigil.hubRadius} className="sigil-hub" />
        <circle r={sigil.hubRadius} fill={`url(#${glowId})`} />
        {sigil.center.type === "ring" ? (
          <g>
            <circle r={sigil.hubRadius - 4} className="sigil-line sigil-line--bold" />
            <circle r="2.4" fill={sigil.accent} />
          </g>
        ) : (
          <path
            d={sigil.center.path}
            fill={sigil.center.type === "star" ? sigil.accent : "none"}
            className={sigil.center.type === "seal" ? "sigil-line sigil-line--bold" : undefined}
          />
        )}
      </svg>

      <div className="sigil-vignette" />
      {sigil.frame !== "none" && <div className={`sigil-frame sigil-frame--${sigil.frame}`} />}
    </div>
  );
}
