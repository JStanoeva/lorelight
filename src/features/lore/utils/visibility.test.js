import { describe, expect, it } from "vitest";
import { getVisibility, isEffectivelyPublic } from "./visibility.js";

describe("getVisibility", () => {
  it("calls an entry public when the entry and its project are public", () => {
    expect(getVisibility({ is_public: true }, { is_public: true })).toBe("public");
  });

  it("calls a private entry private, whatever its project", () => {
    expect(getVisibility({ is_public: false }, { is_public: true })).toBe("private");
    expect(getVisibility({ is_public: false }, { is_public: false })).toBe("private");
  });

  it("calls a public entry in a private project hidden", () => {
    expect(getVisibility({ is_public: true }, { is_public: false })).toBe("hidden");
  });
});

describe("isEffectivelyPublic", () => {
  it("is true only when the entry and its project are public", () => {
    expect(isEffectivelyPublic({ is_public: true, project: { is_public: true } })).toBe(true);
    expect(isEffectivelyPublic({ is_public: true, project: { is_public: false } })).toBe(false);
    expect(isEffectivelyPublic({ is_public: false, project: { is_public: true } })).toBe(false);
  });

  it("counts a missing project as not public", () => {
    expect(isEffectivelyPublic({ is_public: true, project: null })).toBe(false);
  });
});
