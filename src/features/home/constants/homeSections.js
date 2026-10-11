// Element ids of the Home page sections, shared by the sections, the header links and the scroll-spy.
export const SECTION_IDS = {
  hero: "hero",
  about: "about",
  categories: "categories",
  faq: "faq",
  closing: "closing",
};

// The hero's first line of text. The header stays transparent only while it sits fully below the bar.
export const HERO_EYEBROW_ID = "hero-eyebrow";

// The header's "On this page" links, in page order.
export const HOME_SECTIONS = [
  { id: SECTION_IDS.about, label: "About" },
  { id: SECTION_IDS.categories, label: "Categories" },
  { id: SECTION_IDS.faq, label: "FAQ" },
];

// The sections the scroll-spy watches, in page order. The closing strip is left out on purpose,
// so FAQ stays highlighted down to the bottom of the page. Defined at module level so the array
// keeps the same identity between renders (it is an effect dependency).
export const HOME_SPY_SECTION_IDS = [
  SECTION_IDS.hero,
  SECTION_IDS.about,
  SECTION_IDS.categories,
  SECTION_IDS.faq,
];
