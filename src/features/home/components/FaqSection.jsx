import { FAQ_ITEMS } from "../constants/faq.js";
import { SECTION_IDS } from "../constants/homeSections.js";
import FaqItem from "./FaqItem.jsx";
import SectionHeading from "./SectionHeading.jsx";

export default function FaqSection() {
  return (
    <section id={SECTION_IDS.faq} aria-labelledby="faq-title" className="home-section faq-section">
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
