import { describe, expect, it } from "vitest";
import { formatSavedCount, getBoardCountText, getThreadHint } from "./constellationText.js";

describe("formatSavedCount", () => {
  it("uses the singular for exactly one entry", () => {
    expect(formatSavedCount(1)).toBe("1 saved entry");
  });

  it("uses the plural for zero and for more than one entry", () => {
    expect(formatSavedCount(0)).toBe("0 saved entries");
    expect(formatSavedCount(18)).toBe("18 saved entries");
  });
});

describe("getBoardCountText", () => {
  it("shows only the total when all categories are shown", () => {
    expect(getBoardCountText(18, 18, "")).toBe("18 saved entries");
  });

  it("names the chosen category and how many of the total it shows", () => {
    expect(getBoardCountText(3, 18, "Location")).toBe("Location · 3 of 18 saved entries");
  });

  it("uses the singular when the whole board holds one entry", () => {
    expect(getBoardCountText(1, 1, "Location")).toBe("Location · 1 of 1 saved entry");
  });
});

describe("getThreadHint", () => {
  it("tells the owner how a thread appears in a chosen category", () => {
    expect(getThreadHint(true, "Location")).toBe(
      "Save another Location entry and a star-thread will join the two.",
    );
  });

  it("tells a visitor how a thread appears in a chosen category", () => {
    expect(getThreadHint(false, "Location")).toBe(
      "A star-thread appears as soon as two of the saved entries are Location lore.",
    );
  });

  it("speaks to the owner about their own entries when all categories are shown", () => {
    expect(getThreadHint(true, "")).toBe(
      "A star-thread appears as soon as two of your saved entries share a category.",
    );
  });

  it("speaks about the saved entries to a visitor when all categories are shown", () => {
    expect(getThreadHint(false, "")).toBe(
      "A star-thread appears as soon as two of the saved entries share a category.",
    );
  });
});
