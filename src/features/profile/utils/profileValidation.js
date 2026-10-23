import { countCharacters, isHttpUrl } from "../../../shared/utils/validators.js";
import { STAR_COLORS } from "../constants/starColors.js";
import { getStarColor } from "./getStarColor.js";

// The same limits as the database check constraints (README §8).
export const DISPLAY_NAME_MAX = 50;
export const BIO_MAX = 500;

export function validateProfile(values) {
  const errors = {};

  const displayNameLength = countCharacters(values.display_name.trim());
  if (displayNameLength === 0) {
    errors.display_name = "Enter a display name.";
  } else if (displayNameLength > DISPLAY_NAME_MAX) {
    errors.display_name = `The display name can be at most ${DISPLAY_NAME_MAX} characters.`;
  }

  if (countCharacters(values.bio.trim()) > BIO_MAX) {
    errors.bio = `The bio can be at most ${BIO_MAX} characters.`;
  }

  const avatarUrl = values.avatar_url.trim();
  if (avatarUrl && !isHttpUrl(avatarUrl)) {
    errors.avatar_url = "Enter a full link that starts with http:// or https://.";
  }

  if (!STAR_COLORS.some((color) => color.value === values.star_color)) {
    errors.star_color = "Choose one of the star colours.";
  }

  return errors;
}

// The clean database row: trimmed text, and null (never "") for empty optional fields,
// because the database rejects "" as an avatar link.
export function toProfilePayload(values) {
  return {
    display_name: values.display_name.trim(),
    bio: values.bio.trim() || null,
    avatar_url: values.avatar_url.trim() || null,
    star_color: values.star_color,
  };
}

// The other way round, to pre-fill the form: null becomes "" (inputs need strings). The keys are
// in the order the fields appear on screen (the avatar link first), so a failed submit focuses
// the first invalid field from the top.
export function toProfileFormValues(profile) {
  return {
    avatar_url: profile.avatar_url ?? "",
    display_name: profile.display_name,
    bio: profile.bio ?? "",
    star_color: getStarColor(profile.star_color).value,
  };
}
