import { supabase } from "../../../lib/supabase.js";
import { isValidUuid } from "../../../shared/utils/isValidUuid.js";
import { LORE_COLUMNS, withAppreciationCount } from "../../lore/utils/loreRows.js";
import { isEffectivelyPublic } from "../../lore/utils/visibility.js";

// Postgres "unique violation": a user can appreciate an entry only once
const ALREADY_EXISTS = "23505";

function toAppreciatedEntry({ created_at, lore }) {
  return { appreciated_at: created_at, ...withAppreciationCount(lore) };
}

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
    // Rows inserted in one statement share created_at; id keeps their order stable
    .order("created_at", { ascending: false })
    .order("id");

  if (error) {
    throw error;
  }

  // Lowercase, since author_id comes back lowercase while the given id may not be
  const ownerId = userId.toLowerCase();

  // RLS returns lore as null when the viewer can't see it, but shows viewers appreciations of their
  // own private lore, so keep only public lore and the profile owner's own entries
  return data
    .filter((row) => row.lore !== null && (isEffectivelyPublic(row.lore) || row.lore.author_id === ownerId))
    .map(toAppreciatedEntry);
}

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

// The writes get ids from loaded data, never from the URL, so an invalid id is a bug: send nothing

async function appreciate(loreId, userId) {
  if (!isValidUuid(loreId) || !isValidUuid(userId)) {
    return;
  }

  const { error } = await supabase.from("appreciations").insert({ lore_id: loreId, user_id: userId });

  // Already appreciated (e.g. in another tab) is what the user wanted
  if (error && error.code !== ALREADY_EXISTS) {
    throw error;
  }
}

// Deleting nothing (already removed, e.g. in another tab) isn't an error: the goal is reached
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
