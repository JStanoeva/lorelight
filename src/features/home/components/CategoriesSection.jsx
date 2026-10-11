import { SECTION_IDS } from "../constants/homeSections.js";
import CategoryList from "./CategoryList.jsx";
import SectionHeading from "./SectionHeading.jsx";
import "../styles/categories.css";

// The intro names no number of categories, so it stays true when one is added.
export default function CategoriesSection() {
  return (
    <section
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

        <CategoryList />
      </div>
    </section>
  );
}
