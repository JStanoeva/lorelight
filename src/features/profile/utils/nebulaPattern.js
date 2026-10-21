// "Nebula Wash", the generated avatar of a profile without a picture: a soft nebula on a square
// canvas, tinted by the profile's star colour and seeded by the user id with the app's own seeded
// generator. Pure: the same seed and colour always build the same nebula.
import { createRandom, hashString, pick } from "../../../shared/utils/seededRandom.js";

// A square canvas, so circles, hexagons and rounded squares all crop it evenly
export const VIEW_SIZE = 200;

const CENTER = VIEW_SIZE / 2;

// "Starlit archive" tokens as hex values, so the art doesn't depend on which CSS variables are emitted
const NIGHT_950 = "#0b1020";
const NIGHT_900 = "#121a33";
const NIGHT_800 = "#1b2447";
const NIGHT_700 = "#2c3769";
const NIGHT_500 = "#5f6ca8";
const LANTERN_900 = "#1d0d43";
const LANTERN_700 = "#392781";
const LANTERN_500 = "#7a4faf";
const LANTERN_300 = "#d3a3ec";
const GOLD_300 = "#f2d38f";
const PARCHMENT_100 = "#f3ead7";

// Lantern Gold, used when the colour given isn't a #rrggbb value
const DEFAULT_TINT = "#e8c170";
const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

// How opaque each colour may get at a cloud's centre. The six star colours are all light, so the
// tint shares one strength.
const STRENGTH = {
  [NIGHT_700]: 0.9,
  [NIGHT_500]: 0.62,
  [LANTERN_700]: 0.95,
  [LANTERN_500]: 0.78,
  [LANTERN_300]: 0.48,
};
const TINT_STRENGTH = 0.76;

// The star colour always leads; the companion clouds differ per seed, so two creators who chose the
// same colour still get clearly different avatars.
const MOODS = [
  { base: [NIGHT_950, NIGHT_900], others: [LANTERN_700, NIGHT_700, NIGHT_500] },
  { base: [NIGHT_950, LANTERN_900], others: [LANTERN_500, LANTERN_700, NIGHT_700] },
  { base: [NIGHT_950, NIGHT_800], others: [NIGHT_700, NIGHT_500, LANTERN_700] },
  { base: [LANTERN_900, NIGHT_950], others: [LANTERN_700, NIGHT_500, LANTERN_300] },
];

function randomBetween(random, min, max) {
  return min + random() * (max - min);
}

function round(value) {
  return Math.round(value * 100) / 100;
}

// One soft cloud: a main ellipse plus 1-2 smaller "lobes", so the edge looks painted, not round.
function makeField(random, { color, strength, cx, cy, rx, ry, rotate }) {
  const lobes = [{ dx: 0, dy: 0, rx: round(rx), ry: round(ry) }];
  const lobeCount = 1 + Math.floor(random() * 2);
  for (let index = 0; index < lobeCount; index += 1) {
    lobes.push({
      dx: round(randomBetween(random, -0.55, 0.55) * rx),
      dy: round(randomBetween(random, -0.45, 0.45) * ry),
      rx: round(rx * randomBetween(random, 0.4, 0.7)),
      ry: round(ry * randomBetween(random, 0.45, 0.8)),
    });
  }
  return { color, strength: round(strength), cx: round(cx), cy: round(cy), rotate: round(rotate), lobes };
}

