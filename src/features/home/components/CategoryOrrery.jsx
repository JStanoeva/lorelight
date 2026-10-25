import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useInView } from "../../../shared/hooks/useInView.js";
import { useIsPageVisible } from "../../../shared/hooks/useIsPageVisible.js";
import { ORRERY_CSS_SIZES } from "../constants/orreryGeometry.js";
import { useHomeMotion } from "../hooks/useHomeMotion.js";
import { useLinePhase } from "../hooks/useLinePhase.js";
import { useOrreryTurn } from "../hooks/useOrreryTurn.js";
import { getOrreryLayout, getStarKeyTarget } from "../utils/constellationLayout.js";
import OrreryEngraving from "./OrreryEngraving.jsx";
import OrreryLens from "./OrreryLens.jsx";
import OrreryStar from "./OrreryStar.jsx";
import StarGlyph from "./StarGlyph.jsx";
import "../styles/orrery.css";

// How long the lens takes to fade out when it closes. orrery.css reads the same value as
// --lens-close-time, so the fade and the timer that empties the lens afterwards always agree.
const LENS_CLOSE_MS = 200;
const WHEEL_STYLE = { ...ORRERY_CSS_SIZES, "--lens-close-time": `${LENS_CLOSE_MS}ms` };

// The categories as a celestial orrery: one star per category on a slowly turning wheel around
// a central light. Choosing a star turns the wheel until that star sits under the gold mark at
// the top (the reading position), where it flares, and its details open in the lens in the
// middle. Choosing it again closes the lens and the wheel starts turning again.
// `categories` is a list like LORE_CATEGORIES ({ value, label, starClassName }); the wheel
// makes room for any number of them.
//
// Keyboard: the stars are one Tab stop in a toolbar (a "roving tabindex": only one star has
// tabIndex 0), the arrow keys turn to the next or previous star, Home/End to the first/last,
// Escape closes the lens, and Tab moves on to the lens's link.
// Nothing moves while the visitor pauses the animations, off screen, on a hidden tab or with
// reduced motion (choosing a star then only highlights it where it is). The idle turn also
// stops while a star is chosen and while the pointer or the keyboard focus rests on the wheel.
// The whole orrery is one part of the Categories section's fade-in (useSectionReveal).
export default function CategoryOrrery({ categories }) {
  const { isMotionAllowed } = useHomeMotion();
  const [setRootElement, isInView] = useInView("120px");
  const isPageVisible = useIsPageVisible();
  const wheelRef = useRef(null);
  // The star buttons by index, so the arrow keys can move the keyboard focus to a neighbour
  const starElementsRef = useRef([]);
  const lensId = useId();
  const lensDescriptionId = `${lensId}-description`;
  const keyHintId = useId();

  const layout = useMemo(() => getOrreryLayout(categories.length), [categories.length]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  // The category the lens shows. It stays set for a moment after the lens is closed, so the
  // lens can fade out with its text still in it.
  const [lensIndex, setLensIndex] = useState(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [isPointerOver, setIsPointerOver] = useState(false);
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);

  // One condition for every moving part: the turning loop, the CSS animations (data-motion,
  // see home.css) and the lens's fade
  const isMoving = isMotionAllowed && isInView && isPageVisible;
  const linePhase = useLinePhase(wheelRef, isMotionAllowed);

  useOrreryTurn(wheelRef, {
    isLooping: isMoving,
    isIdleTurning: selectedIndex === null && !isPointerOver && !hasKeyboardFocus,
    // The wheel turns backwards by the star's own angle, which brings that star to the top
    targetAngle: selectedIndex === null ? null : -layout.stars[selectedIndex].angle,
  });

  // A closing lens keeps its last category while it fades out, then empties. The state is set
  // in the timer's callback; the cleanup cancels the timer when a star is chosen mid-fade.
  useEffect(() => {
    if (selectedIndex !== null || lensIndex === null) {
      return;
    }

    const timerId = setTimeout(() => setLensIndex(null), LENS_CLOSE_MS);
    return () => clearTimeout(timerId);
  }, [selectedIndex, lensIndex]);

  function openStar(index) {
    setSelectedIndex(index);
    setLensIndex(index);
    setFocusIndex(index);
  }

  function closeLens() {
    setSelectedIndex(null);
    // While things move, the lens fades out first (the effect above empties it afterwards);
    // otherwise it closes at once
    if (!isMoving) {
      setLensIndex(null);
    }
  }

  function handleChoose(index) {
    if (index === selectedIndex) {
      closeLens();
    } else {
      openStar(index);
    }
  }

  function handleStarKeyDown(event, index) {
    // Leave browser shortcuts such as Alt+← (Back) alone
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const nextIndex = getStarKeyTarget(event.key, index, categories.length);
    if (nextIndex === null) {
      return;
    }

    // preventDefault stops the arrow keys from scrolling the page
    event.preventDefault();
    openStar(nextIndex);
    starElementsRef.current[nextIndex]?.focus();
  }

  // Escape works from a star and from the lens's link; the focus goes back to the chosen star,
  // because the link disappears with the lens
  function handleWheelKeyDown(event) {
    if (event.key === "Escape" && selectedIndex !== null) {
      event.preventDefault();
      starElementsRef.current[selectedIndex]?.focus();
      closeLens();
    }
  }

  // Only keyboard focus stops the idle turn (:focus-visible): a star clicked with the mouse
  // keeps the focus, and the wheel should still turn again once the pointer has left
  function handleFocus(event) {
    setHasKeyboardFocus(event.target.matches(":focus-visible"));
  }

  function handleBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setHasKeyboardFocus(false);
    }
  }

  const lensCategory = lensIndex === null ? null : categories[lensIndex];

  return (
    <div
      ref={setRootElement}
      className="orrery"
      data-motion={isMoving ? "running" : "paused"}
      data-reveal-item
    >
      <div
        ref={wheelRef}
        className="orrery-wheel"
        style={WHEEL_STYLE}
        data-open={selectedIndex === null ? "false" : "true"}
        data-lines={linePhase}
        onPointerEnter={() => setIsPointerOver(true)}
        onPointerLeave={() => setIsPointerOver(false)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleWheelKeyDown}
      >
        <OrreryEngraving layout={layout} selectedIndex={selectedIndex} />

        <div className="orrery-orbit orrery-orbit-band" aria-hidden="true">
          <span />
        </div>
        <div className="orrery-orbit orrery-orbit-limb" aria-hidden="true">
          <span />
        </div>

        {/* The central light; the lens covers it while a category is open */}
        <div className="orrery-core" aria-hidden="true">
          <span className="orrery-core-glow" />
          <StarGlyph className="orrery-core-star" />
        </div>

        {/* role="toolbar" tells screen readers that the arrow keys move between the stars */}
        <div
          className="orrery-stars"
          role="toolbar"
          aria-label="Lore categories"
          aria-describedby={keyHintId}
        >
          {categories.map((category, index) => (
            <OrreryStar
              key={category.value}
              ref={(element) => {
                starElementsRef.current[index] = element;
              }}
              category={category}
              star={layout.stars[index]}
              index={index}
              isSelected={index === selectedIndex}
              isTabStop={index === (selectedIndex ?? focusIndex)}
              lensId={lensId}
              lensDescriptionId={lensDescriptionId}
              onChoose={handleChoose}
              onKeyDown={handleStarKeyDown}
              onFocus={setFocusIndex}
            />
          ))}
        </div>
        <p id={keyHintId} className="sr-only">
          Use the arrow keys to move between the categories and Escape to close one.
        </p>

        <OrreryLens
          id={lensId}
          descriptionId={lensDescriptionId}
          category={lensCategory}
          isClosing={selectedIndex === null && lensCategory !== null}
        />
      </div>
    </div>
  );
}
