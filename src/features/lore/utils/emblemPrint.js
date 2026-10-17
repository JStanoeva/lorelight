import { chance, createRandom, hashString, pick } from "../../../shared/utils/seededRandom.js";
import { LORE_EMBLEMS } from "../constants/loreEmblems.js";

// Geometry for the "Emblem Print" lore placeholder: the category's emblem repeated edge to edge,
// like a block-printed book endpaper. One pattern tile is described in screen pixels and the
// browser repeats it. Every choice comes from the seeded random generator.

const EMBLEM_BOX = 100; // emblems are drawn in a 100-unit box (-50..50)
const MOTIF_BOX = 20; // motifs in a 20-unit box (-10..10)
// The cartouche's emblem line width is worked out for one reference size: the cartouche is 58 % of
// the banner height (.emblem-print-feature in lore-placeholder.css), and the widest Lore Details
// banner is about 880 × 293 px, so about 170 px. Smaller or larger cartouches get slightly thinner or
// thicker lines.
const FEATURE_PIXELS = 170;
const FEATURE_VIEWBOX = 120; // the cartouche <svg> in LorePlaceholder.jsx is 120 units wide (-60..60)

// Small shapes that sit between the emblems. Deliberately not stars (those belong to the Constellation).
const MOTIFS = {
  dot: { dots: [[0, 0, 2.6]] },
  diamond: { lines: ["M0 -6.5L5 0L0 6.5L-5 0Z"], dots: [[0, 0, 1.3]] },
  lozenge: { fills: ["M0 -8.5L3 0L0 8.5L-3 0Z"] },
  trio: {
    dots: [
      [-6, 0, 1.6],
      [0, 0, 1.6],
      [6, 0, 1.6],
    ],
  },
};

function round(value) {
  return Math.round(value * 100) / 100;
}

// Stroke width in the symbol's own units, so the line is `pixels` wide on screen.
function strokeFor(pixels, renderedSize, box) {
  return round((pixels * box) / renderedSize);
}

/*
  Lattices: each one returns a single tile (its size), the emblem slots and the motif slots.
  A slot that crosses the tile edge is listed once per side it touches (e.g. x = 0 and x = width),
  because a pattern clips its tile: the halves meet up in the neighbouring tiles. Secondary slots
  can be drawn smaller or mirrored, so the print doesn't look like a plain grid.
*/

// Harlequin: a diamond trellis, one emblem in the middle and one on the corners.
function harlequin(size, random) {
  const width = round(size * (1.95 + random() * 0.35));
  const height = round(width * (0.84 + random() * 0.26));
  const cx = round(width / 2);
  const cy = round(height / 2);
  return {
    width,
    height,
    slots: [
      { x: cx, y: cy, isSecondary: false },
      { x: 0, y: 0, isSecondary: true },
      { x: width, y: 0, isSecondary: true },
      { x: 0, y: height, isSecondary: true },
      { x: width, y: height, isSecondary: true },
    ],
    motifs: [],
    rules: `M${cx} 0L${width} ${cy}L${cx} ${height}L0 ${cy}Z`,
    // Tiny beads where the trellis lines cross
    joints: [
      [cx, 0],
      [cx, height],
      [0, cy],
      [width, cy],
    ],
  };
}

// Brick: ruled rows, every second row shifted by half a step, motifs between the emblems.
function brick(size, random) {
  const width = round(size * (1.6 + random() * 0.3));
  const row = round(size * (1.45 + random() * 0.3));
  const height = row * 2;
  const half = round(width / 2);
  const gap = 1.3; // half the distance between the two lines of a double rule
  return {
    width,
    height,
    slots: [
      { x: half, y: row / 2, isSecondary: false },
      { x: 0, y: row * 1.5, isSecondary: true },
      { x: width, y: row * 1.5, isSecondary: true },
    ],
    motifs: [
      [0, row / 2],
      [width, row / 2],
      [half, row * 1.5],
    ],
    rules: [gap, row - gap, row + gap, height - gap].map((y) => `M0 ${round(y)}H${width}`).join(""),
    joints: [],
  };
}

