import StarGlyph from "../../home/components/StarGlyph.jsx";

// A message in place of the cards (empty catalog, no results): an empty star chart with a
// single star, a heading, one line of text and the actions passed as children.
// `headingLevel` keeps the page outline right: 2 on its own, 3 under the results heading.
export default function CatalogNotice({ headingLevel = 2, title, text, children }) {
  return (
    <div className="catalog-notice">
      <div className="catalog-notice-chart" aria-hidden="true">
        <svg viewBox="-60 -60 120 120" focusable="false">
          <circle r="56" className="catalog-notice-ring" />
          <circle r="38" className="catalog-notice-ring" />
          <circle r="20" className="catalog-notice-ring" />
          <path d="M-58 0H58M0 -58V58" className="catalog-notice-axis" />
          <circle cx="30" cy="-24" r="1.6" className="catalog-notice-dot" />
          <circle cx="-34" cy="18" r="1.2" className="catalog-notice-dot" />
          <circle cx="16" cy="40" r="1.4" className="catalog-notice-dot" />
          <circle cx="-22" cy="-36" r="1" className="catalog-notice-dot" />
        </svg>
        <StarGlyph className="catalog-notice-star" />
      </div>

      {headingLevel === 3 ? (
        <h3 className="catalog-notice-title">{title}</h3>
      ) : (
        <h2 className="catalog-notice-title">{title}</h2>
      )}
      <p className="catalog-notice-text">{text}</p>
      {children && <div className="catalog-notice-actions">{children}</div>}
    </div>
  );
}
