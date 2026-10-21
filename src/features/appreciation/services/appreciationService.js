import { supabase } from "../../../lib/supabase.js";
import { isValidUuid } from "../../../shared/utils/isValidUuid.js";
import { LORE_COLUMNS, withAppreciationCount } from "../../lore/utils/loreRows.js";
import { isEffectivelyPublic } from "../../lore/utils/visibility.js";

// Postgres "unique violation": a user can appreciate an entry only once.
const ALREADY_EXISTS = "23505";

// One appreciation as the profile needs it: the appreciated entry's fields (with its project,
// author and appreciation count), plus when it was appreciated.
function toAppreciatedEntry({ created_at, lore }) {
  return { appreciated_at: created_at, ...withAppreciationCount(lore) };
}

// The lore a user appreciated, most recently appreciated first (the Appreciated tab of a profile).
// Everyone may read appreciations of public lore, so visitors see this list too.
async function getAppreciatedLore(userId) {
  if (!isValidUuid(userId)) {
    return [];
  }

  const { data, error } = await supabase
    .from("appreciations")
    .select(
      `id, created_at,
      lore:lore_entries!appreciations_lore_id_fkey(
        ${LORE_COLUMNS},
        project:projects!lore_entries_project_id_fkey(id, title, is_public),
        author:profiles!lore_entries_author_id_fkey(id, username, display_name),
        appreciations(count)
      )`,
    )
    .eq("user_id", userId)
    // Appreciations made in one statement (e.g. by a script) share the same created_at; ordering
    // by id after it keeps them in the same order on every request.
    .order("created_at", { ascending: false })
    .order("id");

  if (error) {
    throw error;
  }

  // Lowercase: the database treats "ABC…" and "abc…" as the same id, author_id comes back lowercase.
  const ownerId = userId.toLowerCase();

  // Row Level Security leaves out an entry the viewer may not see (e.g. it turned private), and
  // then the appreciation comes back without it: leave it out. It also lets every user read the
  // appreciations on their own lore, private entries included, so a visitor could find their own
  // private entry in someone else's list: keep only public lore and the person's own entries
  // (which only they can see when private).
  return data
    .filter((row) => row.lore !== null && (isEffectivelyPublic(row.lore) || row.lore.author_id === ownerId))
    .map(toAppreciatedEntry);
}

// Whether the user appreciates the entry. Guests have no user id, so the answer is false without
// a request. Users always see their own appreciations (Row Level Security), so null means "not yet".
async function hasAppreciated(loreId, userId) {
  if (!isValidUuid(loreId) || !isValidUuid(userId)) {
    return false;
  }

  const { data, error } = await supabase
    .from("appreciations")
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
async function appreciate(loreId, userId) {
  if (!isValidUuid(loreId) || !isValidUuid(userId)) {
    return;
  }

  const { error } = await supabase.from("appreciations").insert({ lore_id: loreId, user_id: userId });

  // 23505: the user already appreciates it (e.g. clicked in another tab), which is what they wanted.
  if (error && error.code !== ALREADY_EXISTS) {
    throw error;
  }
}

// Deleting nothing (the appreciation was already removed, e.g. in another tab) isn't an error
// either: the goal is reached, so there's no need to check how many rows were deleted.
async function removeAppreciation(loreId, userId) {
  if (!isValidUuid(loreId) || !isValidUuid(userId)) {
    return;
  }

  const { error } = await supabase
    .from("appreciations")
    .delete()
    .eq("lore_id", loreId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export const appreciationService = { getAppreciatedLore, hasAppreciated, appreciate, removeAppreciation };
