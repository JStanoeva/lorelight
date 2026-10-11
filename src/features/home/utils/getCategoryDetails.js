import { CATEGORY_DETAILS, DEFAULT_CATEGORY_DETAILS } from "../constants/categoryDetails.js";

// "creature" → { description, examples }. A category without its own copy gets the generic fallback.
export function getCategoryDetails(value) {
  return CATEGORY_DETAILS[value] ?? DEFAULT_CATEGORY_DETAILS;
}
