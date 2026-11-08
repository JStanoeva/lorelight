import { supabase } from "../../../lib/supabase.js";
import { isValidUuid } from "../../../shared/utils/isValidUuid.js";
import { LORE_COLUMNS } from "../../lore/utils/loreRows.js";

// Postgres "unique violation": a user can save an entry to their Constellation only once
const ALREADY_EXISTS = "23505";

function toSavedEntry({ created_at, lore }) {
  return { saved_at: created_at, ...lore };
}

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
    // Saves made in one statement share created_at; the id keeps their order stable
    .order("created_at", { ascending: false })
    .order("id");

  if (error) {
    throw error;
  }

  // Row Level Security hides an entry that just turned private (its save is about to be removed),
  // so that save comes back without its lore: leave it out
  return data.filter((row) => row.lore !== null).map(toSavedEntry);
}

// Guests have no user id, so they get false without a request. Saves are readable by everyone,
// so null means "not saved".
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

// The writes get ids from loaded data, never from the URL, so an invalid id is a bug: send nothing

// The database accepts it only for public lore in a public project (otherwise 42501)
async function saveLore(loreId, userId) {
  if (!isValidUuid(loreId) || !isValidUuid(userId)) {
    return;
  }

  const { error } = await supabase.from("constellation_saves").insert({ lore_id: loreId, user_id: userId });

  // Already saved (e.g. in another tab) is what the user wanted
  if (error && error.code !== ALREADY_EXISTS) {
    throw error;
  }
}

// Deleting nothing (already removed in another tab, or by the database) isn't an error: the goal
// is reached, so the deleted row count isn't checked
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
