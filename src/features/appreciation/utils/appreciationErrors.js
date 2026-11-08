import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";

const NOT_PUBLIC_MESSAGE = "Only public lore can be appreciated. This entry may have just been made private or deleted.";

export function getAppreciationErrorMessage(error) {
  // RLS allows appreciating public lore only; other 42501s (e.g. ended sessions) stay generic
  if (error?.code === "42501" && error.message?.includes("row-level security")) {
    return NOT_PUBLIC_MESSAGE;
  }
  // 23503 (foreign key): the entry was deleted while the appreciation was being saved
  if (error?.code === "23503") {
    return NOT_PUBLIC_MESSAGE;
  }
  return getErrorMessage(error);
}
