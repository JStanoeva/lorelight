import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import { countCharacters } from "../../../shared/utils/validators.js";

// The same rules as the database: 1–50 characters after trimming, unique per project ignoring case.
export const FOLDER_NAME_MAX = 50;

const DUPLICATE_MESSAGE = "This project already has a folder with that name.";

// `folders` are the project's current folders; `folderId` is the folder being renamed (null when
// creating), so a folder may keep its own name. Returns "" when the name is fine.
export function validateFolderName(name, folders, folderId = null) {
  const trimmed = name.trim();

  if (!trimmed) {
    return "Enter a folder name.";
  }

  if (countCharacters(trimmed) > FOLDER_NAME_MAX) {
    return `Folder names can be at most ${FOLDER_NAME_MAX} characters.`;
  }

  const lowerName = trimmed.toLowerCase();
  if (folders.some((folder) => folder.id !== folderId && folder.name.trim().toLowerCase() === lowerName)) {
    return DUPLICATE_MESSAGE;
  }

  return "";
}

// 23505 = the database's unique rule caught a duplicate the form couldn't see (e.g. a folder
// created in another tab).
export function getFolderErrorMessage(error) {
  return error?.code === "23505" ? DUPLICATE_MESSAGE : getErrorMessage(error);
}
