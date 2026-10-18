import { useId } from "react";
import StarGlyph from "../../home/components/StarGlyph.jsx";
import Icon from "../../../shared/components/Icon.jsx";
import { DEFAULT_SORT, SORT_OPTIONS } from "../constants/sortOptions.js";
import { hasActiveFilters } from "../utils/catalogFilters.js";
import { getCategory } from "../utils/getCategory.js";

// The line above the cards: how many entries match ("2 entries for “glass” in Location, oldest
// first"), the active filters as removable chips with "Clear all", and the sort select.
// `count` is null while the lore loads or failed to load. `countRef` points at the count line,
// where the page moves focus after a filter button disappears.
export default function CatalogToolbar({
  count,
  filters,
  countRef,
  onRemoveQuery,
  onRemoveCategory,
  onClearAll,
  onSortChange,
}) {
  const sortId = useId();
  const category = filters.category ? getCategory(filters.category) : null;
  const hasFilters = hasActiveFilters(filters);
  const sortOption = SORT_OPTIONS.find((option) => option.value === filters.sort);
  const isDefaultSort = filters.sort === DEFAULT_SORT;

  return (
    <div className="catalog-toolbar">
      <div className="catalog-summary">
        {/* Stays mounted (empty while loading), so screen readers hear every new count.
            tabIndex -1: it can take focus from code, but isn't a Tab stop. */}
        <p ref={countRef} tabIndex={-1} role="status" className="catalog-count">
          {count !== null && (
            <>
              <strong>{count.toLocaleString("en-US")}</strong> {count === 1 ? "entry" : "entries"}
              {filters.q && <> for “{filters.q}”</>}
              {category && <> in {category.label}</>}
              {!isDefaultSort && sortOption && <>, {sortOption.label.toLowerCase()}</>}
            </>
          )}
        </p>

        {hasFilters && (
          <ul aria-label="Active filters" className="catalog-active">
            {filters.q && (
              <li>
                <button type="button" onClick={onRemoveQuery} className="catalog-active-chip">
                  <span className="sr-only">Remove search </span>
                  <span className="catalog-active-chip-text">“{filters.q}”</span>
                  <Icon name="close" size={14} />
                </button>
              </li>
            )}
            {category && (
              <li>
                <button type="button" onClick={onRemoveCategory} className="catalog-active-chip">
                  <span className="sr-only">Remove category </span>
                  <StarGlyph className={`catalog-active-chip-star ${category.starClassName}`} />
                  <span className="catalog-active-chip-text">{category.label}</span>
                  <Icon name="close" size={14} />
                </button>
              </li>
            )}
            <li>
              <button type="button" onClick={onClearAll} className="catalog-clear">
                Clear all
              </button>
            </li>
          </ul>
        )}
      </div>

      <div className="catalog-sort">
        <label htmlFor={sortId} className="catalog-sort-label">
          Sort
        </label>
        <select
          id={sortId}
          value={filters.sort}
          onChange={(event) => onSortChange(event.target.value)}
          className="input catalog-sort-select"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
