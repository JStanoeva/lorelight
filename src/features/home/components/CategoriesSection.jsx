import { LORE_CATEGORIES } from "../../lore/constants/categories.js";
import { SECTION_IDS } from "../constants/homeSections.js";
import { useSectionReveal } from "../hooks/useSectionReveal.js";
import CategoryList from "./CategoryList.jsx";
import CategoryOrrery from "./CategoryOrrery.jsx";
import SectionHeading from "./SectionHeading.jsx";
import "../styles/categories.css";

// From lg the orrery shows the categories; below lg the list does, with the same content
export default function CategoriesSection() {
  const setSectionElement = useSectionReveal();

  return (
    <section
      ref={setSectionElement}
      id={SECTION_IDS.categories}
      aria-labelledby="categories-title"
      className="home-section categories-section"
    >
      <div className="starfield categories-stars" aria-hidden="true" />

      <div className="home-container">
        <SectionHeading
          titleId="categories-title"
          numeral="II"
          eyebrow="Categories"
          title="A star for every kind of lore"
        >
          Every Lore Entry belongs to one category, and readers use categories to filter the Lore
          Catalog. Pick one to browse its public lore.
        </SectionHeading>

        <CategoryOrrery categories={LORE_CATEGORIES} />

        <div className="lg:hidden" data-reveal-item>
          <CategoryList />
        </div>
      </div>
    </section>
  );
}
