// The words and links built from a profile tab (one of PROFILE_TABS in constants/profileTabs.js).

// "/profile/<id>/lore": the page behind a tab's "All …" link.
export function getCollectionPath(userId, collection) {
  return `/profile/${userId}/${collection}`;
}

// (lore tab, 14) → "14 lore entries"; (projects tab, 1) → "1 project"
export function formatCollectionCount(tab, count) {
  return `${count.toLocaleString("en-US")} ${count === 1 ? tab.nouns.one : tab.nouns.other}`;
}

// (lore tab, 14) → "All 14 lore entries". The link only shows when there are more than RECENT_COUNT.
export function getAllLinkLabel(tab, total) {
  return `All ${formatCollectionCount(tab, total)}`;
}

// (lore tab, "Mira Lantern") → "All lore by Mira Lantern": the h1 of an "All …" page.
export function getAllPageTitle(tab, name) {
  return `${tab.allTitlePrefix} ${name}`;
}

// What an empty tab (or "All …" page) says → { title, text, action }. action ({ to, label }) is
// only for the owner, null for visitors.
export function getEmptyState(tab, isOwner, name) {
  if (isOwner) {
    return tab.ownerEmpty;
  }

  return { title: tab.visitorEmpty.title, text: `${name} ${tab.visitorEmpty.textAfterName}`, action: null };
}
