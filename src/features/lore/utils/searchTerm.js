export const SEARCH_TERM_MAX = 100;

// Characters with a meaning in Supabase's filter syntax or LIKE patterns become "_" (any one
// character), so no search text can break the query. "50%" may then also find "500".
const SPECIAL_CHARACTERS = /[,(){}"\\%_*]/g;

// Control characters become spaces: Postgres text can't store a NUL, so the request would fail.
const CONTROL_CHARACTERS = /\p{Cc}/gu;

// "" means: don't search
export function toSearchTerm(text) {
  const term = String(text ?? "")
    .normalize("NFC")
    .replace(CONTROL_CHARACTERS, " ")
    .replace(SPECIAL_CHARACTERS, "_")
    .replace(/\s+/g, " ")
    .trim();

  // Array.from counts characters, not UTF-16 units, so an emoji is never cut in half.
  return Array.from(term).slice(0, SEARCH_TERM_MAX).join("").trim();
}
