import { supabase } from "../../../lib/supabase.js";
import { isValidUuid } from "../../../shared/utils/isValidUuid.js";

const LORE_COLUMNS =
  "id, author_id, project_id, folder_id, title, category, description, tags, image_url, is_public, created_at, updated_at";

// Supabase returns the embedded count as appreciations: [{ count: 3 }]; cards need appreciation_count: 3.
function withAppreciationCount({ appreciations, ...entry }) {
  return { ...entry, appreciation_count: appreciations?.[0]?.count ?? 0 };
}

// Row Level Security decides what comes back: the owner gets every entry,
// visitors only the public entries of a public project.
async function getLoreByProject(projectId) {
  if (!isValidUuid(projectId)) {
    return [];
  }

  const { data, error } = await supabase
    .from("lore_entries")
    .select(`${LORE_COLUMNS}, appreciations(count)`)
    .eq("project_id", projectId)
    .order("title");

  if (error) {
    throw error;
  }

  return data.map(withAppreciationCount);
}

// A creator's lore, newest first. Row Level Security decides what comes back, as above.
async function getLoreByAuthor(authorId) {
  if (!isValidUuid(authorId)) {
    return [];
  }

  const { data, error } = await supabase
    .from("lore_entries")
    .select(`${LORE_COLUMNS}, appreciations(count)`)
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(withAppreciationCount);
}

// One entry with its author, project, folder and appreciation count (Lore Details, Edit Lore).
// Returns null when the entry doesn't exist or the user may not see it: a private entry,
// or an entry inside a private project, unless it is the user's own.
async function getLoreById(id) {
  if (!isValidUuid(id)) {
    return null;
  }

  const { data, error } = await supabase
    .from("lore_entries")
    .select(
      `${LORE_COLUMNS},
      author:profiles!lore_entries_author_id_fkey(id, username, display_name),
      project:projects!lore_entries_project_id_fkey(id, title, is_public),
      folder:lore_folders!lore_entries_folder_fkey(id, name),
      appreciations(count)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? withAppreciationCount(data) : null;
}

// `payload` comes from toLorePayload; the database also checks that the project is the user's own.
async function createLore(payload, authorId) {
  const { data, error } = await supabase
    .from("lore_entries")
    .insert({ ...payload, author_id: authorId })
    .select(LORE_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// `payload` may only contain the columns the database lets users update (project_id, folder_id,
// title, category, description, image_url, tags, is_public): build it with toLorePayload.
// Returns null when no row was updated: the entry doesn't exist or isn't the user's.
async function updateLore(id, payload) {
  if (!isValidUuid(id)) {
    return null;
  }

  const { data, error } = await supabase
    .from("lore_entries")
    .update(payload)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

// The database also deletes the entry's appreciations and Constellation saves.
// Returns null when nothing was deleted: the entry doesn't exist or isn't the user's.
async function deleteLore(id) {
  if (!isValidUuid(id)) {
    return null;
  }

  const { data, error } = await supabase
    .from("lore_entries")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export const loreService = {
  getLoreById,
  getLoreByProject,
  getLoreByAuthor,
  createLore,
  updateLore,
  deleteLore,
};
