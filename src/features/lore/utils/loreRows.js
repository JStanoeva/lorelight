// The columns every lore read selects. Shared by the lore and Constellation services, so an entry
// has the same fields wherever it was loaded.
export const LORE_COLUMNS =
  "id, author_id, project_id, folder_id, title, category, description, tags, image_url, is_public, created_at, updated_at";

// Supabase returns the embedded count as appreciations: [{ count: 3 }]; cards need appreciation_count: 3.
export function withAppreciationCount({ appreciations, ...entry }) {
  return { ...entry, appreciation_count: appreciations?.[0]?.count ?? 0 };
}
