import { LORE_CATEGORIES } from "../constants/categories.js";
import { DEFAULT_SORT, SORT_OPTIONS } from "../constants/sortOptions.js";

// An unknown category (e.g. from an old or edited link) means "all": "".
export function getCategoryFilter(searchParams) {
  const category = (searchParams.get("category") ?? "").toLowerCase();
  return LORE_CATEGORIES.some((item) => item.value === category) ? category : "";
}

export function getCatalogFilters(searchParams) {
  const sort = (searchParams.get("sort") ?? "").toLowerCase();

  return {
    q: (searchParams.get("q") ?? "").trim(),
    category: getCategoryFilter(searchParams),
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? sort : DEFAULT_SORT,
  };
}

// Empty values and the default sort are left out, so the unfiltered catalog is just /lore.
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
