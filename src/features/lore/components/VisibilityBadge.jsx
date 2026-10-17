// Shown only to the owner. `visibility` is "public", "private" or "hidden" (see getVisibility).
const BADGES = {
  public: { label: "Public", className: "bg-success/10 text-success ring-success/30" },
  private: { label: "Private", className: "bg-night-900 text-parchment-300 ring-night-500" },
  hidden: { label: "Hidden", className: "bg-night-900 text-lantern-300 ring-lantern-500/60" },
};

export default function VisibilityBadge({ visibility }) {
  const badge = BADGES[visibility] ?? BADGES.private;

  return (
    <span className={`badge shrink-0 ${badge.className}`}>
      {badge.label}
      {/* The short label alone doesn't say why a public entry is hidden */}
      {visibility === "hidden" && <span className="sr-only">: public, but its project is private</span>}
    </span>
  );
}
