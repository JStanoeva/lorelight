export function formatSavedCount(count) {
  return count === 1 ? "1 saved entry" : `${count} saved entries`;
}

// "18 saved entries", or "Location · 3 of 18 saved entries"; `categoryLabel` is "" for all
export function getBoardCountText(shownCount, totalCount, categoryLabel) {
  if (!categoryLabel) {
    return formatSavedCount(totalCount);
  }
  return `${categoryLabel} · ${shownCount} of ${formatSavedCount(totalCount)}`;
}

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
