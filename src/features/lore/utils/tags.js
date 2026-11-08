import { countCharacters } from "../../../shared/utils/validators.js";

// The database checks the same limits (tags_are_valid in 001_tables.sql).
export const TAGS_MAX = 10;
export const TAG_LENGTH_MAX = 30;

// Letters and numbers of any alphabet, spaces and hyphens. Accent marks (Devanagari, Thai and
// Arabic need them) are allowed only right after a letter or number.
const ALLOWED_CHARACTERS = /^(?:[\p{L}\p{N}]\p{M}*|[ -])+$/u;
const LETTER_OR_NUMBER = /[\p{L}\p{N}]/u;

// Zero-width spaces, variation selectors and fillers would make invisible variants of a tag
const INVISIBLE_CHARACTERS = /\p{Default_Ignorable_Code_Point}/gu;

const QUOTED_TAG_MAX = 24;

// NFC joins an "e" typed with a separate accent into one "é", so both spellings become one tag.
// Every check runs on this normalized tag, the exact text the database receives.
function normalizeTag(piece) {
  return piece
    .replace(INVISIBLE_CHARACTERS, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .normalize("NFC");
}

export function parseTags(text) {
  const tags = text.split(",").map(normalizeTag).filter((tag) => tag !== "");
  return [...new Set(tags)];
}

export function formatTags(tags) {
  return (tags ?? []).join(", ");
}

function isTagTooLong(tag) {
  return countCharacters(tag) > TAG_LENGTH_MAX;
}

// Array.from splits by characters, like countCharacters, so an emoji is never cut in half
function quoteTag(tag) {
  const characters = Array.from(tag);
  const shown =
    characters.length > QUOTED_TAG_MAX ? `${characters.slice(0, QUOTED_TAG_MAX - 1).join("")}…` : tag;
  return `"${shown}"`;
}

function getTagProblem(tag, position) {
  if (!ALLOWED_CHARACTERS.test(tag)) {
    return "letters, numbers, spaces and hyphens only";
  }
  if (!LETTER_OR_NUMBER.test(tag)) {
    return "needs a letter or number";
  }
  if (isTagTooLong(tag)) {
    return `${countCharacters(tag)} / ${TAG_LENGTH_MAX} characters`;
  }
  if (position >= TAGS_MAX) {
    return `over the ${TAGS_MAX}-tag limit`;
  }
  return null;
}

export function describeTags(text) {
  const items = parseTags(text).map((tag, index) => ({ tag, problem: getTagProblem(tag, index) }));
  return { items, count: items.length };
}

export function getTagsError(text) {
  const tags = parseTags(text);

  for (const tag of tags) {
    if (!ALLOWED_CHARACTERS.test(tag)) {
      return `Tags can only contain letters, numbers, spaces and hyphens: ${quoteTag(tag)}.`;
    }
    if (!LETTER_OR_NUMBER.test(tag)) {
      return `Each tag needs at least one letter or number: ${quoteTag(tag)}.`;
    }
    if (isTagTooLong(tag)) {
      return `Each tag can be at most ${TAG_LENGTH_MAX} characters: ${quoteTag(tag)} is too long.`;
    }
  }

  if (tags.length > TAGS_MAX) {
    return `Use at most ${TAGS_MAX} tags (you have ${tags.length}).`;
  }

  return "";
}
