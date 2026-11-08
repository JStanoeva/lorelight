import { useEffect, useState } from "react";

// Pin centres { [entryId]: { x, y } } in px from the surface's top-left, null until measured.
// `layoutKey` re-measures when the cards change, even if the list keeps its size.
export function usePinPositions(surfaceRef, listRef, layoutKey) {
  const [measured, setMeasured] = useState({ key: null, pins: null });

  useEffect(() => {
    const surface = surfaceRef.current;
    const list = listRef.current;
    if (!surface || !list) {
      return undefined;
    }

    function measure() {
      const surfaceBox = surface.getBoundingClientRect();
      const pins = {};
      list.querySelectorAll("[data-pin-cell]").forEach((cell) => {
        const pinBox = cell.querySelector("[data-pin]").getBoundingClientRect();
        pins[cell.dataset.pinCell] = {
          x: pinBox.left + pinBox.width / 2 - surfaceBox.left,
          y: pinBox.top + pinBox.height / 2 - surfaceBox.top,
        };
      });

      setMeasured({ key: layoutKey, pins });
    }

    // The observer calls measure() right after it starts watching, then on every size change
    const observer = new ResizeObserver(measure);
    observer.observe(list);

    return () => observer.disconnect();
  }, [surfaceRef, listRef, layoutKey]);

  // Positions of an earlier list would put threads where no pin is (for a frame after a removal)
  return measured.key === layoutKey ? measured.pins : null;
}
