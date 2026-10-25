import { useEffect, useRef } from "react";
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
// `index` staggers the icon tracing from card to card; `iconState` ("waiting", "tracing" or
// "drawn") says how its icon appears, read by the CSS through data-icons.
export default function AboutCard({ item, index, iconState, isOpen, onToggle }) {
  // The pending animation frame of the glow (0 = none). A ref, because it never changes the picture.
  const glowFrameRef = useRef(0);

  // If the card goes away mid-move, drop the frame that was still waiting
  useEffect(() => () => cancelAnimationFrame(glowFrameRef.current), []);

  // Escape on an open card closes its panel too: the Create and Share panels hold little that
  // is focusable, so keyboard focus usually stays on the card.
  function handleKeyDown(event) {
    if (event.key === "Escape" && isOpen) {
      onToggle();
    }
  }

  // The soft light follows the pointer. The position is written straight onto the card as two
  // CSS variables (no state, so React doesn't re-render on every move), at most once per frame.
  function handlePointerMove(event) {
    const card = event.currentTarget;
    const { clientX, clientY } = event;
    cancelAnimationFrame(glowFrameRef.current);
    glowFrameRef.current = requestAnimationFrame(() => {
      const box = card.getBoundingClientRect();
      card.style.setProperty("--glow-x", `${clientX - box.left}px`);
      card.style.setProperty("--glow-y", `${clientY - box.top}px`);
    });
  }

  // The light drifts back to its resting place at the top of the card
  function handlePointerLeave(event) {
    cancelAnimationFrame(glowFrameRef.current);
    event.currentTarget.style.removeProperty("--glow-x");
    event.currentTarget.style.removeProperty("--glow-y");
  }

  return (
    <h3
      className="font-body text-base font-normal md:row-start-1"
      style={{ "--card": index }}
      data-icons={iconState}
      // A part of the section's fade-in (useSectionReveal)
      data-reveal-item
    >
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
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
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
