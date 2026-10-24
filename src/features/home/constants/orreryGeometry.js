// Sizes of the category orrery, in its engraving's 1000 × 1000 SVG box (the centre is 0, 0).
// They are the one source of truth: OrreryEngraving draws the circles with them, and
// ORRERY_CSS_SIZES hands the ones orrery.css needs to the wheel as CSS custom properties.
export const STAR_RING = 300;
export const LENS_RADIUS = 250;
export const BAND_INNER = 262;
export const BAND_OUTER = 274;
export const HUB_RADIUS = 58;
export const LIMB_INNER = 482;
export const LIMB_OUTER = 496;

// The same sizes as shares of the wheel's width (the box is 1000 units wide), so the star
// buttons, the lens and the orbiting lights in CSS sit exactly on the circles of the drawing.
// CategoryOrrery sets them on the wheel element (style={ORRERY_CSS_SIZES}).
export const ORRERY_CSS_SIZES = {
  "--star-ring": STAR_RING / 1000,
  "--lens-radius": LENS_RADIUS / 1000,
  "--band-radius": (BAND_INNER + BAND_OUTER) / 2000,
  "--limb-radius": (LIMB_INNER + LIMB_OUTER) / 2000,
};
