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

export const loreService = { getLoreByProject };
