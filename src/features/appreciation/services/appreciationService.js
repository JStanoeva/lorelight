import { supabase } from "../../../lib/supabase.js";
import { isValidUuid } from "../../../shared/utils/isValidUuid.js";

// Postgres "unique violation": a user can appreciate an entry only once.
const ALREADY_EXISTS = "23505";

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

export const appreciationService = { hasAppreciated, appreciate, removeAppreciation };
