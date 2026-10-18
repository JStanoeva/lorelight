// The longest search term the catalog sends; a longer search is cut to this many characters.
export const SEARCH_TERM_MAX = 100;

// Characters with a meaning in Supabase's filter syntax (, ( ) { } " \) or in LIKE patterns
// (% _ * are wildcards). Each one becomes "_" (LIKE's "any one character"), which means nothing
// in the filter syntax: no search text can break the query, and "taxes, flood" still finds
// "taxes, flood". A "_" may also match another character ("50%" finds "500" too).
const SPECIAL_CHARACTERS = /[,(){}"\\%_*]/g;

// Control characters (a tab, a NUL) become spaces: a NUL can't be stored in Postgres text, so it
// would make the request fail.
const CONTROL_CHARACTERS = /\p{Cc}/gu;

// Turns the text from the search box into a safe search term ("" means: don't search).
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
