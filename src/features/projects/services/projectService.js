import { supabase } from "../../../lib/supabase.js";
import { isValidUuid } from "../../../shared/utils/isValidUuid.js";

const PROJECT_COLUMNS =
  "id, owner_id, title, description, cover_url, genre, format, is_public, created_at, updated_at";

// Supabase returns the count as lore_entries: [{ count: 3 }]; RLS counts only the entries the
// viewer may see
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

// Returns null when the project doesn't exist or is someone else's private project
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

// Build `payload` with toProjectPayload: users may update only its columns. Returns null when
// no row was updated: the project doesn't exist or isn't the user's
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

// The database also deletes its folders and lore. Returns null when nothing was deleted: the
// project doesn't exist or isn't the user's
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

// One transaction (migration 006), so an entry added meanwhile can't be deleted with the project
// and a failure changes nothing. Returns null like deleteProject
async function moveLoreAndDeleteProject(id, targetProjectId) {
  if (!isValidUuid(id) || !isValidUuid(targetProjectId)) {
    return null;
  }

  // Moving the lore into the project being deleted would delete it too. Lowercase first: the
  // database treats "ABC…" and "abc…" as the same id
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
