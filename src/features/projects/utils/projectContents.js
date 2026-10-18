import { changeAppreciationCount } from "../../appreciation/utils/appreciationCount.js";

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

// These go to useProject's updateData, so a change shows at once without reloading the project.
// A folder was created or renamed in the sidebar: put it in the list, in alphabetical order.
export function withSavedFolder(data, savedFolder) {
  return {
    ...data,
    folders: sortFolders([...data.folders.filter((folder) => folder.id !== savedFolder.id), savedFolder]),
  };
}

// A folder was deleted: the database moved its entries to the top level, so do the same here.
export function withoutFolder(data, folderId) {
  return {
    ...data,
    folders: data.folders.filter((folder) => folder.id !== folderId),
    entries: data.entries.map((entry) => (entry.folder_id === folderId ? { ...entry, folder_id: null } : entry)),
  };
}

// A lore entry was deleted on Lore Details: take it out of the project's entries.
export function withoutEntry(data, entryId) {
  return {
    ...data,
    entries: data.entries.filter((entry) => entry.id !== entryId),
  };
}

// An entry was appreciated (change 1) or its appreciation removed (change -1) on Lore Details, or
// that was undone after a failed request (the opposite change): update its count here too, so the
// overview's cards show the new number.
export function withAppreciationChange(data, entryId, change) {
  return {
    ...data,
    entries: data.entries.map((entry) => (entry.id === entryId ? changeAppreciationCount(entry, change) : entry)),
  };
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
