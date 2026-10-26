import { describe, expect, it } from "vitest";
import { createStarTile, getPinLayout, STAR_TILE } from "./pinLayout.js";

const entryIds = ["entry-1", "entry-2", "entry-3", "entry-4", "entry-5"];

describe("getPinLayout", () => {
  it("gives the same entry the same tilt and drop on every visit", () => {
    expect(getPinLayout(entryIds[0])).toEqual(getPinLayout(entryIds[0]));
  });

  it("tilts every card at least 0.5 and at most 1.6 degrees, never perfectly straight", () => {
    entryIds.forEach((id) => {
      const { tilt } = getPinLayout(id);
      expect(Math.abs(tilt)).toBeGreaterThanOrEqual(0.5);
      expect(Math.abs(tilt)).toBeLessThanOrEqual(1.6);
    });
  });

  it("lets every card hang at most 1.25rem below its row line", () => {
    entryIds.forEach((id) => {
      const { drop } = getPinLayout(id);
      expect(drop).toBeGreaterThanOrEqual(0);
      expect(drop).toBeLessThanOrEqual(1.25);
    });
  });
});

describe("createStarTile", () => {
  it("makes the same star field for the same seed", () => {
    expect(createStarTile("owner-1")).toEqual(createStarTile("owner-1"));
  });

  it("makes 52 faint dots and 5 small stars, all inside one tile", () => {
    const { dust, sparks } = createStarTile("owner-1");

    expect(dust.length).toBe(52);
    expect(sparks.length).toBe(5);
    [...dust, ...sparks].forEach((star) => {
      expect(star.x).toBeGreaterThanOrEqual(0);
      expect(star.x).toBeLessThanOrEqual(STAR_TILE.width);
      expect(star.y).toBeGreaterThanOrEqual(0);
      expect(star.y).toBeLessThanOrEqual(STAR_TILE.height);
    });
  });
});
