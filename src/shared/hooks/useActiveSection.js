import { useEffect, useState } from "react";

// Scroll-spy. `sectionIds` must be a constant array defined outside any component, in page order.
export function useActiveSection(sectionIds, isEnabled = true) {
  const [activeId, setActiveId] = useState(sectionIds[0]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    // rootMargin accepts only px or %, so rem is converted here, which keeps the band right when
    // the browser's default font size is larger.
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

        // The first visible section in page order wins; with none in the band, the last one stays
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
