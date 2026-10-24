import { useEffect, useState } from "react";

// Whether an element is on screen, so an animation can stop while nobody can see it.
// Returns [setElement, isInView]: pass setElement as the element's ref (ref={setElement}).
// React calls it with the element when it appears and with null when it goes, and keeping the
// element in state makes the effect below start (and clean up) the observer at the right time.
// rootMargin widens the area that counts as "on screen" (px or %, like CSS margins), e.g.
// "200px" starts an animation just before it scrolls into view.
export function useInView(rootMargin = "0px") {
  const [element, setElement] = useState(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!element) {
      return;
    }

    // The state is set only inside the observer's callback, never directly in the effect
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [element, rootMargin]);

  return [setElement, isInView];
}
