import { supabase } from "../../../lib/supabase.js";
import { isValidUuid } from "../../../shared/utils/isValidUuid.js";
import { LORE_COLUMNS } from "../../lore/utils/loreRows.js";

// Postgres "unique violation": a user can save an entry to their Constellation only once.
const ALREADY_EXISTS = "23505";

// One save as the page needs it: the saved entry's fields (with its project and author), plus
// when it was saved.
function toSavedEntry({ created_at, lore }) {
  return { saved_at: created_at, ...lore };
}

// A user's Constellation: the entries they saved, most recently saved first. Everyone may read it,
// and only public lore of a public project can be in it (the database removes a save as soon as
// its entry or project turns private).
async function getConstellation(userId) {
  if (!isValidUuid(userId)) {
    return [];
  }

  const { data, error } = await supabase
    .from("constellation_saves")
    .select(
      `id, created_at,
      lore:lore_entries!constellation_saves_lore_id_fkey(
        ${LORE_COLUMNS},
        project:projects!lore_entries_project_id_fkey(id, title),
        author:profiles!lore_entries_author_id_fkey(id, username, display_name)
      )`,
    )
    .eq("user_id", userId)
    // Saves made in one statement (e.g. by a script) share the same created_at; ordering by id
    // after it keeps them in the same order on every request instead of swapping places.
    .order("created_at", { ascending: false })
    .order("id");

  if (error) {
    throw error;
  }

  // Row Level Security hides an entry that turned private a moment ago (its save is about to be
  // removed), and then the save comes back without it: leave that save out.
  return data.filter((row) => row.lore !== null).map(toSavedEntry);
}

// Whether the user has saved the entry. Guests have no user id, so the answer is false without
// a request. Saves are readable by everyone, so null means "not saved yet".
async function isSaved(loreId, userId) {
  if (!isValidUuid(loreId) || !isValidUuid(userId)) {
    return false;
  }

  const { data, error } = await supabase
    .from("constellation_saves")
    .select("id")
    .eq("lore_id", loreId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data !== null;
}

// The two writes get the loaded entry's id and the logged-in user's id, never text from the URL,
// so an invalid id would be a bug in the page: nothing is sent then.

// The database accepts it only for public lore in a public project (otherwise 42501).
async function saveLore(loreId, userId) {
  if (!isValidUuid(loreId) || !isValidUuid(userId)) {
    return;
  }

  const { error } = await supabase.from("constellation_saves").insert({ lore_id: loreId, user_id: userId });

  // 23505: the entry is already in the user's Constellation (e.g. saved in another tab), which is
  // what they wanted.
  if (error && error.code !== ALREADY_EXISTS) {
    throw error;
  }
}

// Deleting nothing (the save was already removed, e.g. in another tab, or by the database because
// the entry turned private) isn't an error either: the goal is reached, so there's no need to
// check how many rows were deleted.
async function unsaveLore(loreId, userId) {
  if (!isValidUuid(loreId) || !isValidUuid(userId)) {
    return;
  }

  const { error } = await supabase
    .from("constellation_saves")
    .delete()
    .eq("lore_id", loreId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export const constellationService = { getConstellation, isSaved, saveLore, unsaveLore };
