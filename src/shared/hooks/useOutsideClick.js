import { useEffect } from "react";

// Uses pointerdown, not focus events: Safari doesn't move focus to a clicked button.
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

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [ref, isActive, onOutsideClick]);
}
