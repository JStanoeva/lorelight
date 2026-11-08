import { CATEGORY_DETAILS, DEFAULT_CATEGORY_DETAILS } from "../constants/categoryDetails.js";

export function getCategoryDetails(value) {
  return CATEGORY_DETAILS[value] ?? DEFAULT_CATEGORY_DETAILS;
}
