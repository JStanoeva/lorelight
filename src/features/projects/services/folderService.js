import { supabase } from "../../../lib/supabase.js";
import { isValidUuid } from "../../../shared/utils/isValidUuid.js";

const FOLDER_COLUMNS = "id, project_id, name, created_at, updated_at";

// Row Level Security decides what comes back: the owner gets every folder, visitors only
// folders that hold at least one public entry (so private folder names never leak).
// The database sorts names alphabetically without caring about upper/lower case.
async function getFoldersByProject(projectId) {
  if (!isValidUuid(projectId)) {
    return [];
  }

  const { data, error } = await supabase
    .from("lore_folders")
    .select(FOLDER_COLUMNS)
    .eq("project_id", projectId)
    .order("name");

  if (error) {
    throw error;
  }

  return data;
}

async function createFolder(projectId, name) {
  const { data, error } = await supabase
    .from("lore_folders")
    .insert({ project_id: projectId, name })
    .select(FOLDER_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Returns null when no row was renamed: the folder doesn't exist or isn't the user's.
async function renameFolder(id, name) {
  if (!isValidUuid(id)) {
    return null;
  }

  const { data, error } = await supabase
    .from("lore_folders")
    .update({ name })
    .eq("id", id)
    .select(FOLDER_COLUMNS)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

// The folder's entries are kept: the database moves them to the top level of the project.
// Returns null when nothing was deleted: the folder doesn't exist or isn't the user's.
async function deleteFolder(id) {
  if (!isValidUuid(id)) {
    return null;
  }

  const { data, error } = await supabase
    .from("lore_folders")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export const folderService = { getFoldersByProject, createFolder, renameFolder, deleteFolder };
