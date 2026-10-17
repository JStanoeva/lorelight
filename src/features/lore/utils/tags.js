import { countCharacters } from "../../../shared/utils/validators.js";

// README §8: optional, up to 10 tags, each up to 30 characters, saved in lowercase, no duplicates.
// The database checks the same limits (tags_are_valid in 001_tables.sql).
export const TAGS_MAX = 10;
export const TAG_LENGTH_MAX = 30;

// Letters and numbers of any alphabet (Cyrillic and Greek too), spaces and hyphens. Accent marks
// (Devanagari, Thai and Arabic need them) are allowed only right after a letter or number.
// Every tag also needs a letter or a number.
const ALLOWED_CHARACTERS = /^(?:[\p{L}\p{N}]\p{M}*|[ -])+$/u;
const LETTER_OR_NUMBER = /[\p{L}\p{N}]/u;

// Characters that take up no visible space (zero-width spaces, variation selectors, fillers).
// They would make "dragon" and an invisible variant of it two different tags.
const INVISIBLE_CHARACTERS = /\p{Default_Ignorable_Code_Point}/gu;

// A long tag is cut short when an error quotes it, so the message stays readable
const QUOTED_TAG_MAX = 24;

// "  Ancient   MAGIC " → "ancient magic": trimmed, inner spaces collapsed, lowercase. NFC joins
// an "e" typed with a separate accent into one "é", so both spellings become the same tag.
// Invisible characters are removed, so the preview shows exactly what gets saved.
// Every check below runs on this normalized tag, the exact text the database receives.
function normalizeTag(piece) {
  return piece
    .replace(INVISIBLE_CHARACTERS, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .normalize("NFC");
}

// "Dragon, , ancient  MAGIC,dragon" → ["dragon", "ancient magic"]: the tags that get saved,
// in the order they were typed, without empty pieces or duplicates (the first one stays).
export function parseTags(text) {
  const tags = text.split(",").map(normalizeTag).filter((tag) => tag !== "");
  return [...new Set(tags)];
}

// ["dragon", "ancient magic"] → "dragon, ancient magic", to pre-fill the Tags field when editing
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

// The short problem shown on a tag's chip in the "Saved as" preview, or null when the tag is fine.
// `position` is the tag's index in the list: from the 11th tag on, a tag is over the limit.
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

// Every tag that will be saved, each with its problem (or null), for the live preview
export function describeTags(text) {
  const items = parseTags(text).map((tag, index) => ({ tag, problem: getTagProblem(tag, index) }));
  return { items, count: items.length };
}

// The error under the Tags field, or "" when every tag is fine. It names the first tag with
// a problem (the preview marks all of them); the number of tags is checked after that.
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
