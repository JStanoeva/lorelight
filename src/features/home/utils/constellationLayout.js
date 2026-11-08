// Angles are degrees clockwise from the top, radius a share of the ring, x/y a unit circle with
// y down. Past `maxPerRing`, every other star moves to an inner track so the names never crowd.
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

// The arc between two neighbour stars; ringRadius is in SVG units, bow > 1 pushes it outwards
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
