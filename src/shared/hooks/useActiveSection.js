import { useEffect, useState } from "react";

// Scroll-spy: returns the id of the section sitting just below the sticky header.
// `sectionIds` must be a constant array defined outside any component, in page order.
export function useActiveSection(sectionIds, isEnabled = true) {
  const [activeId, setActiveId] = useState(sectionIds[0]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    // rootMargin accepts only px or %, so the band's top edge (1rem below the 4rem sticky header)
    // is converted from rem here. That keeps it right when the browser's default font size is larger.
    const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const visibleIds = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id);
          } else {
            visibleIds.delete(entry.target.id);
          }
        });

        // The first visible section in page order is the one under the header.
        // When nothing is in the band, the last match is kept.
        const firstVisibleId = sectionIds.find((id) => visibleIds.has(id));
        if (firstVisibleId) {
          setActiveId(firstVisibleId);
        }
      },
      // A band from 5rem (just under the header) down to 40% of the viewport height.
      { rootMargin: `-${remPx * 5}px 0px -60% 0px` },
    );

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, [sectionIds, isEnabled]);

  return activeId;
}
