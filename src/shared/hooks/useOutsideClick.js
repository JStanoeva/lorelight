import { useEffect } from "react";

// While `isActive`, a press anywhere outside `ref`'s element calls `onOutsideClick` (e.g. to close a
// menu). Focus events alone can't do this: Safari doesn't move focus to a clicked button.
export function useOutsideClick(ref, isActive, onOutsideClick) {
  useEffect(() => {
    if (!isActive) {
      return;
    }

    function handlePointerDown(event) {
      if (!ref.current.contains(event.target)) {
        onOutsideClick();
      }
    }

    // Mount / update: listen while active. Cleanup: stop listening when it closes or unmounts.
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [ref, isActive, onOutsideClick]);
}
