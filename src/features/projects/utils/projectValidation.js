import { countCharacters, isHttpUrl } from "../../../shared/utils/validators.js";
import { PROJECT_GENRES } from "../constants/genres.js";
import { PROJECT_FORMATS } from "../constants/projectFormats.js";

// The same limits as the database check constraints (README §8).
export const PROJECT_TITLE_MIN = 3;
export const PROJECT_TITLE_MAX = 80;
export const PROJECT_DESCRIPTION_MAX = 1000;

// Create starts empty and private (README §7: new Projects are private until made public).
export const EMPTY_PROJECT_VALUES = {
  title: "",
  description: "",
  cover_url: "",
  format: "",
  genre: "",
  is_public: false,
};

export function validateProject(values) {
  const errors = {};

  const titleLength = countCharacters(values.title.trim());
  if (titleLength === 0) {
    errors.title = "Enter a title for your project.";
  } else if (titleLength < PROJECT_TITLE_MIN) {
    errors.title = `The title must be at least ${PROJECT_TITLE_MIN} characters.`;
  } else if (titleLength > PROJECT_TITLE_MAX) {
    errors.title = `The title can be at most ${PROJECT_TITLE_MAX} characters.`;
  }

  if (countCharacters(values.description.trim()) > PROJECT_DESCRIPTION_MAX) {
    errors.description = "The description can be at most 1,000 characters.";
  }

  const coverUrl = values.cover_url.trim();
  if (coverUrl && !isHttpUrl(coverUrl)) {
    errors.cover_url = "Enter a full link that starts with http:// or https://.";
  }

  if (!PROJECT_FORMATS.some((format) => format.value === values.format)) {
    errors.format = "Choose a format.";
  }

  // "" means "No genre"; anything else must be one of the listed genres
  if (values.genre && !PROJECT_GENRES.some((genre) => genre.value === values.genre)) {
    errors.genre = "Choose a genre from the list.";
  }

  return errors;
}

// The clean database row: trimmed text, and null (never "") for empty optional fields,
// because the database rejects "" as a cover link or genre.
export function toProjectPayload(values) {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    cover_url: values.cover_url.trim() || null,
    format: values.format,
    genre: values.genre || null,
    is_public: values.is_public,
  };
}

// The other way round, to pre-fill the edit form: null becomes "" (inputs need strings).
export function toProjectFormValues(project) {
  return {
    title: project.title,
    description: project.description ?? "",
    cover_url: project.cover_url ?? "",
    format: project.format,
    genre: project.genre ?? "",
    is_public: project.is_public,
  };
}
