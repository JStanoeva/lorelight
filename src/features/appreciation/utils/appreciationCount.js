// The entry with `change` (1 for an appreciation, -1 for removing one) added to its count.
// Never below 0: the count may already be out of date (e.g. a removal made in another tab).
export function changeAppreciationCount(entry, change) {
  return { ...entry, appreciation_count: Math.max(0, (entry.appreciation_count ?? 0) + change) };
}

// The count in words, for the text line and the Appreciate button's description. Numbers are
// grouped like the rest of the app ("1,204").
export function formatAppreciationCount(count) {
  if (count === 0) return "No appreciations yet";
  if (count === 1) return "1 appreciation";
  return `${count.toLocaleString("en-US")} appreciations`;
}

// The bare number in the Appreciate button's count segment
export function formatPillCount(count) {
  return count.toLocaleString("en-US");
}
