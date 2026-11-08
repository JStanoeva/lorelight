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

const SHOWCASES = {
  create: <CreateShowcase />,
  share: <ShareShowcase />,
  explore: <ExploreShowcase />,
};

export default function AboutSection() {
  const [openId, setOpenId] = useState(null);
  // By card id, set when the card is first seen: "tracing", or "drawn" if motion was off then
  const [iconEntrances, setIconEntrances] = useState({});
  const { isMotionAllowed } = useHomeMotion();
  const setSectionElement = useSectionReveal();

  // Each icon traces in when its own card scrolls into view (the cards stack on phones). A
  // decision is kept, so drawn icons never vanish to trace again when animations resume.
  useEffect(() => {
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

  // If a newly opened panel runs off screen, scroll its card to the top, so the focused card
  // stays visible above as much panel as fits (smooth only when motion is allowed, home.css)
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

  // Focus returns to the card, so it isn't lost when the panel's content unmounts
  function handleClose(id) {
    setOpenId(null);
    document.getElementById(`about-card-${id}`)?.focus();
  }

  // "waiting": the lines stay hidden until the card is first seen, so they can be traced in
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
