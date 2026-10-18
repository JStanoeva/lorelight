import CatalogSearchForm from "./CatalogSearchForm.jsx";
import CatalogSky from "./CatalogSky.jsx";

// The top of the Lore Catalog: a short night-sky band with the title, one line of intro and
// the search bar. key={query} resets the search form when the URL's q changes.
export default function CatalogHero({ query, searchInputRef, onSearch }) {
  return (
    <section className="catalog-hero" aria-labelledby="catalog-title">
      <CatalogSky />

      <div className="catalog-hero-content site-column">
        <p className="catalog-eyebrow">Public lore from every world</p>
        <h1 id="catalog-title" className="catalog-title">
          Lore Catalog
        </h1>
        <p className="catalog-subtitle">
          Browse the characters, places and histories writers have shared from their worlds.
        </p>
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
