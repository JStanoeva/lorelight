import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";

const NOT_PUBLIC_MESSAGE =
  "Only public lore can be saved to a Constellation. This entry may have just been made private or deleted.";

// Readable messages for the errors saving an entry to a Constellation (action "save") or removing
// it (action "remove") can run into, everything else as usual. The caller says what failed
// ("This entry couldn't be saved to your Constellation.") and adds this message as the reason.
export function getConstellationErrorMessage(error, action) {
  // Only a save can break the database's rule: it accepts saves of public lore in a public project
  // only. A user can always remove their own saves, so a removal keeps the usual messages.
  if (action === "save") {
    // 42501 from Row Level Security: the entry turned private (or was deleted) after the page
    // loaded it. Other 42501 errors (e.g. the session ended in another tab) keep the usual
    // permission message.
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
