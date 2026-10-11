import { Link } from "react-router";
import StarGlyph from "./StarGlyph.jsx";

// The panel an About card opens. The outer element always exists, so the card's aria-controls
// always points at something; `hidden` hides it while closed. Its content mounts only while open.
export default function AboutPanel({ item, isOpen, onClose, children }) {
  function handleKeyDown(event) {
    if (event.key === "Escape") {
      onClose();
    }
  }

  return (
    <div
      id={`about-panel-${item.id}`}
      role="region"
      aria-labelledby={`about-title-${item.id}`}
      hidden={!isOpen}
      onKeyDown={handleKeyDown}
      className="about-panel md:col-span-3 md:row-start-2"
    >
      {isOpen && (
        // The grid sits on this inner element, never on the one with `hidden`
        <div className="about-panel-inner">
          <div className="min-w-0">
            <h4 className="about-panel-lead">{item.lead}</h4>
            <p className="about-panel-body mt-3">{item.body}</p>
            <ul className="about-panel-points mt-5">
              {item.points.map((point) => (
                <li key={point} className="about-panel-point">
                  <StarGlyph className="bullet-star" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            {item.link && (
              <Link to={item.link.to} className="about-panel-link mt-4">
                {item.link.label}
                <span aria-hidden="true"> →</span>
              </Link>
            )}
          </div>
          {children}
        </div>
      )}
    </div>
  );
}
