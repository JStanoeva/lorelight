import { Fragment, useEffect, useState } from "react";
import { ABOUT_ITEMS } from "../constants/aboutItems.js";
import { SECTION_IDS } from "../constants/homeSections.js";
import { useHomeMotion } from "../hooks/useHomeMotion.js";
import { useSectionReveal } from "../hooks/useSectionReveal.js";
import AboutCard from "./AboutCard.jsx";
import AboutPanel from "./AboutPanel.jsx";
import SectionHeading from "./SectionHeading.jsx";
import CreateShowcase from "./showcases/CreateShowcase.jsx";
import ExploreShowcase from "./showcases/ExploreShowcase.jsx";
import ShareShowcase from "./showcases/ShareShowcase.jsx";
import "../styles/about.css";

// Module-level elements (not component definitions), looked up by card id.
const SHOWCASES = {
  create: <CreateShowcase />,
  share: <ShareShowcase />,
  explore: <ExploreShowcase />,
};

// "How Lorelight works": three cards, and at most one open panel at a time (all closed at first).
export default function AboutSection() {
  const [openId, setOpenId] = useState(null);
  // How each card's icon appeared the first time that card was on screen, by card id:
  // "tracing" (drawn in with light) or "drawn" (shown complete, because motion was off then).
  // A card is missing until it has been seen.
  const [iconEntrances, setIconEntrances] = useState({});
  const { isMotionAllowed } = useHomeMotion();
  // The section fades in the first time it comes into view: its heading, then the cards
  const setSectionElement = useSectionReveal();

  // Watch each card that hasn't been seen yet, so on phones (cards stacked) every icon traces
  // in when its own card scrolls into view. A decision is kept afterwards, so icons that were
  // shown complete never vanish to be traced again when the animations are resumed.
  useEffect(() => {
    // The cards still waiting, as button element → card id
    const waitingCards = new Map();
    ABOUT_ITEMS.forEach((item) => {
      const card = document.getElementById(`about-card-${item.id}`);
      if (card && !iconEntrances[item.id]) {
        waitingCards.set(card, item.id);
      }
    });
    if (waitingCards.size === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const seenIds = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => waitingCards.get(entry.target));
        if (seenIds.length > 0) {
          const entrance = isMotionAllowed ? "tracing" : "drawn";
          setIconEntrances((current) => {
            const next = { ...current };
            seenIds.forEach((id) => {
              if (!next[id]) {
                next[id] = entrance;
              }
            });
            return next;
          });
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    for (const card of waitingCards.keys()) {
      observer.observe(card);
    }

    return () => observer.disconnect();
  }, [iconEntrances, isMotionAllowed]);

  // Bring a newly opened panel into view. Only the DOM is touched here, no state is set.
  // If the panel runs past the bottom of the screen, its card scrolls to just under the header:
  // the focused card stays visible and as much of the panel as fits shows below it. Nothing
  // moves when the panel already fits. The scroll is smooth only when the user allows motion
  // (the scoped rule in home.css).
  useEffect(() => {
    if (openId) {
      const panel = document.getElementById(`about-panel-${openId}`);
      if (panel && panel.getBoundingClientRect().bottom > window.innerHeight) {
        document.getElementById(`about-card-${openId}`)?.scrollIntoView({ block: "start" });
      }
    }
  }, [openId]);

  function handleToggle(id) {
    setOpenId((currentId) => (currentId === id ? null : id));
  }

  // Escape inside a panel: close it and move focus back to its card, so focus isn't lost
  // when the panel's content disappears.
  function handleClose(id) {
    setOpenId(null);
    document.getElementById(`about-card-${id}`)?.focus();
  }

  // Before a card is first seen, its icon's lines wait hidden ("waiting") so they can be traced in
  function getIconState(id) {
    return iconEntrances[id] ?? (isMotionAllowed ? "waiting" : "drawn");
  }

  return (
    <section
      ref={setSectionElement}
      id={SECTION_IDS.about}
      aria-labelledby="about-title"
      className="home-section about-section"
    >
      <div className="home-container">
        <SectionHeading titleId="about-title" numeral="I" eyebrow="About" title="How Lorelight works">
          Every world you build is a Project, and everything inside it, from its heroes to its holy
          wars, is a Lore Entry. Choose a step to see it up close.
        </SectionHeading>

        {/* DOM order is card, panel, card, panel… From md up, the cards share row 1 and the
            open panel spans row 2; below md, each panel opens right under its card. */}
        <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6 lg:mt-16">
          {ABOUT_ITEMS.map((item, index) => (
            <Fragment key={item.id}>
              <AboutCard
                item={item}
                index={index}
                iconState={getIconState(item.id)}
                isOpen={openId === item.id}
                onToggle={() => handleToggle(item.id)}
              />
              <AboutPanel
                item={item}
                isOpen={openId === item.id}
                onClose={() => handleClose(item.id)}
              >
                {SHOWCASES[item.id]}
              </AboutPanel>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
