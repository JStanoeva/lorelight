// Small helpers shared by the three About showcases.

// The cue moments of a script ({ name: ms }) as the sorted list useShowcasePlayback waits on
export function toCueList(cues) {
  return Object.values(cues).sort((a, b) => a - b);
}

// "idle" before a step starts, "current" while it plays, "done" after it ended
export function getStepState(time, from, to) {
  if (time >= to) {
    return "done";
  }
  return time >= from ? "current" : "idle";
}

// A tiny seeded random generator (Park–Miller), so the stardust is scattered the same way on
// every visit and nothing random runs during render
function createRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

// Positions, sizes and timings of the drifting stardust behind a stage
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
