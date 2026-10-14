// The five stars of the password strength meter, from left to right (one per password rule).
// x and y are percentages of the meter's box and mark the point where the star's arms cross;
// size is the star's width in rem. The stars sit on a gentle zigzag and grow slightly to the right.
export const METER_STARS = [
  { x: 7, y: 66, size: 0.625 },
  { x: 29, y: 30, size: 0.6875 },
  { x: 51, y: 62, size: 0.75 },
  { x: 73, y: 32, size: 0.8125 },
  { x: 93, y: 52, size: 0.9375 },
];
