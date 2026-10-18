import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";

const NOT_PUBLIC_MESSAGE = "Only public lore can be appreciated. This entry may have just been made private or deleted.";

// Readable messages for the errors appreciating an entry (or removing an appreciation) can run
// into, everything else as usual
export function getAppreciationErrorMessage(error) {
  // 42501 from Row Level Security: the database only accepts appreciations of public lore in a
  // public project, so the entry turned private (or was deleted) after the page loaded it.
  // Other 42501 errors (e.g. the session ended in another tab) keep the usual permission message.
  if (error?.code === "42501" && error.message?.includes("row-level security")) {
    return NOT_PUBLIC_MESSAGE;
  }
  // 23503: the entry was deleted while the appreciation was being saved
  if (error?.code === "23503") {
    return NOT_PUBLIC_MESSAGE;
  }
  return getErrorMessage(error);
}
