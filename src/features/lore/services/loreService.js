import { supabase } from "../../../lib/supabase.js";
import { isValidUuid } from "../../../shared/utils/isValidUuid.js";
import { LORE_CATEGORIES } from "../constants/categories.js";
import { DEFAULT_SORT } from "../constants/sortOptions.js";
import { LORE_COLUMNS, withAppreciationCount } from "../utils/loreRows.js";
import { toSearchTerm } from "../utils/searchTerm.js";

// The Lore Catalog: public entries of public projects, each with its project, author and
// appreciation count. Row Level Security would also return the user's own private entries,
// so both rules are explicit filters here; `!inner` drops entries whose project is filtered out.
// q: title or description contains it (any letter case), or one tag equals it exactly.
// category: one of the 12 values, else ignored. sort: "oldest" or newest first. limit: optional.
async function getPublicLore({ q = "", category = "", sort = DEFAULT_SORT, limit } = {}) {
  let query = supabase
    .from("lore_entries")
    .select(
      `${LORE_COLUMNS},
      project:projects!lore_entries_project_id_fkey!inner(id, title),
      author:profiles!lore_entries_author_id_fkey(id, username, display_name),
      appreciations(count)`,
    )
    .eq("is_public", true)
    .eq("project.is_public", true);

  if (LORE_CATEGORIES.some((item) => item.value === category)) {
    query = query.eq("category", category);
  }

  // toSearchTerm replaces the characters that would break the filter, so it's safe to insert here.
  const term = toSearchTerm(q);

  // A search made only of those characters (e.g. "%", now "_") has nothing left to look for: no
  // results, rather than a wildcard that matches the whole catalog.
  if (q.trim() && !term.replace(/_/g, "").trim()) {
    return [];
  }

  if (term) {
    // Tags only hold letters, numbers, spaces and hyphens, so a term with "_" can't equal one.
    const tagFilter = term.includes("_") ? "" : `,tags.cs.{"${term.toLowerCase()}"}`;
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%${tagFilter}`);
  }

  // Entries saved in one statement (e.g. by a script) share the same created_at; ordering by id
  // after it keeps them in the same order on every request instead of swapping places.
  query = query.order("created_at", { ascending: sort === "oldest" }).order("id");

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data.map(withAppreciationCount);
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
  getPublicLore,
  getLoreById,
  getLoreByProject,
  getLoreByAuthor,
  createLore,
  updateLore,
  deleteLore,
};
