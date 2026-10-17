import { ICONS } from "../constants/icons.js";

// A decorative icon: the text or aria-label next to it carries the meaning.
export default function Icon({ name, size = 16, className = "" }) {
  const icon = ICONS[name];

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      fill={icon.filled ? "currentColor" : "none"}
      stroke={icon.filled ? "none" : "currentColor"}
      strokeWidth={icon.strokeWidth ?? 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={icon.path} />
    </svg>
  );
}
