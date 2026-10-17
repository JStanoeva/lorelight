// Helpers for the project workspace (sidebar and lore grid).

// The entries of one folder, or the unfiled ones when folderId is null.
// Entries arrive sorted by title, and filter() keeps that order.
export function getFolderEntries(entries, folderId) {
  return entries.filter((entry) => entry.folder_id === folderId);
}

// Entries whose title contains the filter text, ignoring upper/lower case.
export function filterEntries(entries, filterText) {
  const query = filterText.trim().toLowerCase();
  return query ? entries.filter((entry) => entry.title.toLowerCase().includes(query)) : entries;
}

// Alphabetical and case-insensitive, like the database's own sorting.
export function sortFolders(folders) {
  return [...folders].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}

export function formatEntryCount(count) {
  if (count === 0) return "No entries";
  if (count === 1) return "1 entry";
  return `${count} entries`;
}

// The Create Lore form pre-selects the project (and the folder) from these URL parameters.
export function getNewEntryPath(projectId, folderId = null) {
  const path = `/lore/create?projectId=${projectId}`;
  return folderId ? `${path}&folderId=${folderId}` : path;
}
