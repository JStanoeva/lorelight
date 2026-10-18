import { LORE_CATEGORIES } from "../constants/categories.js";
import { DEFAULT_SORT, SORT_OPTIONS } from "../constants/sortOptions.js";

// The catalog keeps its filters in the URL: /lore?q=bell&category=location&sort=oldest.
// Values that aren't valid (an unknown category or sort, e.g. from an old or edited link) are
// ignored: the catalog then shows all categories, newest first.
export function getCatalogFilters(searchParams) {
  const category = (searchParams.get("category") ?? "").toLowerCase();
  const sort = (searchParams.get("sort") ?? "").toLowerCase();

  return {
    q: (searchParams.get("q") ?? "").trim(),
    category: LORE_CATEGORIES.some((item) => item.value === category) ? category : "",
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? sort : DEFAULT_SORT,
  };
}

// The URL search params for a set of filters. Empty values and the default sort are left out,
// so the unfiltered catalog is just /lore.
export function toCatalogSearchParams({ q, category, sort }) {
  const params = new URLSearchParams();

  if (q) {
    params.set("q", q);
  }

  if (category) {
    params.set("category", category);
  }

  if (sort !== DEFAULT_SORT) {
    params.set("sort", sort);
  }

  return params;
}

// Search and category narrow the results; the sort order only changes their order.
export function hasActiveFilters({ q, category }) {
  return Boolean(q || category);
}
