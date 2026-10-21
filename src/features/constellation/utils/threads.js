import { createRandom, hashString } from "../../../shared/utils/seededRandom.js";
import { LORE_CATEGORIES } from "../../lore/constants/categories.js";
import { getCategory } from "../../lore/utils/getCategory.js";

// The star-threads: the saved entries of one category are joined by threads between their
// star-pins, so every category forms its own constellation on the board. A thread runs from pin
// to pin in a gentle curve, behind the cards: it shows in the gaps and passes under the cards on
// its way, while the pins sit on top of the cards and hold both of its ends.

// The furthest a thread bows away from the straight line between its two pins, in pixels
const MAX_BOW = 44;

function round(value) {
  return Math.round(value * 10) / 10;
}

// How many of the entries belong to each category: { character: 3, location: 2 }. An unknown
// category counts as "Other", like everywhere else (getCategory).
export function countByCategory(entries) {
  const counts = {};
  entries.forEach((entry) => {
    const { value } = getCategory(entry.category);
    counts[value] = (counts[value] ?? 0) + 1;
  });
  return counts;
}

// Prim's algorithm joins all the points without any loops. It starts with the first point
// connected. Each round, it finds the shortest straight line from a connected point to one that
// isn't connected yet and connects that point, until every point is connected. So each card is
// threaded to its nearest neighbours of the same category instead of zigzagging across the
// board. Returns pairs of indexes into `points`.
function minimumSpanningTree(points) {
  const edges = [];
  const isConnected = points.map((_, index) => index === 0);

  for (let added = 1; added < points.length; added += 1) {
    let best = null;
    for (let fromIndex = 0; fromIndex < points.length; fromIndex += 1) {
      for (let toIndex = 0; toIndex < points.length; toIndex += 1) {
        if (isConnected[fromIndex] && !isConnected[toIndex]) {
          const from = points[fromIndex];
          const to = points[toIndex];
          const length = Math.hypot(to.x - from.x, to.y - from.y);
          if (!best || length < best.length) {
            best = { fromIndex, toIndex, length };
          }
        }
      }
    }
    isConnected[best.toIndex] = true;
    edges.push([best.fromIndex, best.toIndex]);
  }

  return edges;
}

// A gentle curve from one pin to another: an SVG quadratic curve ("Q"), which bends towards a
// control point beside the middle of the straight line. It bows upwards, so a thread between two
// cards of one row curves into the gap above them, where it stays visible. The amount is seeded
// from the two entry ids, so the same two pins always get the same curve, and the threads don't
// all bend alike.
function curvedPath(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;

  // A unit vector at a right angle to the straight line, turned so it points up
  let normalX = dy / length;
  let normalY = -dx / length;
  if (normalY > 0) {
    normalX = -normalX;
    normalY = -normalY;
  }

  const random = createRandom(hashString(`${start.id}|${end.id}`));
  const bow = Math.min(MAX_BOW, length * (0.08 + random() * 0.08));
  const controlX = (start.x + end.x) / 2 + normalX * bow;
  const controlY = (start.y + end.y) / 2 + normalY * bow;

  return `M${round(start.x)} ${round(start.y)} Q${round(controlX)} ${round(controlY)} ${round(end.x)} ${round(end.y)}`;
}

// Every thread to draw for these entries: [{ key, category, colorClassName, path }]. `pins` holds
// the measured star-pin centres by entry id (usePinPositions); without them (not measured yet)
// there are no threads.
export function buildThreads(entries, pins) {
  if (!pins) {
    return [];
  }

  const threads = [];

  LORE_CATEGORIES.forEach((category) => {
    const points = entries
      .filter((entry) => getCategory(entry.category).value === category.value && pins[entry.id])
      .map((entry) => ({ id: entry.id, x: pins[entry.id].x, y: pins[entry.id].y }));

    minimumSpanningTree(points).forEach(([fromIndex, toIndex]) => {
      const start = points[fromIndex];
      const end = points[toIndex];
      threads.push({
        key: `${start.id}|${end.id}`,
        category: category.value,
        colorClassName: category.starClassName,
        path: curvedPath(start, end),
      });
    });
  });

  return threads;
}
