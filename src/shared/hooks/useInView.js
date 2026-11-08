import { useEffect, useState } from "react";

// Pass setElement as the ref: keeping the element in state makes the effect start and clean up
// the observer when the element appears or goes.
export function useInView(rootMargin = "0px") {
  const [element, setElement] = useState(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [element, rootMargin]);

  return [setElement, isInView];
}
