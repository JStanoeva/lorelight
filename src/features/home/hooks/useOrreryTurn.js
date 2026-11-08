import { useEffect, useRef } from "react";

// Degrees per second: one full turn every six minutes
const IDLE_SPEED = 1;
// How quickly the idle turn fades in and out (higher = quicker)
const IDLE_EASE = 2.6;
// Stiffness of the spring that turns a chosen star to the top (higher = quicker)
const TURN_SPRING = 10;
// Degrees from the top at which the flare starts, so the light overlaps the landing
const ARRIVAL_ANGLE = 3;
// Longer frame gaps (a slow phone, a breakpoint) count as 50 ms, so the wheel never jumps
const MAX_FRAME_SECONDS = 0.05;
// The idle turn rewrites --turn only after moving this many degrees (about 0.2 px at the names)
const MIN_IDLE_WRITE_ANGLE = 0.05;

// `target` ± 360° closest to `current`, so the wheel takes the short way (350° → 10° is 20°)
function closestAngle(current, target) {
  const difference = ((((target - current) % 360) + 540) % 360) - 180;
  return current + difference;
}

// The angle goes straight to the CSS variable --turn, so turning never re-renders React.
// React never renders data-arrived (the flare's cue), so it never overwrites it.
export function useOrreryTurn(wheelRef, { isLooping, isIdleTurning, targetAngle }) {
  const angleRef = useRef(0);
  const speedRef = useRef(0);
  const arrivedTargetRef = useRef(null);

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) {
      return;
    }

    if (targetAngle !== arrivedTargetRef.current) {
      arrivedTargetRef.current = null;
      delete wheel.dataset.arrived;
    }

    if (!isLooping) {
      speedRef.current = 0;
      return;
    }

    let frameId = 0;
    let previousTime = null;
    let writtenAngle = null;

    function step(time) {
      const seconds =
        previousTime === null ? 0 : Math.min((time - previousTime) / 1000, MAX_FRAME_SECONDS);
      previousTime = time;

      let angle = angleRef.current;
      let speed = speedRef.current;
      let isSettled = false;

      if (targetAngle !== null) {
        // Critically damped spring: lands on the mark without overshooting. The speed is kept,
        // so another arrow press mid-turn just bends the motion.
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
        // Exponential ease towards the wanted speed, so the idle turn never jerks
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

      // Each --turn write restyles the whole wheel, so the idle turn writes only once it has moved
      // visibly; a pick turn and the resting angle are always written.
      const hasMovedVisibly =
        writtenAngle === null || Math.abs(angle - writtenAngle) >= MIN_IDLE_WRITE_ANGLE;
      if (targetAngle !== null || isSettled || hasMovedVisibly) {
        wheel.style.setProperty("--turn", `${angle.toFixed(3)}deg`);
        writtenAngle = angle;
      }

      if (!isSettled) {
        frameId = requestAnimationFrame(step);
      }
    }

    frameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameId);
  }, [wheelRef, isLooping, isIdleTurning, targetAngle]);
}
