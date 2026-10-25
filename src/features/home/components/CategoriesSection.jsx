import { LORE_CATEGORIES } from "../../lore/constants/categories.js";
import { SECTION_IDS } from "../constants/homeSections.js";
import { useSectionReveal } from "../hooks/useSectionReveal.js";
import CategoryList from "./CategoryList.jsx";
import CategoryOrrery from "./CategoryOrrery.jsx";
import SectionHeading from "./SectionHeading.jsx";
import "../styles/categories.css";

// The intro names no number of categories, so it stays true when one is added.
// From lg the orrery shows the categories (every star is a button, and its lens holds the same
// description, examples and link as the list); below lg the list does. The section fades in
// the first time it comes into view: its heading, then the orrery or the list.
export default function CategoriesSection() {
  const setSectionElement = useSectionReveal();

  return (
    <section
      ref={setSectionElement}
      id={SECTION_IDS.categories}
      aria-labelledby="categories-title"
      className="home-section categories-section"
    >
      {/* A faint, still star layer behind the content (the "sky band") */}
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
