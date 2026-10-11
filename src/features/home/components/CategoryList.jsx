import { LORE_CATEGORIES } from "../../lore/constants/categories.js";
import CategoryItem from "./CategoryItem.jsx";

// Every lore category, flowing into 1, 2 or 3 columns. A category added to LORE_CATEGORIES
// later appears here on its own.
export default function CategoryList() {
  return (
    <ul className="mt-12 grid gap-x-8 border-t border-night-700 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
      {LORE_CATEGORIES.map((category) => (
        <CategoryItem key={category.value} category={category} />
      ))}
    </ul>
  );
}
