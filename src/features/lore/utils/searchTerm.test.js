import { describe, expect, it } from "vitest";
import { toSearchTerm } from "./searchTerm.js";

describe("toSearchTerm", () => {
  it("trims the search and collapses spaces", () => {
    expect(toSearchTerm("  ancient    bell  ")).toBe("ancient bell");
  });

  it("turns the characters with a special meaning in the filter into underscores", () => {
    expect(toSearchTerm('a,b(c)d{e}f"g\\h%i_j*k')).toBe("a_b_c_d_e_f_g_h_i_j_k");
    expect(toSearchTerm("taxes, flood")).toBe("taxes_ flood");
  });

  it("turns control characters such as a tab or NUL into spaces", () => {
    expect(toSearchTerm("old\tbell\u0000tower")).toBe("old bell tower");
  });

  it("keeps at most 100 characters", () => {
    expect(toSearchTerm("a".repeat(100))).toBe("a".repeat(100));
    expect(toSearchTerm("a".repeat(101))).toBe("a".repeat(100));
  });

  it("never cuts an emoji in half at the limit", () => {
    expect(toSearchTerm(`${"a".repeat(99)}🐉 bell`)).toBe(`${"a".repeat(99)}🐉`);
  });

  it("returns an empty term for an empty search", () => {
    expect(toSearchTerm("")).toBe("");
    expect(toSearchTerm("   ")).toBe("");
    expect(toSearchTerm(null)).toBe("");
  });
});
