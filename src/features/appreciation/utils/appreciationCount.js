// Never below 0: the count may already be stale (e.g. a removal made in another tab)
export function changeAppreciationCount(entry, change) {
  return { ...entry, appreciation_count: Math.max(0, (entry.appreciation_count ?? 0) + change) };
}

export function formatAppreciationCount(count) {
  if (count === 0) return "No appreciations yet";
  if (count === 1) return "1 appreciation";
  return `${count.toLocaleString("en-US")} appreciations`;
}

export function formatPillCount(count) {
  return count.toLocaleString("en-US");
}
