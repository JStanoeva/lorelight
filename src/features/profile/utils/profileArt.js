import { createRandom, hashString } from "../../../shared/utils/seededRandom.js";

// Shared by the skeletons and the error state, so the decoration doesn't jump between them
export const PENDING_SEED = "pending";

function round(value) {
  return Math.round(value * 100) / 100;
}

function between(random, min, max) {
  return min + random() * (max - min);
}

// A four-point star centred on x, y. `waist` (0–1) sets how slim the rays are: 0.2 is the app's
// usual star, smaller values give sharper rays.
export function starPath(x, y, size, waist = 0.2) {
  const w = size * waist;
  return [
    `M${round(x)} ${round(y - size)}`,
    `Q${round(x + w)} ${round(y - w)} ${round(x + size)} ${round(y)}`,
    `Q${round(x + w)} ${round(y + w)} ${round(x)} ${round(y + size)}`,
    `Q${round(x - w)} ${round(y + w)} ${round(x - size)} ${round(y)}`,
    `Q${round(x - w)} ${round(y - w)} ${round(x)} ${round(y - size)}Z`,
  ].join(" ");
}

// Positions in percent of the sky; tinted stars take the star colour from the CSS
export function createSkyStars(seed) {
  const random = createRandom(hashString(`profile-sky-${seed}`));

  const dust = [];
  for (let index = 0; index < 120; index += 1) {
    dust.push({
      key: index,
      x: round(between(random, 0, 100)),
      y: round(between(random, 0, 100)),
      r: round(between(random, 0.35, 1.15)),
      opacity: round(between(random, 0.2, 0.8)),
      isTinted: random() < 0.28,
    });
  }

  const sparks = [];
  for (let index = 0; index < 12; index += 1) {
    sparks.push({
      key: index,
      x: round(between(random, 2, 98)),
      y: round(between(random, 4, 80)),
      size: round(between(random, 2.5, 5.5)),
      isTinted: random() < 0.55,
      delay: round(between(random, 0, 7)),
    });
  }

  return { dust, sparks };
}

// Ray lengths per creator, and the start angles (degrees) of the two orbiting points of light
export function createCrest(seed) {
  const random = createRandom(hashString(`profile-crest-${seed}`));

  return {
    cardinal: round(between(random, 112, 119)),
    diagonal: round(between(random, 92, 101)),
    innerStart: Math.round(between(random, 0, 360)),
    outerStart: Math.round(between(random, 0, 360)),
  };
}

// 48 ticks, every sixth one longer, in the crest's 240-unit box centred on 0, 0
export const CREST_TICKS = Array.from({ length: 48 }, (_, index) => {
  const angle = (index / 48) * Math.PI * 2;
  const isLong = index % 6 === 0;
  const inner = isLong ? 99 : 102;
  const outer = isLong ? 109 : 106;

  return {
    key: index,
    x1: round(Math.cos(angle) * inner),
    y1: round(Math.sin(angle) * inner),
    x2: round(Math.cos(angle) * outer),
    y2: round(Math.sin(angle) * outer),
    isLong,
  };
});
