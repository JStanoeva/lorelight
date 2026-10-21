import { getCategory } from "../../lore/utils/getCategory.js";
import { isEffectivelyPublic } from "../../lore/utils/visibility.js";
import { CREATOR_TITLES } from "../constants/creatorTitles.js";
import { RECENT_COUNT } from "../constants/profileTabs.js";

// Everything the profile shows besides the rows themselves, worked out from the rows useProfile
// loaded. The rows are what the viewer may see (Row Level Security): the owner gets everything,
// a visitor only public projects and public lore.

// An unreadable or missing date counts as the oldest.
function toTime(value) {
  const time = Date.parse(value ?? "");
  return Number.isNaN(time) ? 0 : time;
}

// Ids compared as text, the order Postgres gives uuids.
function compareIds(a, b) {
  if (a === b) {
    return 0;
  }

  return a < b ? -1 : 1;
}

// A new array, newest first by `dateField` ("updated_at", "created_at", "saved_at",
// "appreciated_at"). Items with the same date are ordered by id, so they never swap places
// between loads (the services' .order("id") does the same).
export function sortByNewest(items, dateField) {
  return [...items].sort((a, b) => toTime(b[dateField]) - toTime(a[dateField]) || compareIds(a.id, b.id));
}

// The `count` newest items (three by default): what a profile tab shows.
export function getRecent(items, dateField, count = RECENT_COUNT) {
  return sortByNewest(items, dateField).slice(0, count);
}

// The four figures under the bio. appreciationsReceived adds up the appreciations on the creator's
// lore the viewer can see, so the owner also counts the ones kept on lore that turned private.
export function getProfileStats({ projects, lore, constellation }) {
  return {
    projects: projects.length,
    lore: lore.length,
    appreciationsReceived: lore.reduce((sum, entry) => sum + (entry.appreciation_count ?? 0), 0),
    saves: constellation.length,
  };
}

// The creator title comes from the category with the most PUBLIC lore. Private lore never counts,
// not even for the owner, so the owner sees the same title as everyone else. A tie goes to the
// category of the newest public entry among the tied categories. null without public lore.
// Returns { category, title }, e.g. { category: "location", title: "Keeper of Locations" }.
export function getCreatorTitle(lore) {
  const publicLore = lore.filter(isEffectivelyPublic);

  if (publicLore.length === 0) {
    return null;
  }

  const counts = {};
  for (const entry of publicLore) {
    counts[entry.category] = (counts[entry.category] ?? 0) + 1;
  }

  const topCount = Math.max(...Object.values(counts));
  const tiedEntries = publicLore.filter((entry) => counts[entry.category] === topCount);
  const newestTied = sortByNewest(tiedEntries, "created_at")[0];
  // getCategory turns an unknown value into "other", so there is always a title
  const category = getCategory(newestTied.category).value;

  return { category, title: CREATOR_TITLES[category] };
}

// "Currently worldbuilding": the most recently updated PUBLIC project (also for the owner), or null.
export function getSpotlightProject(projects) {
  const publicProjects = projects.filter((project) => project.is_public === true);
  return sortByNewest(publicProjects, "updated_at")[0] ?? null;
}
