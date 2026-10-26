import { describe, expect, it } from "vitest";
import { LORE_CATEGORIES } from "../../lore/constants/categories.js";
import { DEFAULT_CATEGORY_DETAILS } from "../constants/categoryDetails.js";
import { getCategoryDetails } from "./getCategoryDetails.js";

describe("getCategoryDetails", () => {
  it("returns a category's own description and examples", () => {
    const details = getCategoryDetails("creature");

    expect(details.description).toBe(
      "Beasts, spirits and beings that walk, swim or fly through your world.",
    );
    expect(details.examples).toContain("moth-winged foxes");
  });

  it("has its own copy for each of the 12 categories", () => {
    const withoutOwnCopy = LORE_CATEGORIES.filter(
      (category) => getCategoryDetails(category.value) === DEFAULT_CATEGORY_DETAILS,
    );

    expect(LORE_CATEGORIES.length).toBe(12);
    expect(withoutOwnCopy).toEqual([]);
  });

  it("uses the generic copy for a category without its own, such as one added later", () => {
    expect(getCategoryDetails("magic")).toBe(DEFAULT_CATEGORY_DETAILS);
    expect(getCategoryDetails(undefined)).toBe(DEFAULT_CATEGORY_DETAILS);
  });
});
