import { FAQ_ITEMS } from "../constants/faq.js";
import { SECTION_IDS } from "../constants/homeSections.js";
import { useSectionReveal } from "../hooks/useSectionReveal.js";
import FaqItem from "./FaqItem.jsx";
import SectionHeading from "./SectionHeading.jsx";

// The section fades in the first time it comes into view: its heading, then the questions.
export default function FaqSection() {
  const setSectionElement = useSectionReveal();

  return (
    <section
      ref={setSectionElement}
      id={SECTION_IDS.faq}
      aria-labelledby="faq-title"
      className="home-section faq-section"
    >
      <div className="home-container">
        <SectionHeading titleId="faq-title" numeral="III" eyebrow="FAQ" title="Questions, answered">
          Short answers about accounts, privacy and sharing.
        </SectionHeading>

        <ul className="faq-list mt-12 lg:mt-16">
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.id} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
}
