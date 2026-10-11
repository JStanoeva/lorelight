// Home page copy for each category, keyed by the category value.
export const CATEGORY_DETAILS = {
  character: {
    description:
      "The people who drive your story: heroes, villains, rulers and everyone in between.",
    examples: [
      "an exiled court astronomer",
      "the ferryman who never ages",
      "twin heirs to one throne",
    ],
  },
  location: {
    description:
      "Places worth mapping, from whole continents to a single tavern room.",
    examples: [
      "a city built on whale bones",
      "a library carved into a glacier",
      "a market that opens at midnight",
    ],
  },
  faction: {
    description:
      "Groups bound by a cause, a creed or a contract: guilds, orders, crews and secret circles.",
    examples: [
      "the Cartographers' Guild",
      "smugglers of the Salt Coast",
      "an order sworn to silence",
    ],
  },
  history: {
    description:
      "What came before your story: eras, dynasties, wars and the records they left behind.",
    examples: [
      "the Century of Ash",
      "the fall of the first empire",
      "a war that no one won",
    ],
  },
  religion: {
    description:
      "Faiths, gods and rites, and the people who keep them.",
    examples: [
      "a goddess of thresholds",
      "the pilgrim road to the white peak",
      "a forbidden heresy",
    ],
  },
  politics: {
    description:
      "Power and how it is held: rulers, laws, treaties and rivalries.",
    examples: [
      "a council of seven crowns",
      "the treaty that split the river",
      "a crown chosen by lot",
    ],
  },
  culture: {
    description:
      "How people live: customs, languages, food, art and festivals.",
    examples: [
      "a festival of paper lanterns",
      "courtship by trading riddles",
      "songs sung only at sea",
    ],
  },
  technology: {
    description:
      "Tools, machines and crafts, whether built from gears, runes or starlight.",
    examples: [
      "clockwork messenger birds",
      "rune-etched airship sails",
      "glass that remembers light",
    ],
  },
  artifact: {
    description:
      "Singular objects with a story, and often a price: relics, heirlooms, weapons and keys.",
    examples: [
      "a crown that whispers",
      "a map that redraws itself",
      "a key without a door",
    ],
  },
  creature: {
    description:
      "Beasts, spirits and beings that walk, swim or fly through your world.",
    examples: [
      "moth-winged foxes",
      "a river spirit owed a favor",
      "the leviathans of the deep trench",
    ],
  },
  event: {
    description:
      "Single moments that change the course of a world: battles, discoveries, disasters and coronations.",
    examples: [
      "the night the stars went out",
      "the Siege of Highwater",
      "a wedding that started a war",
    ],
  },
  other: {
    description:
      "Anything that doesn't fit elsewhere: calendars, prophecies, songs and stray notes.",
    examples: [
      "a calendar of thirteen moons",
      "an unfinished prophecy",
      "a traveler's phrasebook",
    ],
  },
};

// Used for a category that has no copy of its own yet (for example one added later).
export const DEFAULT_CATEGORY_DETAILS = {
  description: "Lore that creators have filed under this category.",
  examples: [],
};
