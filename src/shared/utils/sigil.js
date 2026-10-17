import { chance, createRandom, hashString, pick } from "./seededRandom.js";

// Geometry for the "Archive Sigil" image placeholder: a seal drawn in an emblem coordinate system
// from -100 to 100, with (0, 0) at the centre. Every choice comes from the seeded random generator.

const OUTER_RADIUS = 82;
const TICK_RADIUS = 74;
const STAR_RADIUS = 70;
const HUB_RADIUS = 13;

const PROJECT_INKS = ["#e8c170", "#dcc596", "#f2d38f"];
const PROJECT_GLOWS = [
  { color: "#392781", opacity: 0.75 },
  { color: "#2c3769", opacity: 0.8 },
  { color: "#7a4faf", opacity: 0.38 },
  { color: "#5f6ca8", opacity: 0.4 },
];
const GOLD_ACCENT = "#f2d38f";

// Fine background patterns, in screen pixels so they look the same at every size.
const TEXTURES = [
  { size: 18, path: "M9 0L18 9L9 18L0 9Z", strokeWidth: 0.7 },
  { size: 14, path: "M0 0H14M0 0V14", strokeWidth: 0.7 },
  { size: 12, path: "M6 6h0.01", strokeWidth: 1.8 },
  { size: 16, path: "M8 5.5V10.5M5.5 8H10.5", strokeWidth: 0.8 },
];

// Star polygon steps {points/step} that look good for each number of points.
const STAR_STEPS = { 5: [2], 6: [2], 7: [2, 3], 8: [3, 2], 9: [2, 4] };

const ECHO_RADII = [108, 126, 150, 180, 214];

function round(value) {
  return Math.round(value * 100) / 100;
}

// The point at `radius` from the centre, `angle` degrees clockwise from the right.
function polar(radius, angle) {
  const radians = (angle * Math.PI) / 180;
  return [round(radius * Math.cos(radians)), round(radius * Math.sin(radians))];
}

function evenAngles(count, rotation) {
  return Array.from({ length: count }, (_, index) => rotation + (360 / count) * index);
}

// Draws {points/step}. Compound stars such as {6/2} need one closed path per cycle (two triangles).
function starPolygonPath(points, step, radius, rotation) {
  const visited = new Array(points).fill(false);
  let path = "";
  for (let start = 0; start < points; start += 1) {
    if (visited[start]) {
      continue;
    }
    let index = start;
    let command = "M";
    do {
      visited[index] = true;
      const [x, y] = polar(radius, rotation + (360 / points) * index);
      path += `${command}${x} ${y}`;
      command = "L";
      index = (index + step) % points;
    } while (index !== start);
    path += "Z";
  }
  return path;
}

function radialLinesPath(angles, innerRadius, outerRadius) {
  return angles
    .map((angle) => {
      const [x1, y1] = polar(innerRadius, angle);
      const [x2, y2] = polar(outerRadius, angle);
      return `M${x1} ${y1}L${x2} ${y2}`;
    })
    .join("");
}

// A zero-length segment with round caps draws a dot, so a whole ring of beads is a single path element.
function beadsPath(angles, radius) {
  return angles
    .map((angle) => {
      const [x, y] = polar(radius, angle);
      return `M${x} ${y}h0.01`;
    })
    .join("");
}

// The four-point star from the Lorelight logo.
function fourPointStarPath(outerRadius, innerRadius) {
  const corners = evenAngles(8, -90).map((angle, index) => {
    const [x, y] = polar(index % 2 === 0 ? outerRadius : innerRadius, angle);
    return `${index === 0 ? "M" : "L"}${x} ${y}`;
  });
  return `${corners.join("")}Z`;
}

// A horizontal rule through the seal that reaches the edges of wide banners, with a small lozenge on each side.
function meridianPaths(lozengeX) {
  const lozenges = [lozengeX, -lozengeX].map((x) => `M${x - 4} 0L${x} -2.6L${x + 4} 0L${x} 2.6Z`).join("");
  const lineStart = lozengeX + 7;
  return { lozenges, lines: `M${lineStart} 0H420M${-lineStart} 0H-420` };
}

