import { LORE_CATEGORIES } from "../../lore/constants/categories.js";

// The three About cards (Create, Share, Explore) and the copy of the panel each one opens.
// `id` also picks the card's icon and its showcase.
export const ABOUT_ITEMS = [
  {
    id: "create",
    title: "Create",
    summary: "Give each world a Project and fill it with Lore Entries.",
    lead: "Every world starts as a Project.",
    body: "A Project holds one world, with a title, an optional description and an optional cover image link. Inside it you write Lore Entries: each has a title, a category and a description, plus optional tags and an image link.",
    points: [
      // Counted from the category list, so the number stays right if a category is added
      `${LORE_CATEGORIES.length} categories, from characters and locations to artifacts and events`,
      "Descriptions of up to 5,000 characters and up to 10 tags per entry",
      "Edit an entry whenever your world changes, or move it to another of your Projects",
    ],
  },
  {
    id: "share",
    title: "Share",
    summary: "Keep your lore private, then publish it when it's ready.",
    lead: "Private until you're ready.",
    body: "New Projects and Lore Entries start private, so only you can see them. An entry appears in the Lore Catalog only when both the entry and its Project are public.",
    points: [
      "Publish entries one by one, whenever each one is ready",
      "Making a Project private hides all of its entries at once, without changing their own settings; make it public again and they return",
      "Public entries show your display name as the author, and anyone can visit your creator profile",
    ],
  },
  {
    id: "explore",
    title: "Explore",
    summary: "Search the catalog, appreciate entries and save your favorites.",
    lead: "Find lore worth keeping.",
    body: "The Lore Catalog gathers public lore from every creator, and anyone can read it without an account. Search by title, description or an exact tag, filter by category and sort by newest or oldest. Your filters stay in the address bar, so you can bookmark or share a search.",
    points: [
      "With an account, appreciate the entries you love; everyone can see how many appreciations an entry has",
      "Save favorites to your Constellation, a board of inspiration that others can see on your profile",
    ],
    link: { to: "/lore", label: "Browse the Lore Catalog" },
  },
];
