// Small text helpers for the Constellation board.

// "18 saved entries", "1 saved entry"
export function formatSavedCount(count) {
  return count === 1 ? "1 saved entry" : `${count} saved entries`;
}

// The line above the board: "18 saved entries", or with a category chosen
// "Location · 3 of 18 saved entries". `categoryLabel` is "" for all categories.
export function getBoardCountText(shownCount, totalCount, categoryLabel) {
  if (totalCount === 0) {
    return "Nothing pinned yet";
  }
  if (!categoryLabel) {
    return formatSavedCount(totalCount);
  }
  return `${categoryLabel} · ${shownCount} of ${formatSavedCount(totalCount)}`;
}

// Under a board without any thread yet (no two entries share a category), so it's clear what the
// threads will be. `categoryLabel` is "" for all categories.
export function getThreadHint(isOwner, categoryLabel) {
  if (categoryLabel && isOwner) {
    return `Save another ${categoryLabel} entry and a star-thread will join the two.`;
  }
  if (categoryLabel) {
    return `A star-thread appears as soon as two of the saved entries are ${categoryLabel} lore.`;
  }
  if (isOwner) {
    return "A star-thread appears as soon as two of your saved entries share a category.";
  }
  return "A star-thread appears as soon as two of the saved entries share a category.";
}
