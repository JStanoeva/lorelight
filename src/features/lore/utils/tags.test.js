import { describe, expect, it } from "vitest";
import { describeTags, formatTags, getTagsError, parseTags } from "./tags.js";

describe("parseTags", () => {
  it("trims, lowercases and collapses spaces", () => {
    expect(parseTags("  Ancient   MAGIC ")).toEqual(["ancient magic"]);
  });

  it("removes empty pieces and duplicates in different letter case", () => {
    expect(parseTags("Dragon, , ancient  MAGIC,dragon")).toEqual(["dragon", "ancient magic"]);
  });

  it("returns an empty list for an empty field", () => {
    expect(parseTags("")).toEqual([]);
    expect(parseTags(" , ,  ")).toEqual([]);
  });
});

describe("formatTags", () => {
  it("joins saved tags for the edit form", () => {
    expect(formatTags(["dragon", "ancient magic"])).toBe("dragon, ancient magic");
  });

  it("returns an empty text when there are no tags", () => {
    expect(formatTags(null)).toBe("");
  });
});

describe("getTagsError", () => {
  it("accepts no tags at all, because tags are optional", () => {
    expect(getTagsError("")).toBe("");
  });

  it("accepts letters, numbers, spaces and hyphens", () => {
    expect(getTagsError("sky-city, year 300")).toBe("");
  });

  it("rejects other characters", () => {
    expect(getTagsError("magic!")).toBe(
      'Tags can only contain letters, numbers, spaces and hyphens: "magic!".',
    );
  });

  it("rejects a tag without a letter or number", () => {
    expect(getTagsError("---")).toBe('Each tag needs at least one letter or number: "---".');
  });

  it("accepts a tag of exactly 30 characters and rejects 31", () => {
    expect(getTagsError("a".repeat(30))).toBe("");
    expect(getTagsError("a".repeat(31))).toContain("at most 30 characters");
  });

  it("accepts 10 tags and rejects 11", () => {
    const tenTags = Array.from({ length: 10 }, (_, index) => `tag ${index}`);
    expect(getTagsError(tenTags.join(", "))).toBe("");
    expect(getTagsError([...tenTags, "tag 10"].join(", "))).toBe("Use at most 10 tags (you have 11).");
  });

  it("counts duplicates only once", () => {
    const tenTags = Array.from({ length: 10 }, (_, index) => `tag ${index}`);
    expect(getTagsError([...tenTags, "TAG 0"].join(", "))).toBe("");
  });
});

describe("describeTags", () => {
  it("marks every tag after the tenth as over the limit", () => {
    const elevenTags = Array.from({ length: 11 }, (_, index) => `tag ${index}`).join(", ");
    const { items, count } = describeTags(elevenTags);

    expect(count).toBe(11);
    expect(items[9].problem).toBeNull();
    expect(items[10].problem).toBe("over the 10-tag limit");
  });
});
