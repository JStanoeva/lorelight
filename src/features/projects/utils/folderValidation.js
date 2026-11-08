import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import { countCharacters } from "../../../shared/utils/validators.js";

// Same rules as the database: 1–50 characters after trimming, unique per project ignoring case
export const FOLDER_NAME_MAX = 50;

const DUPLICATE_MESSAGE = "This project already has a folder with that name.";

// `folderId` is the folder being renamed (null when creating), so it may keep its own name
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

// 23505: the unique rule caught a duplicate the form couldn't see (e.g. from another tab)
export function getFolderErrorMessage(error) {
  return error?.code === "23505" ? DUPLICATE_MESSAGE : getErrorMessage(error);
}
