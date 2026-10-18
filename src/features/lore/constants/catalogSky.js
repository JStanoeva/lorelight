// The two faint constellations at the sides of the Lore Catalog's hero (wide screens only).
// Hand-placed, so every visit shows the same sky. `stars` are [x, y, radius] points in a
// 200 × 124 box; `lines` join two stars by their index in `stars`.
export const CATALOG_CONSTELLATIONS = [
  {
    id: "left",
    className: "catalog-constellation-left",
    stars: [
      [14, 96, 1.6],
      [52, 70, 2.2],
      [88, 82, 1.4],
      [118, 38, 2.6],
      [160, 52, 1.8],
      [146, 104, 1.5],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 5],
    ],
  },
  {
    id: "right",
    className: "catalog-constellation-right",
    stars: [
      [18, 44, 2],
      [62, 22, 1.5],
      [104, 58, 2.6],
      [150, 34, 1.6],
      [186, 84, 2.1],
      [118, 108, 1.4],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [2, 4],
      [2, 5],
    ],
  },
];
