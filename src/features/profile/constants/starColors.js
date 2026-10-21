// Mirrors the profiles_star_color_valid check constraint
// (supabase/migrations/007_profile_avatar_and_star_color.sql), same order. A creator's accent colour.
export const STAR_COLORS = [
  { value: "gold", label: "Lantern Gold", hex: "#e8c170" },
  { value: "violet", label: "Nebula Violet", hex: "#d3a3ec" },
  { value: "teal", label: "Aurora Teal", hex: "#5eead4" },
  { value: "rose", label: "Rose Dawn", hex: "#fda4af" },
  { value: "blue", label: "Comet Blue", hex: "#93c5fd" },
  { value: "silver", label: "Moonlight Silver", hex: "#cbd5e1" },
];

// The database default
export const DEFAULT_STAR_COLOR = "gold";
