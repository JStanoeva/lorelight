// The drawing of the closing strip's lantern (ClosingLantern), as data: gold line work with a
// dark umber understroke over violet enamel, three gothic arched windows, a riveted frieze, a
// hipped roof with a gold ball on each eave corner, and a faceted star lighting warm glass.
// A 512 × 512 viewBox, mirror-symmetric around x = 256. The light comes from the star inside
// (the glass and the inner frame edges) and from the top left (the metal's left facets are the
// lightest, the right ones the darkest).

export const VIEWBOX = 512;
const CX = 256;

// Where the star's arms cross (the centre of the light): 50% across and 65.6% down, where the
// closing strip's bloom sits (home.css)
export const LIGHT = { x: 256, y: 336 };
export const HALO_RADIUS = 96;

const round = (value) => Math.round(value * 10) / 10;

// Mirrors a path across the centre line: every "x,y" pair becomes "(512 - x),y". It only works
// for paths written with absolute "x,y" pairs (M, L, Q, C and Z).
function mirror(d) {
  return d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${round(2 * CX - Number(x))},${y}`);
}

// A right-hand shape and its mirrored left-hand twin
const both = (d) => [d, mirror(d)];

// A symmetric trapezoid from y top to y bottom: its half-widths at the top and the bottom edge
function band(top, bottom, halfTop, halfBottom = halfTop) {
  return `M${CX - halfTop},${top}L${CX + halfTop},${top}L${CX + halfBottom},${bottom}L${CX - halfBottom},${bottom}Z`;
}

// The right side facet of a hexagonal part (the left one is its mirror): from the front edge
// (frontTop → frontBottom) out to the silhouette (outerTop → outerBottom), as half-widths
function sideFacet(top, bottom, frontTop, outerTop, outerBottom, frontBottom) {
  return `M${CX + frontTop},${top}L${CX + outerTop},${top}L${CX + outerBottom},${bottom}L${CX + frontBottom},${bottom}Z`;
}

const polygon = (points) => `M${points.map(([x, y]) => `${round(x)},${round(y)}`).join("L")}Z`;

// The brand's tall four-point star (constants/starPath.js: 24 × 34, the arms crossing at
// 12, 20), scaled to a height and moved so its arms cross at (x, y). Used for the small
// engraved stars and the sparkles.
function starPathAt(x, y, height) {
  const scale = height / 34;
  const point = (px, py) => `${round(x + (px - 12) * scale)},${round(y + (py - 20) * scale)}`;
  return (
    `M${point(12, 0)}Q${point(13.4, 17.4)} ${point(20, 20)}Q${point(13.4, 21.6)} ${point(12, 34)}` +
    `Q${point(10.6, 21.6)} ${point(4, 20)}Q${point(10.6, 17.4)} ${point(12, 0)}Z`
  );
}

// ---------- Proportions ----------
// y: ring 31–85, bead 81.5–94.5, finial 90–118, collar 118–129, lip 129–134, roof 134–204,
// eave 204–217 (corner balls 193.5–208.5), soffit 217–224, frieze 224–239, glass 239–429,
// bottom rail 429–439, sill 439–449, base 449–474, foot rim 474–482

const BEAD = { cy: 88, r: 6.5 };
// The eave: a gold band 13 units thick (its outer edge slants in a little), then the soffit
const EAVE = { top: 204, bottom: 217, half: 134, halfBottom: 130 };
const FRIEZE_TOP = 224;
// The eave's gold corner balls, one on each top corner of the eave, over the foot of the roof's
// hip, like the finial balls on a classic street lantern: dx = half-width to the centre
const EAVE_BEAD = { dx: 129, cy: 201, r: 7.5 };
const GLASS_TOP = 239;
const GLASS_BOTTOM = 429;
// Half-widths of the body: the silhouette (the corner posts' outer edge) and the front posts'
// centre line, at the top and the bottom of the glass (the body narrows a little downwards)
const BODY = { top: 124, bottom: 108 };
const FRONT_POST = { top: 62, bottom: 54, half: 4.5 };
const CORNER_POST = 9;

// The roof's hips, as quadratic curves with only a slight sag (as half-widths). The roof's
// facets (ROOF_FRONT, ROOF_RIGHT) and the outline repeat their ends, so change them together.
const HIP_FRONT = { top: [15, 134], control: [38.9, 173.8], bottom: [70, 204] };
const HIP_OUTER = { top: [30, 134], control: [72.5, 173.8], bottom: [126, 204] };
const hip = ({ top, control, bottom }, sign = 1) => {
  const x = (dx) => round(CX + sign * dx);
  return `M${x(top[0])},${top[1]}Q${x(control[0])},${control[1]} ${x(bottom[0])},${bottom[1]}`;
};

// ---------- The star ----------
// A tall four-point star, the top arm the longest like the brand star, with straight edges and
// cut like a gem: every arm has a lit and a shaded half, lit from the top left. Pale gold on the
// lit faces, deep amber on the shaded ones, a white-hot core where the arms cross. Its top tip
// stops just under the front window's arch. Points relative to LIGHT.

const STAR_TIPS = { top: [0, -80], right: [37, 0], bottom: [0, 58], left: [-37, 0] };
const STAR_WAISTS = {
  topRight: [9.5, -10.5],
  bottomRight: [9.5, 8.5],
  bottomLeft: [-9.5, 8.5],
  topLeft: [-9.5, -10.5],
};
// [tip, waist, colour]: two facets per arm
const STAR_FACET_LIST = [
  ["top", "topLeft", "#fff6dc"],
  ["top", "topRight", "#f2c877"],
  ["right", "topRight", "#ffe2a2"],
  ["right", "bottomRight", "#d48434"],
  ["bottom", "bottomRight", "#bd6c27"],
  ["bottom", "bottomLeft", "#e9a24c"],
  ["left", "bottomLeft", "#f3bd6c"],
  ["left", "topLeft", "#fff0c6"],
];

const starPoint = ([dx, dy]) => [LIGHT.x + dx, LIGHT.y + dy];

// Each facet is a triangle: the centre, an arm's tip and the waist beside it
export const STAR_FACETS = STAR_FACET_LIST.map(([tip, waist, fill]) => ({
  d: polygon([[LIGHT.x, LIGHT.y], starPoint(STAR_TIPS[tip]), starPoint(STAR_WAISTS[waist])]),
  fill,
}));

// The whole star's edge, drawn as a thin deep-amber line under the facets, so the star still
// reads as a star against the bright glass
export const STAR_OUTLINE = polygon(
  [
    STAR_TIPS.top,
    STAR_WAISTS.topRight,
    STAR_TIPS.right,
    STAR_WAISTS.bottomRight,
    STAR_TIPS.bottom,
    STAR_WAISTS.bottomLeft,
    STAR_TIPS.left,
    STAR_WAISTS.topLeft,
  ].map(starPoint),
);
export const STAR_CORE_RADIUS = 13;
export const STAR_GLOW_RADIUS = 70;

// ---------- Colours ----------

export const INK = "#2a170a"; // the umber understroke and seams, so the gold also reads on light surfaces
export const GOLD = "#f2d38f";
export const STAR_EDGE = "#7c3c12";

// Gradients: [id, kind, attributes, stops [offset, colour, opacity?]]. ClosingLantern gives the
// ids a prefix of its own, so they never clash with other ids on the page.
export const GRADIENTS = [
  ["goldBar", "linear", { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, "#fff3cc"], [0.32, "#f2d38f"], [0.66, "#cf9a45"], [1, "#7c511d"]]],
  ["goldPost", "linear", { x1: 0, y1: 0, x2: 1, y2: 0 }, [[0, "#8a5c22"], [0.3, "#f4d690"], [0.5, "#fff0c6"], [0.75, "#cf9a47"], [1, "#6a4418"]]],
  ["goldRing", "linear", { x1: 0.1, y1: 0, x2: 0.9, y2: 1 }, [[0, "#fff4d2"], [0.36, "#efca7c"], [0.72, "#b9853a"], [1, "#6c4517"]]],
  // The finial's three gold facets, lit from the top left
  ["goldLeft", "linear", { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, "#fff4d2"], [1, "#e6bd6c"]]],
  ["goldFront", "linear", { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, "#f2d38f"], [1, "#c08a3e"]]],
  ["goldRight", "linear", { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, "#b9853a"], [1, "#6c4517"]]],
  ["enamelLeft", "linear", { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, "#7d5fcb"], [1, "#46309a"]]],
  ["enamelFront", "linear", { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, "#5538a6"], [1, "#2a1869"]]],
  ["enamelRight", "linear", { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, "#33207a"], [1, "#160b42"]]],
  ["frieze", "linear", { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, "#140a38"], [0.45, "#2d1d70"], [1, "#1e1152"]]],
  ["soffit", "linear", { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, "#07031a"], [1, "#1b1045"]]],
  // The base faces down, away from the light: darker than the roof
  ["baseLeft", "linear", { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, "#4c3497"], [1, "#22135a"]]],
  ["underside", "linear", { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, "#30207a"], [1, "#120838"]]],
  ["baseRight", "linear", { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, "#1f1252"], [1, "#0a0428"]]],
  // The glass: gold near the star, through peach and rose to lavender at the corners
  [
    "glass",
    "radial",
    { gradientUnits: "userSpaceOnUse", cx: LIGHT.x, cy: LIGHT.y - 4, r: 158 },
    [[0, "#ffd98c"], [0.22, "#ffbf6b"], [0.48, "#fb9c66"], [0.62, "#e9878e"], [0.78, "#bd76be"], [1, "#9a64c2"]],
  ],
  // The side panes turn away from us, so they turn violet towards their outer edge (lantern-500
  // on the lit left, lantern-700 on the right): rose turning lavender, not grey
  ["sideShadeLeft", "linear", { gradientUnits: "userSpaceOnUse", x1: 190, y1: 0, x2: 141, y2: 0 }, [[0, "#7a4faf", 0.05], [1, "#7a4faf", 0.5]]],
  ["sideShadeRight", "linear", { gradientUnits: "userSpaceOnUse", x1: 322, y1: 0, x2: 371, y2: 0 }, [[0, "#392781", 0.12], [1, "#392781", 0.55]]],
  // The top of the glass sits in the roof's shadow, the bottom in the base's
  ["glassShade", "linear", { gradientUnits: "userSpaceOnUse", x1: 0, y1: GLASS_TOP, x2: 0, y2: GLASS_BOTTOM }, [[0, "#0b0620", 0.55], [0.2, "#0b0620", 0], [0.86, "#0b0620", 0], [1, "#0b0620", 0.4]]],
  // The star's warm light on the frame around the glass (posts, rails)
  ["frameGlow", "radial", { gradientUnits: "userSpaceOnUse", cx: LIGHT.x, cy: LIGHT.y, r: 175 }, [[0, "#f2b26e", 0.34], [0.4, "#e8a070", 0.12], [1, "#e8a070", 0]]],
  [
    "halo",
    "radial",
    { gradientUnits: "userSpaceOnUse", cx: LIGHT.x, cy: LIGHT.y, r: HALO_RADIUS },
    [[0, "#ffeec4", 0.42], [0.3, "#f9d68f", 0.2], [0.65, "#eaa970", 0.06], [1, "#eaa970", 0]],
  ],
  ["starGlow", "radial", { gradientUnits: "userSpaceOnUse", cx: LIGHT.x, cy: LIGHT.y, r: STAR_GLOW_RADIUS }, [[0, "#fff3d0", 0.75], [0.3, "#ffd88f", 0.34], [1, "#ffd88f", 0]]],
  ["starCore", "radial", { gradientUnits: "userSpaceOnUse", cx: LIGHT.x, cy: LIGHT.y, r: STAR_CORE_RADIUS }, [[0, "#ffffff", 1], [0.45, "#fffbea", 0.85], [1, "#fffbea", 0]]],
  // The star's light on the frame edges: strongest close to the star
  ["spill", "radial", { gradientUnits: "userSpaceOnUse", cx: LIGHT.x, cy: LIGHT.y, r: 150 }, [[0, "#fff0c8", 1], [0.5, "#ffe2a4", 0.85], [1, "#ffe2a4", 0.1]]],
  // The soft glow around each sparkle and the ring's glint (sized to the circle it fills)
  ["sparkle", "radial", {}, [[0, "#fff4d0", 0.9], [1, GOLD, 0]]],
];

// ---------- The metal (filled parts, painted back to front) ----------
// [d, fill gradient id]. Each part gets a thin umber seam (a stroke painted under the fill).

const [FRONT_CONTROL_X, HIP_CONTROL_Y] = HIP_FRONT.control;
const OUTER_CONTROL_X = HIP_OUTER.control[0];
const ROOF_FRONT =
  `M${CX - 15},134L${CX + 15},134Q${CX + FRONT_CONTROL_X},${HIP_CONTROL_Y} ${CX + 70},204` +
  `L${CX - 70},204Q${CX - FRONT_CONTROL_X},${HIP_CONTROL_Y} ${CX - 15},134Z`;
const [ROOF_RIGHT, ROOF_LEFT] = both(
  `M${CX + 15},134L${CX + 30},134Q${CX + OUTER_CONTROL_X},${HIP_CONTROL_Y} ${CX + 126},204` +
    `L${CX + 70},204Q${CX + FRONT_CONTROL_X},${HIP_CONTROL_Y} ${CX + 15},134Z`,
);

// The finial: a short gold pyramid under the bead, three facets
const FINIAL_APEX = [CX, 90];
const FINIAL_BASE = { y: 118, front: 7, outer: 15 };
const [FINIAL_RIGHT, FINIAL_LEFT] = both(
  polygon([FINIAL_APEX, [CX + FINIAL_BASE.front, FINIAL_BASE.y], [CX + FINIAL_BASE.outer, FINIAL_BASE.y]]),
);
const FINIAL_FRONT = polygon([FINIAL_APEX, [CX + FINIAL_BASE.front, FINIAL_BASE.y], [CX - FINIAL_BASE.front, FINIAL_BASE.y]]);

// A circle as a path (two half arcs), so it can share the filled parts' list
const circlePath = (cx, cy, r) => `M${round(cx - r)},${cy}A${r},${r} 0 1 0 ${round(cx + r)},${cy}A${r},${r} 0 1 0 ${round(cx - r)},${cy}Z`;

// The window posts: sign -1 for the left one, 1 for the right one
const postFront = (sign) => {
  const x = (dx) => CX + sign * dx;
  return `M${x(FRONT_POST.top - FRONT_POST.half)},${GLASS_TOP}L${x(FRONT_POST.top + FRONT_POST.half)},${GLASS_TOP}L${x(FRONT_POST.bottom + FRONT_POST.half)},${GLASS_BOTTOM}L${x(FRONT_POST.bottom - FRONT_POST.half)},${GLASS_BOTTOM}Z`;
};
const postCorner = (sign) => {
  const x = (dx) => CX + sign * dx;
  return `M${x(BODY.top - CORNER_POST)},${GLASS_TOP}L${x(BODY.top)},${GLASS_TOP}L${x(BODY.bottom)},${GLASS_BOTTOM}L${x(BODY.bottom - CORNER_POST)},${GLASS_BOTTOM}Z`;
};

const [BASE_RIGHT, BASE_LEFT] = both(sideFacet(449, 474, 57, 114, 94, 47));

export const METAL_BACK = [
  // Ring (the outer circle, then the hole: evenodd)
  [`M229,58A27,27 0 1 0 283,58A27,27 0 1 0 229,58ZM238,58A18,18 0 1 1 274,58A18,18 0 1 1 238,58Z`, "goldRing"],
  // The finial, then the bead the ring passes through (it covers the finial's tip)
  [FINIAL_LEFT, "goldLeft"],
  [FINIAL_FRONT, "goldFront"],
  [FINIAL_RIGHT, "goldRight"],
  [circlePath(CX, BEAD.cy, BEAD.r), "goldRing"],
  // Collar (a small hexagonal cap)
  [mirror(sideFacet(118, 129, 11, 20, 24, 13)), "enamelLeft"],
  [band(118, 129, 11, 13), "enamelFront"],
  [sideFacet(118, 129, 11, 20, 24, 13), "enamelRight"],
  // Lip plate the roof hangs from
  [band(129, 134, 34, 36), "goldBar"],
  // Roof: three facets
  [ROOF_LEFT, "enamelLeft"],
  [ROOF_FRONT, "enamelFront"],
  [ROOF_RIGHT, "enamelRight"],
  // Eave: a plain band, its shadowed underside, and a gold ball on each top corner
  [band(EAVE.top, EAVE.bottom, EAVE.half, EAVE.halfBottom), "goldBar"],
  [band(EAVE.bottom, FRIEZE_TOP, EAVE.halfBottom, 125), "soffit"],
  [circlePath(CX - EAVE_BEAD.dx, EAVE_BEAD.cy, EAVE_BEAD.r), "goldRing"],
  [circlePath(CX + EAVE_BEAD.dx, EAVE_BEAD.cy, EAVE_BEAD.r), "goldRing"],
  // Top rail (the frieze under the eave)
  [band(FRIEZE_TOP, GLASS_TOP, 125, 124), "frieze"],
];

// The glass between the rails (lit by the glass gradient); the posts are drawn over it
export const GLASS = band(GLASS_TOP, GLASS_BOTTOM, BODY.top, BODY.bottom);

// x of a line from (top, GLASS_TOP) to (bottom, GLASS_BOTTOM) at height y
const along = (top, bottom, y) => top + ((bottom - top) * (y - GLASS_TOP)) / (GLASS_BOTTOM - GLASS_TOP);

// The panes' edges (half-widths from the centre line), at the top and the bottom of the glass
const FRONT_PANE = { top: FRONT_POST.top - FRONT_POST.half, bottom: FRONT_POST.bottom - FRONT_POST.half };
const SIDE_PANE_INNER = { top: FRONT_POST.top + FRONT_POST.half, bottom: FRONT_POST.bottom + FRONT_POST.half };
const SIDE_PANE_OUTER = { top: BODY.top - CORNER_POST, bottom: BODY.bottom - CORNER_POST };

const sidePane = sideFacet(GLASS_TOP, GLASS_BOTTOM, SIDE_PANE_INNER.top, SIDE_PANE_OUTER.top, SIDE_PANE_OUTER.bottom, SIDE_PANE_INNER.bottom);

// The side panes turn away from us: each darkens towards its outer edge
export const SIDE_PANES = [
  [mirror(sidePane), "sideShadeLeft"],
  [sidePane, "sideShadeRight"],
];

// Facets in the glass, for depth: the light's diamond around the star, cooler top corners and
// rosier bottom corners in the front pane, and a light wedge in each side pane.
// [d, colour, opacity]
const frontAtStar = along(FRONT_PANE.top, FRONT_PANE.bottom, LIGHT.y);
const sideAtStar = along(SIDE_PANE_OUTER.top, SIDE_PANE_OUTER.bottom, LIGHT.y);
const lightWedge = polygon([
  [CX + SIDE_PANE_INNER.top, GLASS_TOP],
  [CX + SIDE_PANE_INNER.bottom, GLASS_BOTTOM],
  [CX + sideAtStar, LIGHT.y],
]);

export const PANE_FACETS = [
  [polygon([[CX, GLASS_TOP + 4], [CX + frontAtStar, LIGHT.y], [CX, GLASS_BOTTOM], [CX - frontAtStar, LIGHT.y]]), "#fff4d6", 0.16],
  [polygon([[CX - FRONT_PANE.top, GLASS_TOP], [CX, GLASS_TOP], [CX - frontAtStar, LIGHT.y]]), "#5b2fa0", 0.3],
  [polygon([[CX, GLASS_TOP], [CX + FRONT_PANE.top, GLASS_TOP], [CX + frontAtStar, LIGHT.y]]), "#5b2fa0", 0.22],
  [polygon([[CX - frontAtStar, LIGHT.y], [CX, GLASS_BOTTOM], [CX - FRONT_PANE.bottom, GLASS_BOTTOM]]), "#c2577a", 0.14],
  [polygon([[CX + frontAtStar, LIGHT.y], [CX + FRONT_PANE.bottom, GLASS_BOTTOM], [CX, GLASS_BOTTOM]]), "#c2577a", 0.22],
  [mirror(lightWedge), "#fff1d0", 0.18],
  [lightWedge, "#fff1d0", 0.14],
];

// The star's warm light falling on the frame around the glass (frieze, posts, bottom rail)
export const FRAME_GLOW = band(FRIEZE_TOP, 439, 125, 110);

export const METAL_FRONT = [
  // Window posts
  [postCorner(-1), "goldPost"],
  [postCorner(1), "goldPost"],
  [postFront(-1), "goldPost"],
  [postFront(1), "goldPost"],
  // Bottom rail, sill plate, base (three facets, its underside in shadow) and the foot rim
  [band(GLASS_BOTTOM, 439, 108, 110), "goldBar"],
  [band(439, 449, 118), "goldBar"],
  [BASE_LEFT, "baseLeft"],
  [band(449, 474, 57, 47), "underside"],
  [BASE_RIGHT, "baseRight"],
  [band(474, 482, 94, 90), "goldBar"],
];

// Arched tops of the three windows (tracery over the glass: enamel with a gold edge)
const FRONT_ARCH = "M200.1,280C200.5,262 228,252 256,243C284,252 311.5,262 311.9,280";
const [SIDE_ARCH_RIGHT, SIDE_ARCH_LEFT] = both("M321.4,268C321.6,256 333,249 345,245C357,249 368.4,256 368.7,268");

export const SPANDRELS = [
  `M198.5,${GLASS_TOP}L313.5,${GLASS_TOP}L311.9,280C311.5,262 284,252 256,243C228,252 200.5,262 200.1,280Z`,
  ...both(`M322.5,${GLASS_TOP}L371,${GLASS_TOP}L368.7,268C368.4,256 357,249 345,245C333,249 321.6,256 321.4,268Z`),
];

export const ARCH_LINES = [FRONT_ARCH, SIDE_ARCH_RIGHT, SIDE_ARCH_LEFT];

// ---------- Gold line work (engraving) ----------

// The outline, one line per side from the top of the ring to the bottom centre, so the intro's
// pen draws both sides at once. Each side is built from the right half's [dx, y] corners.
const OUTLINE_UPPER = [
  [FINIAL_BASE.outer, FINIAL_BASE.y], [20, 118], [24, 129], // finial foot, collar
  [34, 129], [36, 134], // lip
  [30, 134], // roof top
];
// The outline follows the roof's outer hip down to where it meets the corner ball, goes round
// the ball's outside and leaves it down the eave's outer edge (right half, [dx, y]). The hip is
// cut short at the ball: the shorter curve keeps its start, and its control point moves along
// the line from the start towards the hip's own control point.
// Worked out from HIP_OUTER and EAVE_BEAD: update these together with them (and the roof
// sparkle's 16% keyframe in closing-lantern.css, which is HIP_TO_BEAD.end on the left side).
const HIP_TO_BEAD = { control: [70.7, 172.1], end: [121.5, 201.4] };
const EAVE_FROM_BEAD = [133, 207.4];
// Where the eave's top line meets the ball (Pythagoras: the ball's centre is 3 units above it)
const EAVE_LINE_HALF = round(EAVE_BEAD.dx - Math.sqrt(EAVE_BEAD.r ** 2 - (EAVE_BEAD.cy - EAVE.top) ** 2));

const OUTLINE_LOWER = [
  [EAVE.halfBottom, EAVE.bottom], // under the eave
  [125, FRIEZE_TOP], [124, GLASS_TOP], // soffit, frieze
  [108, GLASS_BOTTOM], [110, 439], // body, bottom rail
  [118, 439], [118, 449], // sill
  [114, 449], [94, 474], // base
  [90, 482], [0, 482], // foot rim, bottom centre
];

// One side of the outline: sign 1 for the right side, -1 for the left (its arcs turn the other way)
function outlineSide(sign) {
  const x = (dx) => round(CX + sign * dx);
  const sweep = sign > 0 ? 1 : 0;
  const corners = (list) => list.map(([dx, y]) => `L${x(dx)},${y}`).join("");
  return (
    `M${CX},31A27,27 0 0 ${sweep} ${x(5.4)},84.5A6.5,6.5 0 0 ${sweep} ${x(3.5)},93.5` +
    `${corners(OUTLINE_UPPER)}Q${x(HIP_TO_BEAD.control[0])},${HIP_TO_BEAD.control[1]} ${x(HIP_TO_BEAD.end[0])},${HIP_TO_BEAD.end[1]}` +
    `A${EAVE_BEAD.r},${EAVE_BEAD.r} 0 1 ${sweep} ${x(EAVE_FROM_BEAD[0])},${EAVE_FROM_BEAD[1]}${corners(OUTLINE_LOWER)}`
  );
}

export const OUTLINE = [outlineSide(1), outlineSide(-1)];

// Inner edges: the ring's hole, the hips, the eave and rail lines, the base's front edges
export const DETAIL_LINES = [
  "M256,40A18,18 0 1 1 256,76A18,18 0 1 1 256,40",
  hip(HIP_FRONT),
  hip(HIP_FRONT, -1),
  `M${round(CX - EAVE_LINE_HALF)},${EAVE.top}L${round(CX + EAVE_LINE_HALF)},${EAVE.top}`,
  `M132,${GLASS_TOP}L380,${GLASS_TOP}`,
  `M148,${GLASS_BOTTOM}L364,${GLASS_BOTTOM}`,
  "M138,449L374,449",
  "M199,449L209,474",
  "M313,449L303,474",
  "M166,474L346,474",
];

// A groove cut along the middle of the ring's band (drawn in umber)
export const RING_GROOVE = "M256,35.5A22.5,22.5 0 1 1 256,80.5A22.5,22.5 0 1 1 256,35.5";

// Engraved lines on the roof, the frieze and the base
export const FILIGREE = [
  // Roof: an inset border in the front facet (its sides follow the hips)
  "M244.5,142L267.5,142Q287.2,174 312,198L200,198Q224.8,174 244.5,142Z",
  // Roof: the star rule (a little star between two hairlines), like the base's
  "M226,182L245,182",
  "M267,182L286,182",
  // Frieze: the double frame
  "M134,226.6L378,226.6",
  "M133,236.4L379,236.4",
  // Base: the star rule, as on the Home chapter headings
  "M216,461.5L245,461.5",
  "M267,461.5L296,461.5",
];

// The small stars engraved in the roof and the base: [x, y where the arms cross, height]
const ENGRAVED_STARS = [
  [256, 182, 15],
  [256, 462, 13],
];
export const ENGRAVED_STAR_PATHS = ENGRAVED_STARS.map(([x, y, height]) => starPathAt(x, y, height));

// Rivets: on the frieze above each post and on the bottom rail below it
export const RIVETS = [
  [CX, 231.5],
  [CX - FRONT_POST.top, 231.5],
  [CX + FRONT_POST.top, 231.5],
  [CX - BODY.top + 4.5, 231.5],
  [CX + BODY.top - 4.5, 231.5],
  [CX - FRONT_POST.bottom, 434],
  [CX + FRONT_POST.bottom, 434],
  [CX - BODY.bottom + 5, 434],
  [CX + BODY.bottom - 5, 434],
];

// The star's light on the frame: the glass-side edges of the two right-hand posts and the rail
// below the front window
export const SPILL_LINES = [
  `M${CX + FRONT_PANE.top},${GLASS_TOP}L${CX + FRONT_PANE.bottom},${GLASS_BOTTOM}`,
  `M${CX + SIDE_PANE_OUTER.top},${GLASS_TOP}L${CX + SIDE_PANE_OUTER.bottom},${GLASS_BOTTOM}`,
  `M206,${GLASS_BOTTOM - 1}L306,${GLASS_BOTTOM - 1}`,
];

// ---------- Idle sparkles ----------

// The small star at the heart of each sparkle that travels along the frame. Drawn around
// (0, 0): closing-lantern.css moves it into place.
export const SPARKLE_PATH = starPathAt(0, 0, 22);

// The ring's glint: a highlight along the ring's band on its upper left (an arc around the
// ring's centre, 256, 58), and a star that turns on the ring's outer edge (drawn around (0, 0),
// like the sparkles)
export const GLINT_ARC = "M234.3,68.1A24,24 0 0 1 247.8,35.5";
export const GLINT_STAR_PATH = starPathAt(0, 0, 26);
