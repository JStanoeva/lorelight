import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "../../../shared/hooks/useInView.js";
import { useIsPageVisible } from "../../../shared/hooks/useIsPageVisible.js";
import { useHomeMotion } from "./useHomeMotion.js";

// rootMargin for useInView: the bottom 15% of the screen does not count as "on screen" yet
const STAGE_MARGIN = "0px 0px -15% 0px";

// Plays one About showcase like a little film with a script of cues.
// `cues` is a sorted list of moments (in ms) where something changes, `finalCue` is the moment
// the finished picture is complete, `loopMs` is when the loop starts again from 0.
// The hook only waits for the next cue (one setTimeout at a time) and stores the cue it reached
// in state; the showcase shows every part whose cue has passed, and CSS animates each change.
//
// It plays only while motion is allowed, the stage is on screen and the tab is visible.
// Paused, it remembers how long was left until the next cue, so it carries on where it stopped.
export function useShowcasePlayback({ cues, finalCue, loopMs }) {
  const { isMotionAllowed, prefersReducedMotion } = useHomeMotion();
  // Starts once the stage is a little way up the screen, not when its first pixel peeks in
  const [setStageElement, isInView] = useInView(STAGE_MARGIN);
  const isPageVisible = useIsPageVisible();
  // The last cue reached, in ms (0 = the empty stage at the start of a loop)
  const [time, setTime] = useState(0);
  // True while the finished picture is shown without having been played up to (see below)
  const [isStill, setIsStill] = useState(false);
  // True once this showcase has played its first cue, or Replay was pressed. It tells the empty
  // stage before the film starts apart from the empty stage between two loops.
  const [hasStarted, setHasStarted] = useState(false);
  // Bumped by Replay: used as a key, so every CSS animation restarts from the beginning
  const [runId, setRunId] = useState(0);
  // { time, runId, wait }: what was left of the wait when playback was paused
  const pausedWaitRef = useRef(null);

  // Show the finished picture as a still in two cases:
  // - reduced motion is on (also when it is switched on mid-film);
  // - motion is off (paused or reduced motion) before this showcase has played anything, so the
  //   panel never opens on an empty stage.
  // When motion is allowed again, the film carries on from that picture: it fades out at the
  // end of the loop and starts over from its first moment, so nothing jumps.
  // Setting state while rendering is allowed when it only happens under a condition like this
  // one; React renders again with the new values before anything reaches the screen.
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
      // The state is set only here, in the timer's callback, never in the effect body
      setHasStarted(true);
      if (nextCue >= loopMs) {
        // The loop starts over, and from now on every part is played rather than jumped to
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

  // Back to the first moment, also while paused (the empty stage then waits for Play)
  const replay = useCallback(() => {
    setTime(0);
    setIsStill(false);
    setHasStarted(true);
    setRunId((id) => id + 1);
  }, []);

  return {
    setStageElement,
    time,
    // While still, the showcase drops the entrance animations of its parts: they would
    // otherwise start from their first, invisible keyframe
    isStill,
    runId,
    replay,
    // Hidden only for reduced motion, so pausing never removes a button that has focus
    canReplay: !prefersReducedMotion,
    motionState: isRunning ? "running" : "paused",
  };
}
