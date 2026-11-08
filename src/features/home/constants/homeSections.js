export const SECTION_IDS = {
  hero: "hero",
  about: "about",
  categories: "categories",
  faq: "faq",
  closing: "closing",
};

// The header stays transparent only while this line sits fully below the bar.
export const HERO_EYEBROW_ID = "hero-eyebrow";

export const HOME_SECTIONS = [
  { id: SECTION_IDS.about, label: "About" },
  { id: SECTION_IDS.categories, label: "Categories" },
  { id: SECTION_IDS.faq, label: "FAQ" },
];

// Closing is left out so FAQ stays highlighted to the bottom of the page. Module-level so the
// array keeps its identity between renders (it is an effect dependency).
export const HOME_SPY_SECTION_IDS = [
  SECTION_IDS.hero,
  SECTION_IDS.about,
  SECTION_IDS.categories,
  SECTION_IDS.faq,
];
