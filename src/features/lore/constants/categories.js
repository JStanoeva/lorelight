// Mirrors the lore_entries_category_valid check constraint (supabase/migrations/001_tables.sql), same order.
// Class names are written out in full so Tailwind's scanner can find them.
export const LORE_CATEGORIES = [
  {
    value: "character",
    label: "Character",
    badgeClassName: "bg-rose-500/15 text-rose-200 ring-rose-400/30",
    starClassName: "text-rose-300",
  },
  {
    value: "location",
    label: "Location",
    badgeClassName: "bg-teal-500/15 text-teal-200 ring-teal-400/30",
    starClassName: "text-teal-300",
  },
  {
    value: "faction",
    label: "Faction",
    badgeClassName: "bg-violet-500/15 text-violet-200 ring-violet-400/30",
    starClassName: "text-violet-300",
  },
  {
    value: "history",
    label: "History",
    badgeClassName: "bg-amber-500/15 text-amber-200 ring-amber-400/30",
    starClassName: "text-amber-300",
  },
  {
    value: "religion",
    label: "Religion",
    badgeClassName: "bg-yellow-500/15 text-yellow-200 ring-yellow-400/30",
    starClassName: "text-yellow-300",
  },
  {
    value: "politics",
    label: "Politics",
    badgeClassName: "bg-red-500/15 text-red-200 ring-red-400/30",
    starClassName: "text-red-300",
  },
  {
    value: "culture",
    label: "Culture",
    badgeClassName: "bg-orange-500/15 text-orange-200 ring-orange-400/30",
    starClassName: "text-orange-300",
  },
  {
    value: "technology",
    label: "Technology",
    badgeClassName: "bg-cyan-500/15 text-cyan-200 ring-cyan-400/30",
    starClassName: "text-cyan-300",
  },
  {
    value: "artifact",
    label: "Artifact",
    badgeClassName: "bg-fuchsia-500/15 text-fuchsia-200 ring-fuchsia-400/30",
    starClassName: "text-fuchsia-300",
  },
  {
    value: "creature",
    label: "Creature",
    badgeClassName: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
    starClassName: "text-emerald-300",
  },
  {
    value: "event",
    label: "Event",
    badgeClassName: "bg-sky-500/15 text-sky-200 ring-sky-400/30",
    starClassName: "text-sky-300",
  },
  {
    value: "other",
    label: "Other",
    badgeClassName: "bg-slate-500/15 text-slate-200 ring-slate-400/30",
    starClassName: "text-slate-300",
  },
];