export function buildAvatarNebula(seed, colorHex) {
  const tint = HEX_PATTERN.test(colorHex ?? "") ? colorHex : DEFAULT_TINT;
  const random = createRandom(hashString(String(seed)));
  const mood = pick(random, MOODS);

  // Two compositions: a diagonal aurora "band", or a rounder "bloom" around the centre (more
  // likely here than on the 16:9 covers, because a round frame shows mostly the middle).
  const isBloom = random() < 0.55;
  const axis = randomBetween(random, -75, 75);
  const radians = (axis * Math.PI) / 180;
  const dirX = Math.cos(radians);
  const dirY = Math.sin(radians);
  const alongScale = isBloom ? 38 : 70;
  const acrossScale = isBloom ? 28 : 32;
  const stretch = isBloom ? [0.7, 0.98] : [0.45, 0.65];
  const turn = isBloom ? 90 : 22;

  // A point on the band: "along" moves on the axis, "across" moves sideways from it
  function pointOnBand(along, across) {
    return {
      cx: CENTER + dirX * along * alongScale - dirY * across * acrossScale,
      cy: CENTER + dirY * along * alongScale + dirX * across * acrossScale,
    };
  }

  // Companion clouds first (drawn behind), spread along the band
  const fields = [];
  const otherCount = 2 + Math.floor(random() * 3);
  for (let index = 0; index < otherCount; index += 1) {
    const color = mood.others[index % mood.others.length];
    const along = -1 + (2 * (index + 0.5)) / otherCount + randomBetween(random, -0.2, 0.2);
    const rx = randomBetween(random, 50, 82);
    fields.push(
      makeField(random, {
        color,
        strength: STRENGTH[color] * randomBetween(random, 0.6, 0.95),
        ...pointOnBand(along, randomBetween(random, -1, 1)),
        rx,
        ry: rx * randomBetween(random, stretch[0], stretch[1]),
        rotate: axis + randomBetween(random, -turn, turn),
      }),
    );
  }

  // The star colour's cloud sits near the centre, so every frame shape keeps it
  const dominantRx = randomBetween(random, 68, 92);
  fields.push(
    makeField(random, {
      color: tint,
      strength: TINT_STRENGTH,
      ...pointOnBand(randomBetween(random, -0.25, 0.25), randomBetween(random, -0.4, 0.4)),
      rx: dominantRx,
      ry: dominantRx * randomBetween(random, stretch[0], stretch[1]),
      rotate: axis + randomBetween(random, -turn, turn) * 0.6,
    }),
  );

  // A small echo of the star colour toward one end of the band
  const side = random() < 0.5 ? -1 : 1;
  fields.push(
    makeField(random, {
      color: tint,
      strength: TINT_STRENGTH * 0.6,
      ...pointOnBand(side * randomBetween(random, 0.35, 0.6), randomBetween(random, -0.6, 0.6)),
      rx: randomBetween(random, 16, 28),
      ry: randomBetween(random, 11, 19),
      rotate: axis + randomBetween(random, -30, 30),
    }),
  );

  // A dark dust lane across the glow gives depth (not every seed gets one)
  let dustLane = null;
  if (random() < 0.65) {
    const lane = pointOnBand(randomBetween(random, -0.3, 0.3), pick(random, [-1, 1]) * randomBetween(random, 0.4, 0.9));
    dustLane = {
      cx: round(lane.cx),
      cy: round(lane.cy),
      rx: round(randomBetween(random, 60, 90)),
      ry: round(randomBetween(random, 6, 13)),
      rotate: round(axis + randomBetween(random, -12, 12)),
      strength: round(randomBetween(random, 0.5, 0.75)),
    };
  }

  // 6-16 pin-prick stars, mostly parchment, a few in the star colour or warm gold
  const stars = [];
  const starCount = 6 + Math.floor(random() * 11);
  for (let index = 0; index < starCount; index += 1) {
    const tone = random();
    stars.push({
      cx: round(randomBetween(random, 24, 176)),
      cy: round(randomBetween(random, 24, 176)),
      r: round(randomBetween(random, 0.35, 0.9)),
      opacity: round(randomBetween(random, 0.45, 0.95)),
      color: tone < 0.72 ? PARCHMENT_100 : tone < 0.92 ? tint : GOLD_300,
    });
  }

  // Sometimes one brighter star with a soft halo
  const brightStar =
    random() < 0.5
      ? {
          cx: round(randomBetween(random, 55, 145)),
          cy: round(randomBetween(random, 50, 150)),
          halo: round(randomBetween(random, 4, 6.5)),
        }
      : null;

  return {
    base: mood.base,
    baseAngle: round(randomBetween(random, 0, 360)),
    fields,
    dustLane,
    dustColor: NIGHT_950,
    stars,
    brightStar,
    starColor: PARCHMENT_100,
    // feTurbulence wants a whole number; it only changes the grain, not the composition
    grainSeed: Math.floor(random() * 1000),
  };
}
