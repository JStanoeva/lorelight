import { PROJECT_GENRES } from "../constants/genres.js";
import { PROJECT_FORMATS } from "../constants/projectFormats.js";

// An unknown value gets no label instead of a raw slug
export function getFormatLabel(value) {
  return PROJECT_FORMATS.find((format) => format.value === value)?.label ?? null;
}

export function getGenreLabel(value) {
  return PROJECT_GENRES.find((genre) => genre.value === value)?.label ?? null;
}
