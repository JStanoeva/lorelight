// How many items a profile tab shows before its "All …" link
export const RECENT_COUNT = 3;

export const DEFAULT_PROFILE_TAB = "projects";

// The four tabs of a Creator Profile, in order. `value` is the ?tab= value, the name of the
// collection useProfile returns, and the last segment of the tab's "All …" page
// (/profile/:userId/:collection). `dateField` decides which items are the most recent.
// `listHeading` is the hidden h2 above the cards of an "All …" page (the cards' titles are h3s;
// the Constellation's board brings its own).
// The owner gets a note on who can see the tab and, when it's empty, a next step; a visitor gets
// one calm sentence that starts with the creator's name (see getEmptyState in
// utils/profileTabText.js).
export const PROFILE_TABS = [
  {
    value: "projects",
    label: "Projects",
    dateField: "updated_at",
    nouns: { one: "project", other: "projects" },
    panelTitle: "Recent projects",
    listHeading: "Projects",
    allTitlePrefix: "All projects by",
    ownerNote: "Visitors see only your public projects and lore.",
    allOwnerNote: "Visitors see only your public projects.",
    ownerEmpty: {
      title: "No projects yet",
      text: "A project is a world your lore lives in. Start one, and it stays private until you make it public.",
      action: { to: "/projects/create", label: "Create a project" },
    },
    visitorEmpty: { title: "No public projects yet", textAfterName: "hasn't shared a project yet." },
  },
  {
    value: "lore",
    label: "Lore",
    dateField: "created_at",
    nouns: { one: "lore entry", other: "lore entries" },
    panelTitle: "Recent lore",
    listHeading: "Lore entries",
    allTitlePrefix: "All lore by",
    ownerNote: "Visitors see only your public projects and lore.",
    allOwnerNote: "Visitors see only your public lore.",
    ownerEmpty: {
      title: "No lore yet",
      text: "Write your first entry for one of your projects. New entries stay private until you make them public.",
      action: { to: "/lore/create", label: "Write a lore entry" },
    },
    visitorEmpty: { title: "No public lore yet", textAfterName: "hasn't shared any lore yet." },
  },
  {
    value: "constellation",
    label: "Constellation",
    dateField: "saved_at",
    nouns: { one: "saved entry", other: "saved entries" },
    panelTitle: "Recently saved",
    allTitlePrefix: "All lore saved by",
    ownerNote: "Everyone can see the entries you save to your Constellation.",
    allOwnerNote: "Everyone can see your Constellation.",
    ownerEmpty: {
      title: "Your Constellation is empty",
      text: "Save public lore you love from the catalog and it is pinned here, where everyone can see it.",
      action: { to: "/lore", label: "Explore the catalog" },
    },
    visitorEmpty: { title: "Nothing saved yet", textAfterName: "hasn't saved any lore to their Constellation yet." },
  },
  {
    value: "appreciated",
    label: "Appreciated",
    dateField: "appreciated_at",
    nouns: { one: "appreciated entry", other: "appreciated entries" },
    panelTitle: "Recently appreciated",
    listHeading: "Appreciated entries",
    allTitlePrefix: "All lore appreciated by",
    // "public": the owner's own appreciated entries that are no longer public stay in her list
    // (marked on their cards), but visitors never see them
    ownerNote: "Everyone can see the public lore you appreciate.",
    allOwnerNote: "Visitors see only the public lore in this list.",
    ownerEmpty: {
      title: "No appreciated lore yet",
      text: "Lore you appreciate is listed here, for everyone to see.",
      action: { to: "/lore", label: "Explore the catalog" },
    },
    visitorEmpty: { title: "Nothing appreciated yet", textAfterName: "hasn't appreciated any lore yet." },
  },
];
