import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";

const NOT_PUBLIC_MESSAGE =
  "Only public lore can be saved to a Constellation. This entry may have just been made private or deleted.";

// The reason part of the message (the caller says what failed); `action` is "save" or "remove"
export function getConstellationErrorMessage(error, action) {
  // Only a save can break the public-lore rule; a user can always remove their own saves
  if (action === "save") {
    // 42501 from Row Level Security: the entry turned private (or was deleted) after the page
    // loaded it. Other 42501 errors (e.g. the session ended in another tab) keep the usual message.
    if (error?.code === "42501" && error.message?.includes("row-level security")) {
      return NOT_PUBLIC_MESSAGE;
    }
    // 23503: the entry was deleted while the save was on its way
    if (error?.code === "23503") {
      return NOT_PUBLIC_MESSAGE;
    }
  }
  return getErrorMessage(error);
}
