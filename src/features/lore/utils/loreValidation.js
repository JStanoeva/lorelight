import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import { countCharacters, isHttpUrl } from "../../../shared/utils/validators.js";
import { LORE_CATEGORIES } from "../constants/categories.js";
import { formatTags, getTagsError, parseTags } from "./tags.js";

// The same limits as the database check constraints
export const LORE_TITLE_MIN = 3;
export const LORE_TITLE_MAX = 100;
export const LORE_DESCRIPTION_MIN = 20;
export const LORE_DESCRIPTION_MAX = 5000;

export const FOLDER_GONE_MESSAGE = 'The chosen folder no longer exists. Choose another folder, or "No folder".';

const PROJECT_GONE_MESSAGE = "The chosen project no longer exists. Choose another project and try again.";

export function getLoreSaveErrorMessage(error) {
  // 23503 on the project's key: the project was deleted while this save waited for it
  // (moving its lore before deleting it locks the project, migration 006)
  if (error?.code === "23503" && error.message?.includes("lore_entries_project_id_fkey")) {
    return PROJECT_GONE_MESSAGE;
  }
  // Any other 23503: the chosen folder was deleted after the form loaded it
  if (error?.code === "23503") {
    return FOLDER_GONE_MESSAGE;
  }
  // 42501: the database only accepts lore in the user's own projects, and the form only lists
  // those, so the chosen project was deleted after the form loaded it (e.g. in another tab)
  if (error?.code === "42501") {
    return PROJECT_GONE_MESSAGE;
  }
  return getErrorMessage(error);
}

// The keys follow the form's field order: after a failed submit, useForm focuses the first
// invalid field in this order.
export const EMPTY_LORE_VALUES = {
  project_id: "",
  folder_id: "",
  title: "",
  category: "",
  description: "",
  tagsText: "",
  image_url: "",
  is_public: false,
};

// No folder rule: the form only lists the folders of the chosen project.
export function validateLore(values, projectIds) {
  const errors = {};

  if (!values.project_id) {
    errors.project_id = "Choose a project for this entry.";
  } else if (!projectIds.includes(values.project_id)) {
    errors.project_id = "Choose one of your own projects.";
  }

  const titleLength = countCharacters(values.title.trim());
  if (titleLength === 0) {
    errors.title = "Enter a title for your lore entry.";
  } else if (titleLength < LORE_TITLE_MIN) {
    errors.title = `The title must be at least ${LORE_TITLE_MIN} characters.`;
  } else if (titleLength > LORE_TITLE_MAX) {
    errors.title = `The title can be at most ${LORE_TITLE_MAX} characters.`;
  }

  if (!LORE_CATEGORIES.some((category) => category.value === values.category)) {
    errors.category = "Choose a category.";
  }

  const descriptionLength = countCharacters(values.description.trim());
  if (descriptionLength === 0) {
    errors.description = "Enter a description for your lore entry.";
  } else if (descriptionLength < LORE_DESCRIPTION_MIN) {
    errors.description = `The description must be at least ${LORE_DESCRIPTION_MIN} characters.`;
  } else if (descriptionLength > LORE_DESCRIPTION_MAX) {
    errors.description = "The description can be at most 5,000 characters.";
  }

  const tagsError = getTagsError(values.tagsText);
  if (tagsError) {
    errors.tagsText = tagsError;
  }

  const imageUrl = values.image_url.trim();
  if (imageUrl && !isHttpUrl(imageUrl)) {
    errors.image_url = "Enter a full link that starts with http:// or https://.";
  }

  return errors;
}

// null (never "") for an empty folder or image link. It holds only columns the owner may also
// update, so Edit can send it as well.
export function toLorePayload(values) {
  return {
    project_id: values.project_id,
    folder_id: values.folder_id || null,
    title: values.title.trim(),
    category: values.category,
    description: values.description.trim(),
    tags: parseTags(values.tagsText),
    image_url: values.image_url.trim() || null,
    is_public: values.is_public,
  };
}

// Pre-fills the edit form: null becomes "" because inputs need strings. The keys keep the
// EMPTY_LORE_VALUES order, which useForm's focus relies on.
export function toLoreFormValues(entry) {
  return {
    project_id: entry.project_id,
    folder_id: entry.folder_id ?? "",
    title: entry.title,
    category: entry.category,
    description: entry.description,
    tagsText: formatTags(entry.tags),
    image_url: entry.image_url ?? "",
    is_public: entry.is_public,
  };
}
