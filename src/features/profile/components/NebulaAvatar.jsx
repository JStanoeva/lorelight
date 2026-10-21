import { useId } from "react";
import { buildAvatarNebula, VIEW_SIZE } from "../utils/nebulaPattern.js";
import "../styles/nebula-avatar.css";

// The generated "Nebula Wash" avatar: a soft nebula seeded by `seed` (the user id), led by
// `colorHex` (the profile's star colour). It fills its parent, which sets the size and the frame
// shape and must be `position: relative; overflow: hidden` (like CoverImage's parents).
// Decorative (aria-hidden): the person's name is always written next to it.
export default function NebulaAvatar({ seed, colorHex }) {
  // A page can show several avatars, so every gradient and filter id must be unique.
  const uid = `nebula-avatar-${useId()}`;
  const nebula = buildAvatarNebula(seed, colorHex);

  return (
    <div className="nebula-avatar" aria-hidden="true">
      <svg
        className="nebula-avatar-layer"
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <defs>
          <linearGradient id={`${uid}-base`} gradientTransform={`rotate(${nebula.baseAngle} 0.5 0.5)`}>
            <stop offset="0" stopColor={nebula.base[0]} />
            <stop offset="1" stopColor={nebula.base[1]} />
          </linearGradient>

          {nebula.fields.map((field, index) => (
            <radialGradient key={index} id={`${uid}-field-${index}`}>
              <stop offset="0" stopColor={field.color} stopOpacity={field.strength} />
              <stop offset="0.45" stopColor={field.color} stopOpacity={field.strength * 0.45} />
              <stop offset="1" stopColor={field.color} stopOpacity="0" />
            </radialGradient>
          ))}

          <radialGradient id={`${uid}-dust`}>
            <stop offset="0" stopColor={nebula.dustColor} stopOpacity="1" />
            <stop offset="1" stopColor={nebula.dustColor} stopOpacity="0" />
          </radialGradient>

          <radialGradient id={`${uid}-halo`}>
            <stop offset="0" stopColor={nebula.starColor} stopOpacity="0.7" />
            <stop offset="1" stopColor={nebula.starColor} stopOpacity="0" />
          </radialGradient>

          {/* Darkens the rim a little, evenly all round, so any frame shape sits on a calm edge */}
          <radialGradient id={`${uid}-vignette`} r="0.72">
            <stop offset="0.55" stopColor={nebula.dustColor} stopOpacity="0" />
            <stop offset="1" stopColor={nebula.dustColor} stopOpacity="0.6" />
          </radialGradient>
        </defs>

        <rect width={VIEW_SIZE} height={VIEW_SIZE} fill={`url(#${uid}-base)`} />

        {nebula.fields.map((field, index) => (
          <g key={index} transform={`rotate(${field.rotate} ${field.cx} ${field.cy})`}>
            {field.lobes.map((lobe, lobeIndex) => (
              <ellipse
                key={lobeIndex}
                cx={field.cx + lobe.dx}
                cy={field.cy + lobe.dy}
                rx={lobe.rx}
                ry={lobe.ry}
                fill={`url(#${uid}-field-${index})`}
              />
            ))}
          </g>
        ))}

        {nebula.dustLane && (
          <ellipse
            cx={nebula.dustLane.cx}
            cy={nebula.dustLane.cy}
            rx={nebula.dustLane.rx}
            ry={nebula.dustLane.ry}
            transform={`rotate(${nebula.dustLane.rotate} ${nebula.dustLane.cx} ${nebula.dustLane.cy})`}
            fill={`url(#${uid}-dust)`}
            opacity={nebula.dustLane.strength}
          />
        )}

        {nebula.stars.map((star, index) => (
          <circle key={index} cx={star.cx} cy={star.cy} r={star.r} fill={star.color} opacity={star.opacity} />
        ))}

        {nebula.brightStar && (
          <g>
            <circle
              cx={nebula.brightStar.cx}
              cy={nebula.brightStar.cy}
              r={nebula.brightStar.halo}
              fill={`url(#${uid}-halo)`}
            />
            <circle cx={nebula.brightStar.cx} cy={nebula.brightStar.cy} r="1.1" fill={nebula.starColor} />
          </g>
        )}

        <rect width={VIEW_SIZE} height={VIEW_SIZE} fill={`url(#${uid}-vignette)`} />
      </svg>

      {/* Film grain in its own SVG without a viewBox, so the grain stays the same size at every avatar size */}
      <svg className="nebula-avatar-layer nebula-avatar-grain" focusable="false">
        <filter id={`${uid}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed={nebula.grainSeed} />
          {/* Keep the noise as white specks: colour channels become 1, alpha follows the noise */}
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.4 0 0 0 -0.55" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${uid}-grain)`} />
      </svg>
    </div>
  );
}