// Half-drop: columns, every second column dropped by half, with dotted rules between them.
function halfDrop(size, random) {
  const column = round(size * (1.55 + random() * 0.3));
  const height = round(size * (1.65 + random() * 0.35));
  const width = column * 2;
  const dots = Math.max(4, Math.round(height / 7));
  return {
    width,
    height,
    slots: [
      { x: column / 2, y: height / 2, isSecondary: false },
      { x: column * 1.5, y: 0, isSecondary: true },
      { x: column * 1.5, y: height, isSecondary: true },
    ],
    motifs: [
      [column / 2, 0],
      [column / 2, height],
      [column * 1.5, height / 2],
    ],
    rules: [0, column, width].map((x) => `M${x} 0V${height}`).join(""),
    // A dash of length 0 with round caps draws a row of dots
    dash: `0 ${round(height / dots)}`,
    joints: [],
  };
}

// Wave: rows of a gentle wave line; emblems sit in the arches, alternately above and below it.
function wave(size, random) {
  const step = round(size * (1.5 + random() * 0.3));
  const height = round(size * (1.5 + random() * 0.25));
  const width = step * 2;
  const amplitude = round(size * (0.2 + random() * 0.1));
  const middle = height / 2;
  // The wave as a line through 17 points: a crest at step / 2, a trough at step * 1.5
  const points = Array.from({ length: 17 }, (_, index) => {
    const x = (width / 16) * index;
    const y = middle - amplitude * Math.cos((Math.PI * (x - step / 2)) / step);
    return `${round(x)} ${round(y)}`;
  });
  return {
    width,
    height,
    slots: [
      // Under each crest and above each trough; both cross the tile edge, so each has two copies
      { x: step / 2, y: height - amplitude, isSecondary: false },
      { x: step / 2, y: -amplitude, isSecondary: false },
      { x: step * 1.5, y: amplitude, isSecondary: true },
      { x: step * 1.5, y: height + amplitude, isSecondary: true },
    ],
    motifs: [
      [0, middle],
      [step, middle],
      [width, middle],
    ],
    rules: `M${points.join("L")}`,
    joints: [],
  };
}

const LATTICES = { harlequin, brick, halfDrop, wave };

// The cartouche on wide banners: one large emblem in a frame that interrupts the print.
const FEATURE_SHAPES = [
  // Cut-corner tablet
  {
    outer: "M-40 -56H40L54 -42V42L40 56H-40L-54 42V-42Z",
    inner: "M-36 -48H36L46 -38V38L36 48H-36L-46 38V-38Z",
    emblemSize: 74,
    beads: "M-47 -49h0.01M47 -49h0.01M-47 49h0.01M47 49h0.01",
  },
  // A diamond, like one cell of the harlequin trellis grown large
  {
    outer: "M0 -58L58 0L0 58L-58 0Z",
    inner: "M0 -49L49 0L0 49L-49 0Z",
    emblemSize: 58,
    beads: "M0 -42h0.01M0 42h0.01M-42 0h0.01M42 0h0.01",
  },
  // A label with pointed ends, like a cartouche on an old map
  {
    outer: "M-58 0L-44 -42H44L58 0L44 42H-44Z",
    inner: "M-49 0L-38 -34H38L49 0L38 34H-38Z",
    emblemSize: 60,
    beads: "M-42 0h0.01M42 0h0.01",
  },
];

const NIGHT = "11 16 32"; // night-950 as RGB numbers, for the see-through vignette colours

