// Where each category star sits on the orrery's wheel. Pure and deterministic: the same count
// always gives the same wheel, so a new category is simply one more star on the ring.
//
// getOrreryLayout(count) → { stars, lines }
//   stars: [{ angle, radius, x, y }] in category order
//     angle  – degrees clockwise from the top (the top is the reading position)
//     radius – share of the ring radius (1 = on the ring)
//     x, y   – the same point in a unit circle, y growing downwards like the screen
//   lines: [[i, j], …] neighbours on the ring (each star to the next, the last back to the first)
//
// Up to `maxPerRing` stars share one ring. A larger set alternates between the ring and a
// slightly smaller inner track, so the stars (and their names) never crowd each other.
export function getOrreryLayout(count, { maxPerRing = 16, innerTrack = 0.86 } = {}) {
  if (count <= 0) {
    return { stars: [], lines: [] };
  }

  const step = 360 / count;
  const usesTwoTracks = count > maxPerRing;

  const stars = Array.from({ length: count }, (_, index) => {
    const angle = index * step;
    const radius = usesTwoTracks && index % 2 === 1 ? innerTrack : 1;
    const radians = (angle * Math.PI) / 180;

    return { angle, radius, x: radius * Math.sin(radians), y: -radius * Math.cos(radians) };
  });

  let lines = [];
  if (count === 2) {
    lines = [[0, 1]];
  } else if (count > 2) {
    lines = stars.map((_, index) => [index, (index + 1) % count]);
  }

  return { stars, lines };
}

// The SVG path of one neighbour line: a gentle arc that bows outwards between two stars, so
// the lines form a scalloped crown around the ring (like the tracery of an astrolabe)
// instead of a plain polygon. ringRadius is in SVG units; bow > 1 pushes the arc outwards.
export function getNeighbourArcPath(from, to, ringRadius, bow = 1.13) {
  const turn = (((to.angle - from.angle) % 360) + 360) % 360;
  const midAngle = ((from.angle + turn / 2) * Math.PI) / 180;
  const controlRadius = ringRadius * bow * ((from.radius + to.radius) / 2);
  const round = (value) => value.toFixed(2);

  return [
    `M ${round(from.x * ringRadius)} ${round(from.y * ringRadius)}`,
    `Q ${round(controlRadius * Math.sin(midAngle))} ${round(-controlRadius * Math.cos(midAngle))}`,
    `${round(to.x * ringRadius)} ${round(to.y * ringRadius)}`,
  ].join(" ");
}

// Which star a key moves to: Right/Down = the next one clockwise, Left/Up = the previous one,
// Home/End = the first/last. null = the key doesn't move between stars.
export function getStarKeyTarget(key, index, count) {
  if (key === "ArrowRight" || key === "ArrowDown") {
    return (index + 1) % count;
  }
  if (key === "ArrowLeft" || key === "ArrowUp") {
    return (index - 1 + count) % count;
  }
  if (key === "Home") {
    return 0;
  }
  if (key === "End") {
    return count - 1;
  }
  return null;
}
