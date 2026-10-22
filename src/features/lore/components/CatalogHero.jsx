import CatalogSearchForm from "./CatalogSearchForm.jsx";
import CatalogSky from "./CatalogSky.jsx";

// The top of the Lore Catalog: a short night-sky band with the eyebrow and the title (shared with
// My Projects and My Constellation, see .page-hero) and the search bar. key={query} resets the
// search form when the URL's q changes.
export default function CatalogHero({ query, searchInputRef, onSearch }) {
  return (
    <section className="page-hero catalog-hero" aria-labelledby="catalog-title">
      <CatalogSky />

      <div className="catalog-hero-content site-column">
        <p className="page-hero-eyebrow">Public lore from every world</p>
        <h1 id="catalog-title" className="page-hero-title">
          Lore Catalog
        </h1>
        <CatalogSearchForm
          key={query}
          initialQuery={query}
          inputRef={searchInputRef}
          onSearch={onSearch}
        />
      </div>
    </section>
  );
}
