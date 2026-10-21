import { supabase } from "../../../lib/supabase.js";
import { isValidUuid } from "../../../shared/utils/isValidUuid.js";

const PROFILE_COLUMNS = "id, username, display_name, bio, avatar_url, star_color, created_at";

// Everyone may read profiles. Returns null when no profile has this id (e.g. a mistyped link).
async function getProfileById(userId) {
  if (!isValidUuid(userId)) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export const profileService = { getProfileById };
