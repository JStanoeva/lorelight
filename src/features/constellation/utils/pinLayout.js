import { createRandom, hashString } from "../../../shared/utils/seededRandom.js";

// Pure helpers for the pin board's look. Everything comes from a seed (an entry id or the owner's
// id), so a card keeps its tilt and the board keeps its stars on every visit and after a removal.

// The largest tilt of a pinned card, in degrees (phones scale it down in the CSS). Small enough
// that a tilted card's lower corners reach less than 10px into the gaps, so the cards still line
// up in rows and columns and the gaps between them, where the threads show, stay open.
const MAX_TILT = 1.6;
// A card is never pinned perfectly straight: that would look like a mistake on a pin board
const MIN_TILT = 0.5;
// How far a card can hang below its row line, in rem
const MAX_DROP = 1.25;

// The star field is one tile, repeated over the whole board by an SVG <pattern>
export const STAR_TILE = { width: 560, height: 480 };

function round(value) {
  return Math.round(value * 100) / 100;
}

function between(random, min, max) {
  return min + random() * (max - min);
}

// SVG path of a four-point star with curved sides, centred on x, y.
export function fourPointStarPath(x, y, size) {
  const waist = size * 0.2;
  return [
    `M${round(x)} ${round(y - size)}`,
    `Q${round(x + waist)} ${round(y - waist)} ${round(x + size)} ${round(y)}`,
    `Q${round(x + waist)} ${round(y + waist)} ${round(x)} ${round(y + size)}`,
    `Q${round(x - waist)} ${round(y + waist)} ${round(x - size)} ${round(y)}`,
    `Q${round(x - waist)} ${round(y - waist)} ${round(x)} ${round(y - size)}Z`,
  ].join(" ");
}

// The star-pin's glyph, drawn around 0, 0 in a 24-unit box
export const PIN_STAR_PATH = fourPointStarPath(0, 0, 10);

// How one card hangs on the board: its tilt (degrees) and how far it drops below the row line
// (rem), so the cards look pinned by hand instead of lined up in a grid.
export function getPinLayout(entryId) {
  const random = createRandom(hashString(`pin-${entryId}`));
  const side = random() < 0.5 ? -1 : 1;
  return {
    tilt: round(side * between(random, MIN_TILT, MAX_TILT)),
    drop: round(between(random, 0, MAX_DROP)),
  };
}

// The repeated star field: many faint dots and a few small four-point stars.
export function createStarTile(seed) {
  const random = createRandom(hashString(`tile-${seed}`));
  const dust = [];
  for (let index = 0; index < 52; index += 1) {
    dust.push({
      key: index,
      x: round(between(random, 0, STAR_TILE.width)),
      y: round(between(random, 0, STAR_TILE.height)),
      // Cubing the random number makes most stars tiny and only a few bigger
      r: round(0.35 + random() ** 3 * 0.95),
      opacity: round(between(random, 0.25, 0.75)),
    });
  }

  const sparks = [];
  for (let index = 0; index < 5; index += 1) {
    sparks.push({
      key: index,
      x: round(between(random, 20, STAR_TILE.width - 20)),
      y: round(between(random, 20, STAR_TILE.height - 20)),
      size: round(between(random, 2.4, 4.4)),
      opacity: round(between(random, 0.4, 0.7)),
    });
  }

  return { dust, sparks };
}