// A darker edge so the print fades into the card: a pool of light, a side fade or an even frame.
function createVignette(random, focusX) {
  const kind = pick(random, ["pool", "pool", "side", "frame"]);
  if (kind === "pool") {
    const y = Math.round(35 + random() * 25);
    return `radial-gradient(ellipse 75% 95% at ${focusX}% ${y}%, transparent 30%, rgb(${NIGHT} / 0.78) 100%)`;
  }
  if (kind === "side") {
    const side = focusX > 50 ? "right" : "left";
    return `linear-gradient(to ${side}, rgb(${NIGHT} / 0.62) 0%, rgb(${NIGHT} / 0.1) 55%, transparent 80%), radial-gradient(ellipse at 50% 50%, transparent 55%, rgb(${NIGHT} / 0.55) 100%)`;
  }
  return `radial-gradient(ellipse at 50% 50%, transparent 40%, rgb(${NIGHT} / 0.7) 100%)`;
}

// Everything LorePlaceholder needs to draw one print, decided by the seed and the category.
export function createEmblemPrint(seed, category) {
  // The prefix gives lore prints their own random sequence, separate from the project sigil's
  // (which hashes the bare id)
  const random = createRandom(hashString(`emblem-print:${seed}`));
  const emblem = LORE_EMBLEMS[category] ?? LORE_EMBLEMS.other;
  const size = round(26 + random() * 12);
  const lattice = LATTICES[pick(random, Object.keys(LATTICES))](size, random);

  // Secondary emblems are mirrored in some prints (never turned: they must stay easy to read), and
  // either the same size or a bit smaller, so no row of the print looks empty
  const mirrorsSecondary = chance(random, 0.4);
  const secondaryScale = chance(random, 0.5) ? 1 : round(0.62 + random() * 0.12);
  const motifName = pick(random, Object.keys(MOTIFS));
  const motifSize = round(size * (0.42 + random() * 0.12));

  const emblems = lattice.slots.map((slot) => {
    const isSmall = slot.isSecondary && secondaryScale < 1;
    const isMirrored = slot.isSecondary && mirrorsSecondary;
    const slotSize = round(isSmall ? size * secondaryScale : size);
    return {
      key: `${slot.x},${slot.y}`,
      size: slotSize,
      // The <use> is drawn around (0, 0), then moved to its slot (and maybe mirrored)
      offset: round(-slotSize / 2),
      transform: `translate(${round(slot.x)} ${round(slot.y)})${isMirrored ? " scale(-1 1)" : ""}`,
      strokeWidth: strokeFor(isSmall ? 1.1 : 1.25, slotSize, EMBLEM_BOX),
    };
  });

  const motifs = lattice.motifs.map(([x, y]) => ({
    key: `${x},${y}`,
    x: round(x - motifSize / 2),
    y: round(y - motifSize / 2),
    size: motifSize,
    strokeWidth: strokeFor(1, motifSize, MOTIF_BOX),
  }));

  // The whole print can lean a little; the offset moves the first tile so prints don't line up
  const rotation = pick(random, [0, 0, 0, -7, 7, -12, 12]);
  const tile = {
    x: round(random() * lattice.width),
    y: round(random() * lattice.height),
    width: lattice.width,
    height: lattice.height,
    transform: rotation ? `rotate(${rotation})` : undefined,
  };

  // Wide banners: the cartouche sits on the right, away from a title at the bottom left
  const featureX = pick(random, [64, 72, 80, 86]);
  const featureShape = pick(random, FEATURE_SHAPES);
  const featureEmblemPixels = (FEATURE_PIXELS / FEATURE_VIEWBOX) * featureShape.emblemSize;

  return {
    emblem,
    motif: MOTIFS[motifName],
    tile,
    rules: lattice.rules,
    dash: lattice.dash,
    joints: lattice.joints.map(([x, y]) => `M${x} ${y}h0.01`).join(""),
    hasGoldJoints: chance(random, 0.5),
    emblems,
    motifs,
    emblemOpacity: round(0.56 + random() * 0.14),
    vignette: createVignette(random, featureX),
    feature: {
      left: `${featureX}%`,
      shape: featureShape,
      offset: -featureShape.emblemSize / 2,
      strokeWidth: strokeFor(1.8, featureEmblemPixels, EMBLEM_BOX),
    },
  };
}
