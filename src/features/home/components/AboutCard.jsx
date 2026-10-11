import AboutIcon from "./AboutIcon.jsx";

// A module-level element, not a component, so it is created once and reused on every render.
const CHEVRON = (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className="about-card-chevron"
  >
    <path d="M4 6L8 10L12 6" />
  </svg>
);

// One About card. The h3 wraps the button (a heading may not sit inside a button), so everything
// inside the button is a <span>. aria-expanded tells screen readers whether its panel is open.
// The button (and so the heading) is named by the title alone; the summary is read as its description.
export default function AboutCard({ item, isOpen, onToggle }) {
  // Escape on an open card closes its panel too: the Create and Share panels hold nothing
  // focusable, so keyboard focus usually stays on the card.
  function handleKeyDown(event) {
    if (event.key === "Escape" && isOpen) {
      onToggle();
    }
  }

  return (
    <h3 className="font-body text-base font-normal md:row-start-1">
      <button
        id={`about-card-${item.id}`}
        type="button"
        className="about-card"
        aria-expanded={isOpen}
        aria-controls={`about-panel-${item.id}`}
        aria-labelledby={`about-title-${item.id}`}
        aria-describedby={`about-summary-${item.id}`}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
      >
        <span className="about-card-icon">
          <AboutIcon name={item.id} />
        </span>
        <span id={`about-title-${item.id}`} className="about-card-title">
          {item.title}
        </span>
        <span id={`about-summary-${item.id}`} className="about-card-summary">
          {item.summary}
        </span>
        {/* Hidden from screen readers: aria-expanded already announces the state */}
        <span className="about-card-hint" aria-hidden="true">
          {isOpen ? "Hide preview" : "Show preview"}
          {CHEVRON}
        </span>
      </button>
    </h3>
  );
}
