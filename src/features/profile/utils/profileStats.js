import { getCategory } from "../../lore/utils/getCategory.js";
import { isEffectivelyPublic } from "../../lore/utils/visibility.js";
import { CREATOR_TITLES } from "../constants/creatorTitles.js";
import { RECENT_COUNT } from "../constants/profileTabs.js";

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

// Items with the same date are ordered by id, so they never swap places between loads (like the
// services' .order("id"))
export function sortByNewest(items, dateField) {
  return [...items].sort((a, b) => toTime(b[dateField]) - toTime(a[dateField]) || compareIds(a.id, b.id));
}

export function getRecent(items, dateField, count = RECENT_COUNT) {
  return sortByNewest(items, dateField).slice(0, count);
}

// appreciationsReceived sums over the lore the viewer can see, so the owner also counts the
// appreciations kept on lore that turned private
export function getProfileStats({ projects, lore, constellation }) {
  return {
    projects: projects.length,
    lore: lore.length,
    appreciationsReceived: lore.reduce((sum, entry) => sum + (entry.appreciation_count ?? 0), 0),
    saves: constellation.length,
  };
}

// Only PUBLIC lore counts, even for the owner, so everyone sees the same title. A tie goes to the
// category of the newest tied entry.
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

// "Currently worldbuilding": the most recently updated PUBLIC project, also for the owner
export function getSpotlightProject(projects) {
  const publicProjects = projects.filter((project) => project.is_public === true);
  return sortByNewest(publicProjects, "updated_at")[0] ?? null;
}
