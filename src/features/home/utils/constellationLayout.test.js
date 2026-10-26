import { describe, expect, it } from "vitest";
import { getOrreryLayout, getStarKeyTarget } from "./constellationLayout.js";

describe("getOrreryLayout", () => {
  it("places one star for each of 12, 13 and 14 categories, joined in a closed ring", () => {
    expect(getOrreryLayout(12).stars.length).toBe(12);
    expect(getOrreryLayout(12).lines.length).toBe(12);

    const thirteen = getOrreryLayout(13);
    expect(thirteen.stars.length).toBe(13);
    expect(thirteen.lines[0]).toEqual([0, 1]);
    expect(thirteen.lines[12]).toEqual([12, 0]);

    const fourteen = getOrreryLayout(14);
    expect(fourteen.stars.length).toBe(14);
    expect(fourteen.lines[13]).toEqual([13, 0]);
  });

  it("spaces the stars evenly, clockwise from the top", () => {
    const angles = getOrreryLayout(12).stars.map((star) => star.angle);

    expect(angles).toEqual([0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]);
  });

  it("puts the first stars at the top, on the right and at the bottom (y grows downwards)", () => {
    const { stars } = getOrreryLayout(4);

    expect(stars[0].x).toBe(0);
    expect(stars[0].y).toBe(-1);
    expect(stars[1].x).toBe(1);
    expect(stars[1].y).toBeCloseTo(0);
    expect(stars[2].x).toBeCloseTo(0);
    expect(stars[2].y).toBe(1);
  });

  it("keeps up to 16 stars on one ring and moves every second star inwards from 17", () => {
    const sixteen = getOrreryLayout(16).stars.map((star) => star.radius);
    const seventeen = getOrreryLayout(17).stars.map((star) => star.radius);

    expect(sixteen.every((radius) => radius === 1)).toBe(true);
    expect(seventeen.slice(0, 4)).toEqual([1, 0.86, 1, 0.86]);
  });

  it("joins two stars with one line and draws no line for a single star", () => {
    expect(getOrreryLayout(2).lines).toEqual([[0, 1]]);
    expect(getOrreryLayout(1).lines).toEqual([]);
  });

  it("returns an empty wheel for no categories", () => {
    expect(getOrreryLayout(0)).toEqual({ stars: [], lines: [] });
  });
});

describe("getStarKeyTarget", () => {
  it("moves to the next star with Right or Down, from the last back to the first", () => {
    expect(getStarKeyTarget("ArrowRight", 3, 12)).toBe(4);
    expect(getStarKeyTarget("ArrowDown", 11, 12)).toBe(0);
  });

  it("moves to the previous star with Left or Up, from the first to the last", () => {
    expect(getStarKeyTarget("ArrowLeft", 3, 12)).toBe(2);
    expect(getStarKeyTarget("ArrowUp", 0, 12)).toBe(11);
  });

  it("jumps to the first star with Home and the last with End", () => {
    expect(getStarKeyTarget("Home", 5, 12)).toBe(0);
    expect(getStarKeyTarget("End", 5, 12)).toBe(11);
  });

  it("returns null for a key that doesn't move between stars", () => {
    expect(getStarKeyTarget("Enter", 5, 12)).toBeNull();
  });
});
