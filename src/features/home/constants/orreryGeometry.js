// Units of the engraving's 1000 × 1000 SVG box (centre 0, 0); orrery.css reads them via
// ORRERY_CSS_SIZES.
export const STAR_RING = 300;
export const LENS_RADIUS = 250;
export const BAND_INNER = 262;
export const BAND_OUTER = 274;
export const HUB_RADIUS = 58;
export const LIMB_INNER = 482;
export const LIMB_OUTER = 496;

// As shares of the wheel's width, so the CSS parts sit exactly on the drawn circles.
export const ORRERY_CSS_SIZES = {
  "--star-ring": STAR_RING / 1000,
  "--lens-radius": LENS_RADIUS / 1000,
  "--band-radius": (BAND_INNER + BAND_OUTER) / 2000,
  "--limb-radius": (LIMB_INNER + LIMB_OUTER) / 2000,
};
