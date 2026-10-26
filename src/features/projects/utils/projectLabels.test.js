import { describe, expect, it } from "vitest";
import { getFormatLabel, getGenreLabel } from "./projectLabels.js";

describe("getFormatLabel", () => {
  it("returns the readable label of a format", () => {
    expect(getFormatLabel("tabletop_rpg")).toBe("Tabletop RPG");
  });

  it("returns null for an unknown format instead of the raw value", () => {
    expect(getFormatLabel("board_game")).toBeNull();
  });
});

describe("getGenreLabel", () => {
  it("returns the readable label of a genre", () => {
    expect(getGenreLabel("science_fiction")).toBe("Science Fiction");
  });

  it("returns null when there is no genre or an unknown one", () => {
    expect(getGenreLabel(null)).toBeNull();
    expect(getGenreLabel("elves")).toBeNull();
  });
});
