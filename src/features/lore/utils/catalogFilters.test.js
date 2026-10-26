import { describe, expect, it } from "vitest";
import {
  getCatalogFilters,
  getCategoryFilter,
  hasActiveFilters,
  toCatalogSearchParams,
} from "./catalogFilters.js";

describe("getCategoryFilter", () => {
  it("accepts a category in any letter case", () => {
    expect(getCategoryFilter(new URLSearchParams("category=LOCATION"))).toBe("location");
  });

  it("ignores an unknown or missing category", () => {
    expect(getCategoryFilter(new URLSearchParams("category=Dragons"))).toBe("");
    expect(getCategoryFilter(new URLSearchParams(""))).toBe("");
  });
});

describe("getCatalogFilters", () => {
  it("reads the search, category and sort from the URL", () => {
    expect(getCatalogFilters(new URLSearchParams("q=bell&category=location&sort=oldest"))).toEqual({
      q: "bell",
      category: "location",
      sort: "oldest",
    });
  });

  it("trims the search", () => {
    expect(getCatalogFilters(new URLSearchParams({ q: "  bell  " })).q).toBe("bell");
  });

  it("accepts a sort in any letter case and ignores an unknown one", () => {
    expect(getCatalogFilters(new URLSearchParams("sort=OLDEST")).sort).toBe("oldest");
    expect(getCatalogFilters(new URLSearchParams("sort=sideways")).sort).toBe("newest");
  });

  it("shows all categories, newest first, when the URL has no filters", () => {
    expect(getCatalogFilters(new URLSearchParams(""))).toEqual({ q: "", category: "", sort: "newest" });
  });
});

describe("toCatalogSearchParams", () => {
  it("leaves empty values and the default sort out of the URL", () => {
    expect(toCatalogSearchParams({ q: "", category: "", sort: "newest" }).toString()).toBe("");
    expect(toCatalogSearchParams({ q: "bell", category: "", sort: "newest" }).toString()).toBe("q=bell");
  });

  it("writes every filter that is set", () => {
    const params = toCatalogSearchParams({ q: "bell", category: "location", sort: "oldest" });
    expect(params.toString()).toBe("q=bell&category=location&sort=oldest");
  });
});

describe("hasActiveFilters", () => {
  it("counts the search and the category, but not the sort", () => {
    expect(hasActiveFilters({ q: "bell", category: "" })).toBe(true);
    expect(hasActiveFilters({ q: "", category: "event" })).toBe(true);
    expect(hasActiveFilters({ q: "", category: "", sort: "oldest" })).toBe(false);
  });
});