function buildFigure(random, figureType, points, step, rotation) {
  const sector = 360 / points;
  const halfTurn = Math.PI / points;

  if (figureType === "rosette") {
    // Circles whose edges all pass through the centre: a classic petal rosette.
    const circles = evenAngles(points, rotation).map((angle) => {
      const [cx, cy] = polar(STAR_RADIUS / 2, angle);
      return { cx, cy, r: STAR_RADIUS / 2 };
    });
    return { paths: [], circles, innerRadius: round(STAR_RADIUS * 0.36) };
  }

  if (figureType === "nested") {
    // Each polygon touches the edge midpoints of the one around it, turned by half a sector.
    const paths = [0, 1, 2].map((level) =>
      starPolygonPath(points, 1, STAR_RADIUS * Math.cos(halfTurn) ** level, rotation + (sector / 2) * level),
    );
    return { paths, circles: [], innerRadius: round(STAR_RADIUS * Math.cos(halfTurn) ** 3) };
  }

  const paths = [starPolygonPath(points, step, STAR_RADIUS, rotation)];
  if (chance(random, 0.5)) {
    paths.push(starPolygonPath(points, 1, STAR_RADIUS, rotation));
  }
  // Radius of the star's inner corners, so a ring can sit exactly on them.
  const innerRadius = (STAR_RADIUS * Math.cos(halfTurn * step)) / Math.cos(halfTurn * (step - 1));
  return { paths, circles: [], innerRadius: round(innerRadius) };
}

// Everything ImagePlaceholder needs to draw one sigil, decided by the seed alone.
export function createSigil(seed) {
  const random = createRandom(hashString(String(seed)));

  const points = 5 + Math.floor(random() * 5);
  const step = pick(random, STAR_STEPS[points]);
  const sector = 360 / points;
  const rotation = chance(random, 0.5) ? -90 : -90 + sector / 2;
  const figureType = pick(random, ["star", "star", "rosette", "nested"]);
  const figure = buildFigure(random, figureType, points, step, rotation);
  const vertexAngles = evenAngles(points, rotation);

  const rimStyle = chance(random, 0.6) ? "ticks" : "beads";
  const minorAngles = evenAngles(points * pick(random, [3, 4, 5, 6]), rotation);
  const rim = {
    className: rimStyle === "ticks" ? "sigil-line" : "sigil-beads",
    minor:
      rimStyle === "ticks"
        ? radialLinesPath(minorAngles, OUTER_RADIUS - 3.5, OUTER_RADIUS)
        : beadsPath(minorAngles, (OUTER_RADIUS + TICK_RADIUS) / 2),
    major: radialLinesPath(vertexAngles, TICK_RADIUS, OUTER_RADIUS),
  };

  const rings = [{ radius: OUTER_RADIUS, isBold: true }];
  if (rimStyle === "beads" || chance(random, 0.7)) {
    rings.push({ radius: TICK_RADIUS, isBold: false });
  }
  if (chance(random, 0.45)) {
    rings.push({ radius: STAR_RADIUS, isBold: false });
  }
  if (chance(random, 0.7)) {
    rings.push({ radius: figure.innerRadius, isBold: false });
  }

  const border = pick(random, ["single", "double", "beaded"]);
  if (border === "double") {
    rings.push({ radius: OUTER_RADIUS + 3.5, isBold: false });
  }
  const borderBeads =
    border === "beaded" ? beadsPath(evenAngles(points * pick(random, [6, 8]), rotation), OUTER_RADIUS + 4.5) : null;

  const spokeEnd = figureType === "star" ? figure.innerRadius : STAR_RADIUS * Math.cos(Math.PI / points);
  const spokes = chance(random, 0.4)
    ? radialLinesPath(evenAngles(points, rotation + sector / 2), HUB_RADIUS + 3, spokeEnd)
    : null;
  const vertexDots = chance(random, 0.8) ? beadsPath(vertexAngles, STAR_RADIUS) : null;

  const centerType = pick(random, ["star", "star", "ring", "seal"]);
  const center = {
    type: centerType,
    path: centerType === "seal" ? starPolygonPath(points, 1, 8, rotation) : fourPointStarPath(10, 2.6),
  };

  const echoStart = Math.floor(random() * 3);
  const echoRings = ECHO_RADII.slice(echoStart, echoStart + 1 + Math.floor(random() * 3));
  const echoBeads = chance(random, 0.5) ? beadsPath(evenAngles(points * 8, rotation), echoRings[0] - 8) : null;
  const meridian = chance(random, 0.5) ? meridianPaths(OUTER_RADIUS + 14) : null;

  const frame = pick(random, ["double", "double", "single", "none"]);
  const texture = pick(random, TEXTURES);
  const ink = pick(random, PROJECT_INKS);
  const glow = pick(random, PROJECT_GLOWS);

  return {
    ink,
    accent: GOLD_ACCENT,
    glow,
    texture,
    textureOpacity: 0.085,
    frame,
    figure,
    rim,
    rings,
    borderBeads,
    spokes,
    vertexDots,
    center,
    hubRadius: HUB_RADIUS,
    echoRings,
    echoBeads,
    meridian,
  };
}
