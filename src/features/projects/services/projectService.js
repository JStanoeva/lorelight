import { supabase } from "../../../lib/supabase.js";
import { isValidUuid } from "../../../shared/utils/isValidUuid.js";

const PROJECT_COLUMNS =
  "id, owner_id, title, description, cover_url, genre, format, is_public, created_at, updated_at";

// Supabase returns the embedded count as lore_entries: [{ count: 3 }]; cards need lore_count: 3.
// Row Level Security decides what is counted: the owner counts all their entries, visitors only public ones.
function withLoreCount({ lore_entries: loreEntries, ...project }) {
  return { ...project, lore_count: loreEntries?.[0]?.count ?? 0 };
}

async function getProjectsByOwner(ownerId) {
  if (!isValidUuid(ownerId)) {
    return [];
  }

  const { data, error } = await supabase
    .from("projects")
    .select(`${PROJECT_COLUMNS}, lore_entries(count)`)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(withLoreCount);
}

// Returns null when the project doesn't exist or is someone else's private project.
async function getProjectById(id) {
  if (!isValidUuid(id)) {
    return null;
  }

  const { data, error } = await supabase
    .from("projects")
    .select(`${PROJECT_COLUMNS}, owner:profiles!projects_owner_id_fkey(id, username, display_name)`)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function createProject(payload, ownerId) {
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...payload, owner_id: ownerId })
    .select(PROJECT_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// `payload` may only contain the columns the database lets users update
// (title, description, cover_url, genre, format, is_public): build it with toProjectPayload.
// Returns null when no row was updated: the project doesn't exist or isn't the user's.
async function updateProject(id, payload) {
  if (!isValidUuid(id)) {
    return null;
  }

  const { data, error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

// The database also deletes the project's folders and lore (with their appreciations and saves).
// Returns null when nothing was deleted: the project doesn't exist or isn't the user's.
async function deleteProject(id) {
  if (!isValidUuid(id)) {
    return null;
  }

  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

// One database function (migration 006) moves the lore and deletes the project in a single
// transaction, so an entry added to the project at the same moment can't be deleted with it,
// and if anything fails nothing changes. Returns null when the project doesn't exist or isn't
// the user's, like deleteProject.
async function moveLoreAndDeleteProject(id, targetProjectId) {
  if (!isValidUuid(id) || !isValidUuid(targetProjectId)) {
    return null;
  }

  // Moving the lore into the project that is about to be deleted would delete it too.
  // Lowercase first: the database treats "ABC…" and "abc…" as the same id.
  if (id.toLowerCase() === targetProjectId.toLowerCase()) {
    throw new Error("Choose a different project to move the lore to.");
  }

  const { data: isDeleted, error } = await supabase.rpc("move_lore_and_delete_project", {
    source_project_id: id,
    target_project_id: targetProjectId,
  });

  if (error) {
    throw error;
  }

  return isDeleted ? { id } : null;
}

export const projectService = {
  getProjectsByOwner,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  moveLoreAndDeleteProject,
};
