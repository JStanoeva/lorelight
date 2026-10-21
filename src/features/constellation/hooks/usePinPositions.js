import { useEffect, useState } from "react";

// Where the cards' star-pins sit on the board, so the threads can be drawn between them:
// { [entryId]: { x, y } }, each pin's centre in pixels from the board surface's top-left corner
// (the threads' SVG covers the surface 1:1). null until measured.
// The browser only knows where the cards ended up after layout, so they're measured in an effect.
// A ResizeObserver measures once when it starts watching and again whenever the list changes size
// (window resized, fonts loaded, an error line added). `layoutKey` changes when the list of cards
// changes, so a removal or a new filter measures again even if the list keeps its size.
// A card tilts around its own pin, so the pin's centre is the same whether the card is tilted or not.
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

    // Unmount, or before measuring a new list of cards: stop watching
    return () => observer.disconnect();
  }, [surfaceRef, listRef, layoutKey]);

  // Positions measured for an earlier list of cards would put threads where no pin is any more
  // (for one frame after a removal), so they're only used for the list they were measured for
  return measured.key === layoutKey ? measured.pins : null;
}
