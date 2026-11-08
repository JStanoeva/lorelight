import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "../../../shared/hooks/useInView.js";
import { useIsPageVisible } from "../../../shared/hooks/useIsPageVisible.js";
import { useHomeMotion } from "./useHomeMotion.js";

// The bottom 15% of the screen doesn't count as on screen yet
const STAGE_MARGIN = "0px 0px -15% 0px";

// Plays a showcase script: waits for the next of `cues` (ms) with one timeout at a time, then
// stores it as `time`; CSS animates each change. A pause keeps the time left until the next cue.
export function useShowcasePlayback({ cues, finalCue, loopMs }) {
  const { isMotionAllowed, prefersReducedMotion } = useHomeMotion();
  const [setStageElement, isInView] = useInView(STAGE_MARGIN);
  const isPageVisible = useIsPageVisible();
  // The last cue reached, in ms (0 = the empty stage at the start of a loop)
  const [time, setTime] = useState(0);
  const [isStill, setIsStill] = useState(false);
  // Tells the empty stage before the first cue apart from the one between two loops
  const [hasStarted, setHasStarted] = useState(false);
  // Bumped by Replay and used as a key, so every CSS animation restarts
  const [runId, setRunId] = useState(0);
  const pausedWaitRef = useRef(null);

  // A still of the finished picture under reduced motion, or if motion is off before anything has
  // played (no empty stage). A guarded setState during render is allowed: React re-renders first.
  if ((prefersReducedMotion && !isStill) || (!isMotionAllowed && !hasStarted && time === 0)) {
    setTime(finalCue);
    setIsStill(true);
  }

  const isRunning = isMotionAllowed && isInView && isPageVisible;

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const nextCue = cues.find((cue) => cue > time) ?? loopMs;
    const saved = pausedWaitRef.current;
    // Resume a paused wait only if it belongs to this exact moment of this run
    const wait =
      saved && saved.time === time && saved.runId === runId ? saved.wait : nextCue - time;
    pausedWaitRef.current = null;

    const startedAt = performance.now();
    let hasFired = false;
    const timerId = setTimeout(() => {
      hasFired = true;
      setHasStarted(true);
      if (nextCue >= loopMs) {
        setTime(0);
        setIsStill(false);
      } else {
        setTime(nextCue);
      }
    }, wait);

    return () => {
      clearTimeout(timerId);
      if (!hasFired) {
        const left = Math.max(0, wait - (performance.now() - startedAt));
        pausedWaitRef.current = { time, runId, wait: left };
      }
    };
  }, [isRunning, time, runId, cues, loopMs]);

  const replay = useCallback(() => {
    setTime(0);
    setIsStill(false);
    setHasStarted(true);
    setRunId((id) => id + 1);
  }, []);

  return {
    setStageElement,
    time,
    // Lets a still drop its entrance animations, which would start from an invisible keyframe
    isStill,
    runId,
    replay,
    // Hidden only for reduced motion, so pausing never removes a button that has focus
    canReplay: !prefersReducedMotion,
    motionState: isRunning ? "running" : "paused",
  };
}
