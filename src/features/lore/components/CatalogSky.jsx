import { CATALOG_CONSTELLATIONS } from "../constants/catalogSky.js";

// The hero's still night sky: planisphere rings and meridians, a star field and two faint
// constellations. Purely decorative, so it's hidden from screen readers. Nothing moves.
export default function CatalogSky() {
  return (
    <div className="catalog-sky" aria-hidden="true">
      <div className="catalog-sky-chart" />
      <div className="catalog-sky-stars" />

      {CATALOG_CONSTELLATIONS.map((constellation) => (
        <svg
          key={constellation.id}
          viewBox="0 0 200 124"
          focusable="false"
          className={`catalog-constellation ${constellation.className}`}
        >
          {constellation.lines.map(([from, to]) => (
            <line
              key={`${from}-${to}`}
              x1={constellation.stars[from][0]}
              y1={constellation.stars[from][1]}
              x2={constellation.stars[to][0]}
              y2={constellation.stars[to][1]}
            />
          ))}
          {constellation.stars.map(([x, y, radius]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r={radius * 3.2} className="catalog-constellation-halo" />
              <circle cx={x} cy={y} r={radius} className="catalog-constellation-star" />
            </g>
          ))}
        </svg>
      ))}
    </div>
  );
}
