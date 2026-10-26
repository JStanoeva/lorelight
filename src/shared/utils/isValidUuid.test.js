import { describe, expect, it } from "vitest";
import { isValidUuid } from "./isValidUuid.js";

describe("isValidUuid", () => {
  it("accepts a UUID in lower or upper case", () => {
    expect(isValidUuid("3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b")).toBe(true);
    expect(isValidUuid("3F2B8C1E-5A4D-4E6F-9B7A-1C2D3E4F5A6B")).toBe(true);
  });

  it("rejects a UUID with a missing or an extra character", () => {
    expect(isValidUuid("3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6")).toBe(false);
    expect(isValidUuid("3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6bc")).toBe(false);
  });

  it("rejects letters that are not hexadecimal", () => {
    expect(isValidUuid("3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5zzz")).toBe(false);
  });

  it("rejects a UUID without its hyphens", () => {
    expect(isValidUuid("3f2b8c1e5a4d4e6f9b7a1c2d3e4f5a6b")).toBe(false);
  });

  it("rejects words from the address bar", () => {
    expect(isValidUuid("new")).toBe(false);
    expect(isValidUuid("")).toBe(false);
  });

  it("rejects values that are not text", () => {
    expect(isValidUuid(undefined)).toBe(false);
    expect(isValidUuid(null)).toBe(false);
    expect(isValidUuid(42)).toBe(false);
  });
});
