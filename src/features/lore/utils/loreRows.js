export const LORE_COLUMNS =
  "id, author_id, project_id, folder_id, title, category, description, tags, image_url, is_public, created_at, updated_at";

// Supabase returns the count as appreciations: [{ count: 3 }]; cards need appreciation_count: 3.
export function withAppreciationCount({ appreciations, ...entry }) {
  return { ...entry, appreciation_count: appreciations?.[0]?.count ?? 0 };
}
