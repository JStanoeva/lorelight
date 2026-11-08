// Unlike Math.random(), the same seed (e.g. a record id) always gives the same numbers.

// FNV-1a (32-bit): turns a text seed into a whole number.
export function hashString(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// mulberry32: each call to random() returns the next number in [0, 1) (4294967296 is 2^32).
export function createRandom(seedNumber) {
  let state = seedNumber;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick(random, items) {
  return items[Math.floor(random() * items.length)];
}

export function chance(random, probability) {
  return random() < probability;
}
