import { describe, expect, it } from "vitest";
import { getStarColor } from "./getStarColor.js";

describe("getStarColor", () => {
  it("returns the label and colour for a known value", () => {
    expect(getStarColor("teal")).toEqual({ value: "teal", label: "Aurora Teal", hex: "#5eead4" });
  });

  it("falls back to Lantern Gold for an unknown value or a different letter case", () => {
    expect(getStarColor("orange").label).toBe("Lantern Gold");
    expect(getStarColor("Teal").label).toBe("Lantern Gold");
  });

  it("falls back to Lantern Gold for a missing value", () => {
    expect(getStarColor(null).label).toBe("Lantern Gold");
    expect(getStarColor(undefined).label).toBe("Lantern Gold");
    expect(getStarColor("").label).toBe("Lantern Gold");
  });
});
