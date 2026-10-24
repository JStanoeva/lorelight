import { useEffect, useRef } from "react";

// Degrees per second of the slow idle turn: one full turn every six minutes, slow enough to
// read the names while they move
const IDLE_SPEED = 1;
// How quickly the idle turn fades in and out (higher = quicker), e.g. when the pointer rests on
// the wheel
const IDLE_EASE = 2.6;
// Stiffness of the spring that turns a chosen star to the reading position (higher = quicker).
// At 10 a star from the far side lands under the mark in well under a second (a neighbour in
// about half a second).
const TURN_SPRING = 10;
// The flare starts when the chosen star is this close to the top (in degrees), while the wheel
// is still gliding in, so the light and the landing overlap instead of following each other
const ARRIVAL_ANGLE = 3;
// A long gap between frames (a slow phone, a breakpoint) counts as 50 ms, so the wheel never jumps
const MAX_FRAME_SECONDS = 0.05;
// During the slow idle turn, --turn is written only once the wheel has moved this far (in
// degrees, about a fifth of a pixel at the names), not on every frame (see step below)
const MIN_IDLE_WRITE_ANGLE = 0.05;

// The version of `target` (± 360°) closest to `current`, so the wheel always takes the short
// way round: from 350° to 10° it turns 20°, not 340°.
function closestAngle(current, target) {
  const difference = ((((target - current) % 360) + 540) % 360) - 180;
  return current + difference;
}

// Turns the orrery. The angle lives in a ref and goes straight to the CSS variable --turn on
// the wheel element (each frame during a pick turn, in small steps during the idle turn), so
// the turning never re-renders React; the CSS reads --turn to place every star and to rotate
// the engraved rings.
//   isLooping     – may the wheel move at all (motion allowed, on screen, tab visible). When it
//                   turns false the loop stops at once and the wheel stays where it is.
//   isIdleTurning – should the slow idle turn run (nothing chosen, no pointer or keyboard on it)
//   targetAngle   – null, or the --turn that brings the chosen star to the top
// When a chosen star reaches the top, the wheel gets data-arrived="true" (the CSS starts the
// star's flare from it). React never renders that attribute, so it never overwrites it.
export function useOrreryTurn(wheelRef, { isLooping, isIdleTurning, targetAngle }) {
  const angleRef = useRef(0);
  const speedRef = useRef(0);
  const arrivedTargetRef = useRef(null);

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) {
      return;
    }

    // A different choice (or none): the flare may play again when the next star arrives
    if (targetAngle !== arrivedTargetRef.current) {
      arrivedTargetRef.current = null;
      delete wheel.dataset.arrived;
    }

    if (!isLooping) {
      // Stopped where it is; when it may move again, it starts from rest
      speedRef.current = 0;
      return;
    }

    let frameId = 0;
    let previousTime = null;
    // The angle last written to --turn by this run (null = nothing written yet)
    let writtenAngle = null;

    function step(time) {
      const seconds =
        previousTime === null ? 0 : Math.min((time - previousTime) / 1000, MAX_FRAME_SECONDS);
      previousTime = time;

      let angle = angleRef.current;
      let speed = speedRef.current;
      let isSettled = false;

      if (targetAngle !== null) {
        // A spring pulls the wheel towards the goal, and the second term brakes it in
        // proportion to its speed. With exactly this much braking ("critically damped") the
        // wheel speeds up, slows down and lands on the mark without swinging past it. Pressing
        // an arrow key again mid-turn just bends the motion, because the speed is kept.
        const goal = closestAngle(angle, targetAngle);
        speed += (TURN_SPRING ** 2 * (goal - angle) - 2 * TURN_SPRING * speed) * seconds;
        angle += speed * seconds;

        const distance = Math.abs(goal - angle);
        if (distance < ARRIVAL_ANGLE && arrivedTargetRef.current !== targetAngle) {
          arrivedTargetRef.current = targetAngle;
          wheel.dataset.arrived = "true";
        }
        if (distance < 0.05 && Math.abs(speed) < 0.5) {
          angle = goal;
          speed = 0;
          isSettled = true;
        }
      } else {
        // The idle turn eases in and out instead of starting or stopping with a jerk
        const wantedSpeed = isIdleTurning ? IDLE_SPEED : 0;
        speed += (wantedSpeed - speed) * (1 - Math.exp(-IDLE_EASE * seconds));
        angle += speed * seconds;

        if (!isIdleTurning && Math.abs(speed) < 0.01) {
          speed = 0;
          isSettled = true;
        }
      }

      angleRef.current = angle;
      speedRef.current = speed;

      // Every element in the wheel inherits --turn, so each write restyles the whole wheel.
      // The idle turn moves only about 0.02° per frame, so it is written once it has moved a
      // visible amount; a pick turn and the final resting angle are always written.
      const hasMovedVisibly =
        writtenAngle === null || Math.abs(angle - writtenAngle) >= MIN_IDLE_WRITE_ANGLE;
      if (targetAngle !== null || isSettled || hasMovedVisibly) {
        wheel.style.setProperty("--turn", `${angle.toFixed(3)}deg`);
        writtenAngle = angle;
      }

      // Nothing left to move: stop asking for frames until something changes
      if (!isSettled) {
        frameId = requestAnimationFrame(step);
      }
    }

    frameId = requestAnimationFrame(step);

    // The cleanup cancels the loop whenever one of the inputs changes (a new one starts with
    // the new values), on unmount, and in StrictMode's extra mount, so only one ever runs
    return () => cancelAnimationFrame(frameId);
  }, [wheelRef, isLooping, isIdleTurning, targetAngle]);
}
