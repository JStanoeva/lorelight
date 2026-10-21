import { DEFAULT_STAR_COLOR, STAR_COLORS } from "../constants/starColors.js";

const FALLBACK_STAR_COLOR = STAR_COLORS.find((color) => color.value === DEFAULT_STAR_COLOR);

// "teal" → { value, label, hex }. An unknown or missing value falls back to Lantern Gold.
export function getStarColor(value) {
  return STAR_COLORS.find((color) => color.value === value) ?? FALLBACK_STAR_COLOR;
}
