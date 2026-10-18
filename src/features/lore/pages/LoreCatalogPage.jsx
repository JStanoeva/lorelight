import { useRef } from "react";
import { flushSync } from "react-dom";
import { useSearchParams } from "react-router";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import CatalogHero from "../components/CatalogHero.jsx";
import CatalogNotice from "../components/CatalogNotice.jsx";
import CatalogToolbar from "../components/CatalogToolbar.jsx";
import CategoryChips from "../components/CategoryChips.jsx";
import EmptyCatalogNotice from "../components/EmptyCatalogNotice.jsx";
import LoreGrid from "../components/LoreGrid.jsx";
import { CATALOG_LIMIT } from "../constants/catalog.js";
import { useLoreList } from "../hooks/useLoreList.js";
import { getCatalogFilters, hasActiveFilters, toCatalogSearchParams } from "../utils/catalogFilters.js";
import "../styles/catalog.css";

// The public Lore Catalog. The filters live in the URL (/lore?q=bell&category=location&sort=oldest),
// so a filtered view survives a refresh, can be shared, and Back/Forward step through the filters.
export default function LoreCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = getCatalogFilters(searchParams);
  const { entries, previousEntries, isLoading, error, refetch } = useLoreList({ ...filters, limit: CATALOG_LIMIT });
  const searchInputRef = useRef(null);
  const countRef = useRef(null);

  const isLoaded = !isLoading && !error;
  // No public lore at all (not just none that matches): the call to action for writers
  const isCatalogEmpty = isLoaded && !hasActiveFilters(filters) && entries.length === 0;

  // Every change is a new history entry, so Back and Forward step through the filters
  function changeFilters(changes) {
    const nextParams = toCatalogSearchParams({ ...filters, ...changes });

    // The same filters again (e.g. pressing the pressed "All") would only add a duplicate history entry
    if (nextParams.toString() === toCatalogSearchParams(filters).toString()) {
      return;
    }

    setSearchParams(nextParams);
  }

  function handleSearch(text) {
    const q = text.trim();

    // The same search again changes nothing, so it doesn't add a history entry either
    if (q === filters.q) {
      return;
    }

    // A new q remounts the search form (key={q}), which would drop focus to the page.
    // flushSync renders the new form right away, so focus can go back into its input.
    flushSync(() => changeFilters({ q }));
    searchInputRef.current?.focus();
  }

  // The clicked button disappears with its filter, so focus moves to the result count, which
  // stays in place and soon reads the new number
  function removeFilters(changes) {
    changeFilters(changes);
    countRef.current?.focus();
  }

  // The sort is kept: it's a preference, not a filter
  function clearFilters() {
    removeFilters({ q: "", category: "" });
  }

  // "Try again" disappears with the error message, so focus moves to the result count, as above
  function handleRetry() {
    refetch();
    countRef.current?.focus();
  }

  let results;

  if (isLoading && previousEntries.length > 0) {
    // The last cards stay (dimmed) until the new ones arrive, so the page doesn't shrink and jump
    results = (
      <div aria-busy="true" className="catalog-results-pending">
        <LoreGrid entries={previousEntries} />
      </div>
    );
  } else if (isLoading) {
    results = <Loader label="Loading lore…" />;
  } else if (error) {
    results = <ErrorMessage message={getErrorMessage(error)} onRetry={handleRetry} />;
  } else if (entries.length === 0) {
    results = (
      <CatalogNotice
        headingLevel={3}
        title="No lore matches your filters"
        text="Try another word or a different category, or clear the filters to see every public entry."
      >
        <button type="button" onClick={clearFilters} className="btn btn-ghost">
          Clear filters
        </button>
      </CatalogNotice>
    );
  } else {
    results = <LoreGrid entries={entries} />;
  }

  return (
    <>
      <CatalogHero query={filters.q} searchInputRef={searchInputRef} onSearch={handleSearch} />
      <CategoryChips value={filters.category} onChange={(category) => changeFilters({ category })} />

      <div className="catalog-results site-column">
        {isCatalogEmpty ? (
          <EmptyCatalogNotice />
        ) : (
          <>
            <h2 className="sr-only">Lore entries</h2>
            <CatalogToolbar
              count={isLoaded ? entries.length : null}
              filters={filters}
              countRef={countRef}
              onRemoveQuery={() => removeFilters({ q: "" })}
              onRemoveCategory={() => removeFilters({ category: "" })}
              onClearAll={clearFilters}
              onSortChange={(sort) => changeFilters({ sort })}
            />
            {isLoaded && entries.length === CATALOG_LIMIT && (
              <p className="catalog-limit">
                Showing the first {CATALOG_LIMIT} entries. Search or choose a category to narrow them down.
              </p>
            )}
            {results}
          </>
        )}
      </div>
    </>
  );
}
