import { LORE_CATEGORIES } from "../constants/categories.js";

const FALLBACK_CATEGORY = LORE_CATEGORIES.find((category) => category.value === "other");

// "faction" → the category object (label + colour classes). An unknown value falls back to "Other".
export function getCategory(value) {
  return LORE_CATEGORIES.find((category) => category.value === value) ?? FALLBACK_CATEGORY;
}
