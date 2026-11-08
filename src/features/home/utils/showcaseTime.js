// Script cues ({ name: ms }) as the sorted list of times useShowcasePlayback waits on
export function toCueList(cues) {
  return Object.values(cues).sort((a, b) => a - b);
}

export function getStepState(time, from, to) {
  if (time >= to) {
    return "done";
  }
  return time >= from ? "current" : "idle";
}

// Seeded (Park–Miller), so the stardust is the same on every visit and render stays pure
function createRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function createStardust(count, seed) {
  const random = createRandom(seed);
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    x: (random() * 100).toFixed(1),
    y: (random() * 100).toFixed(1),
    size: (1 + random() * 1.8).toFixed(2),
    delay: (-random() * 9).toFixed(2),
    duration: (6 + random() * 6).toFixed(2),
  }));
}
