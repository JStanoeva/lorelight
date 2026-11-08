import { changeAppreciationCount } from "../../appreciation/utils/appreciationCount.js";

// A null folderId gives the unfiled entries
export function getFolderEntries(entries, folderId) {
  return entries.filter((entry) => entry.folder_id === folderId);
}

export function filterEntries(entries, filterText) {
  const query = filterText.trim().toLowerCase();
  return query ? entries.filter((entry) => entry.title.toLowerCase().includes(query)) : entries;
}

// Case-insensitive, like the database's own sorting
export function sortFolders(folders) {
  return [...folders].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}

// The with* helpers are updaters for useProject's updateData
export function withSavedFolder(data, savedFolder) {
  return {
    ...data,
    folders: sortFolders([...data.folders.filter((folder) => folder.id !== savedFolder.id), savedFolder]),
  };
}

// Like the database, which moves a deleted folder's entries to the top level
export function withoutFolder(data, folderId) {
  return {
    ...data,
    folders: data.folders.filter((folder) => folder.id !== folderId),
    entries: data.entries.map((entry) => (entry.folder_id === folderId ? { ...entry, folder_id: null } : entry)),
  };
}

export function withoutEntry(data, entryId) {
  return {
    ...data,
    entries: data.entries.filter((entry) => entry.id !== entryId),
  };
}

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

export function getNewEntryPath(projectId, folderId = null) {
  const path = `/lore/create?projectId=${projectId}`;
  return folderId ? `${path}&folderId=${folderId}` : path;
}
