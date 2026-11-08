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

// orrery.css reads this as --lens-close-time, so the lens fade and its emptying timer agree
const LENS_CLOSE_MS = 200;
const WHEEL_STYLE = { ...ORRERY_CSS_SIZES, "--lens-close-time": `${LENS_CLOSE_MS}ms` };

// Choosing a star turns the wheel until it sits under the gold mark at the top and opens its lens.
// The stars are one Tab stop (roving tabindex); the arrow keys, Home and End move between them.
export default function CategoryOrrery({ categories }) {
  const { isMotionAllowed } = useHomeMotion();
  const [setRootElement, isInView] = useInView("120px");
  const isPageVisible = useIsPageVisible();
  const wheelRef = useRef(null);
  const starElementsRef = useRef([]);
  const lensId = useId();
  const lensDescriptionId = `${lensId}-description`;
  const keyHintId = useId();

  const layout = useMemo(() => getOrreryLayout(categories.length), [categories.length]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  // Stays set briefly after closing, so the lens can fade out with its text still in it
  const [lensIndex, setLensIndex] = useState(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [isPointerOver, setIsPointerOver] = useState(false);
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);

  const isMoving = isMotionAllowed && isInView && isPageVisible;
  const linePhase = useLinePhase(wheelRef, isMotionAllowed);

  useOrreryTurn(wheelRef, {
    isLooping: isMoving,
    isIdleTurning: selectedIndex === null && !isPointerOver && !hasKeyboardFocus,
    // Turning back by the star's own angle brings that star to the top
    targetAngle: selectedIndex === null ? null : -layout.stars[selectedIndex].angle,
  });

  // Empty the lens once its fade-out ends; choosing a star mid-fade cancels the timer
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
    // While moving, the lens fades out first and the effect above empties it afterwards
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

  // Focus returns to the chosen star, because the lens's link disappears with the lens
  function handleWheelKeyDown(event) {
    if (event.key === "Escape" && selectedIndex !== null) {
      event.preventDefault();
      starElementsRef.current[selectedIndex]?.focus();
      closeLens();
    }
  }

  // Only keyboard focus (:focus-visible) stops the idle turn: a clicked star keeps the focus,
  // but the wheel should turn again once the pointer leaves
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
