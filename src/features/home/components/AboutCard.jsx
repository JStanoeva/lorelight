import { useEffect, useRef } from "react";
import AboutIcon from "./AboutIcon.jsx";

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

// The h3 wraps the button (a heading may not sit inside a button), so the button holds only spans.
export default function AboutCard({ item, index, iconState, isOpen, onToggle }) {
  const glowFrameRef = useRef(0);

  // Cancel a glow frame still waiting when the card unmounts
  useEffect(() => () => cancelAnimationFrame(glowFrameRef.current), []);

  // Escape on the card closes its panel too, because keyboard focus usually stays on the card
  function handleKeyDown(event) {
    if (event.key === "Escape" && isOpen) {
      onToggle();
    }
  }

  // CSS variables instead of state, so moves don't re-render; written at most once per frame
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
        {/* aria-expanded already announces the state to screen readers */}
        <span className="about-card-hint" aria-hidden="true">
          {isOpen ? "Hide preview" : "Show preview"}
          {CHEVRON}
        </span>
      </button>
    </h3>
  );
}
