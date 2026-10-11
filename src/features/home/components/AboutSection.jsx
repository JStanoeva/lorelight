import { Fragment, useEffect, useState } from "react";
import { ABOUT_ITEMS } from "../constants/aboutItems.js";
import { SECTION_IDS } from "../constants/homeSections.js";
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

  return (
    <section
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
          {ABOUT_ITEMS.map((item) => (
            <Fragment key={item.id}>
              <AboutCard
                item={item}
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
