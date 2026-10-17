// One line-art emblem per lore category, keyed by the category value (see categories.js).
// They are drawn in a box from -50 to 50 (centre 0, 0) and stay inside about -42..42.
// lines: outlines · rings: outlined circles [cx, cy, r] · fills: solid shapes · dots: solid circles
// tints: soft see-through fills behind the outlines.
// `ink` evens out the brightness: light colours (yellow, amber) and busy emblems would outshine
// the darker violet and slate ones, so they print a little fainter (1 = full strength).
export const LORE_EMBLEMS = {
  // A cameo: a classical bust in profile, with its hair tied in a knot, inside an oval frame
  character: {
    lines: ["M0 -42A30 42 0 0 1 0 42A30 42 0 0 1 0 -42Z"],
    fills: [
      "M-17 31C-16 24 -12 19 -7 16C-11 12 -13 7 -13 2C-19 0 -22 -7 -19 -13C-17 -18 -12 -19 -10 -17C-8 -25 -1 -29 6 -28C14 -27 18 -20 18 -13L22 -5L18 -3Q20 0 17 2Q19 5 16 8Q14 11 9 11L9 15C14 18 18 23 19 30Q1 36 -17 31Z",
    ],
    ink: 0.7,
  },
  // Two peaks with a snow line and a winding path to a waypoint
  location: {
    tints: ["M-40 26L-16 -10L-6 4L10 -24L40 26Z"],
    lines: [
      "M-40 26L-16 -10L-6 4L10 -24L40 26",
      "M-43 26H43",
      "M3.7 -13L7 -9.5L10 -13L13 -9.5L16.6 -13",
      "M-6 26C-6 18 10 17 8 11C6 6 -2 6 0 1",
    ],
    dots: [[0, 1, 2.8]],
    ink: 1,
  },
  // A hanging gonfalon (a swallowtail banner) with two chevrons
  faction: {
    tints: ["M-23 -32V28L0 15L23 28V-32Z"],
    lines: ["M-30 -32H30", "M-23 -32V28L0 15L23 28V-32", "M-13 -19L0 -8L13 -19", "M-13 -4L0 7L13 -4", "M0 -32V-38"],
    fills: ["M0 -47L4 -42L0 -37L-4 -42Z"],
    dots: [
      [-30, -32, 3.2],
      [30, -32, 3.2],
    ],
    ink: 0.9,
  },
  // An hourglass with falling sand
  history: {
    lines: [
      "M-26 -38H26M-26 38H26",
      "M-18 -38C-18 -14 -4 -8 -4 0C-4 8 -18 14 -18 38M18 -38C18 -14 4 -8 4 0C4 8 18 14 18 38",
      "M0 3V24",
    ],
    fills: ["M-15 37Q0 19 15 37Z", "M-13 -22Q0 -18 13 -22Q6 -11 0 -6Q-6 -11 -13 -22Z"],
    ink: 0.85,
  },
  // A radiant sun: a disc ringed by eight triangular rays
  religion: {
    lines: [
      "M-4.99 -23.48L0 -37L4.99 -23.48M13.07 -20.13L26.16 -26.16L20.13 -13.07M23.48 -4.99L37 0L23.48 4.99M20.13 13.07L26.16 26.16L13.07 20.13M4.99 23.48L0 37L-4.99 23.48M-13.07 20.13L-26.16 26.16L-20.13 13.07M-23.48 4.99L-37 0L-23.48 -4.99M-20.13 -13.07L-26.16 -26.16L-13.07 -20.13",
    ],
    rings: [
      [0, 0, 19],
      [0, 0, 12],
    ],
    dots: [[0, 0, 4]],
    ink: 0.75,
  },
  // A crown with jewels on its points and band
  politics: {
    tints: ["M-30 16L-34 -16L-16 -2L0 -26L16 -2L34 -16L30 16Z"],
    lines: ["M-30 16L-34 -16L-16 -2L0 -26L16 -2L34 -16L30 16Z", "M-30 16H30V27H-30Z"],
    fills: ["M0 17.5L4 21.5L0 25.5L-4 21.5Z"],
    dots: [
      [-34, -21, 3.2],
      [0, -31, 3.6],
      [34, -21, 3.2],
      [-17, 21.5, 2],
      [17, 21.5, 2],
    ],
    ink: 0.95,
  },
  // A lyre with curled arms and three strings
  culture: {
    lines: [
      "M-15 30H15",
      "M-15 30C-30 18 -31 -4 -21 -18C-17 -24 -20 -32 -28 -32",
      "M15 30C30 18 31 -4 21 -18C17 -24 20 -32 28 -32",
      "M-24 -14H24",
      "M-8 -14V30M0 -14V30M8 -14V30",
    ],
    dots: [
      [-28, -32, 3],
      [28, -32, 3],
    ],
    ink: 1,
  },
  // A gear with eight teeth
  technology: {
    tints: ["M-25 0A25 25 0 1 0 25 0A25 25 0 1 0 -25 0Z"],
    lines: [
      "M-6.97 -24.01L-5.32 -33.58L5.32 -33.58L6.97 -24.01L12.04 -21.91L19.98 -27.51L27.51 -19.98L21.91 -12.04L24.01 -6.97L33.58 -5.32L33.58 5.32L24.01 6.97L21.91 12.04L27.51 19.98L19.98 27.51L12.04 21.91L6.97 24.01L5.32 33.58L-5.32 33.58L-6.97 24.01L-12.04 21.91L-19.98 27.51L-27.51 19.98L-21.91 12.04L-24.01 6.97L-33.58 5.32L-33.58 -5.32L-24.01 -6.97L-21.91 -12.04L-27.51 -19.98L-19.98 -27.51L-12.04 -21.91Z",
    ],
    rings: [[0, 0, 11]],
    dots: [[0, 0, 4]],
    ink: 0.9,
  },
  // A cut gem: table, girdle, crown and pavilion facets
  artifact: {
    tints: ["M-30 -10L-18 -28H18L30 -10L0 34Z"],
    lines: [
      "M-30 -10L-18 -28H18L30 -10L0 34Z",
      "M-30 -10H30",
      "M-18 -28L-9 -10L0 -28L9 -10L18 -28",
      "M-9 -10L0 34L9 -10",
    ],
    ink: 0.9,
  },
  // A dragon's eye: almond eye, iris, slit pupil and a spiked brow
  creature: {
    tints: ["M-14 2A14 14 0 1 0 14 2A14 14 0 1 0 -14 2Z"],
    lines: ["M-38 2Q0 -30 38 2Q0 34 -38 2Z", "M-32 -14Q-4 -36 30 -22L38 -32"],
    rings: [[0, 2, 14]],
    fills: ["M0 -10Q5.5 2 0 14Q-5.5 2 0 -10Z"],
    ink: 0.95,
  },
  // A comet: a bright head in a glow ring and a softly filled, streaked tail
  event: {
    tints: ["M26.6 -5.4Q6 22 -38 38Q-22 -6 5.4 -26.6Z"],
    lines: ["M26.6 -5.4Q6 22 -38 38Q-22 -6 5.4 -26.6", "M2 2L-24 24M8 10L-8 26M-10 -8L-26 8"],
    rings: [[16, -16, 15]],
    dots: [[16, -16, 9]],
    ink: 0.95,
  },
  // A scroll: a sheet between two rolls, with a few lines of writing
  other: {
    lines: [
      "M-28 -32H22A6 6 0 0 1 22 -20H-28A6 6 0 0 1 -28 -32Z",
      "M-22 20H28A6 6 0 0 1 28 32H-22A6 6 0 0 1 -22 20Z",
      "M-22 -20V20M22 -20V20",
      "M-13 -10H13M-13 -2H13M-13 6H5",
    ],
    dots: [
      [-28, -26, 2.4],
      [28, 26, 2.4],
    ],
    ink: 0.9,
  },
};
