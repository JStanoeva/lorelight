// Seeded randomness for generated art: the same seed (e.g. a record id) always gives the same
// sequence of numbers, so a picture looks the same on every visit. Math.random() can't do that.

// FNV-1a (32-bit): turns a text seed into a whole number.
export function hashString(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// mulberry32: a tiny random number generator. Each call to random() returns the next number in [0, 1).
// It moves a counter forward and scrambles its bits, so similar seeds still give unrelated numbers;
// `>>> 0` makes the result a positive 32-bit number, and dividing by 2^32 turns it into a fraction.
export function createRandom(seedNumber) {
  let state = seedNumber;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

// One random item of the list.
export function pick(random, items) {
  return items[Math.floor(random() * items.length)];
}

// true with the given probability, e.g. chance(random, 0.25) is true about once in four calls.
export function chance(random, probability) {
  return random() < probability;
}
