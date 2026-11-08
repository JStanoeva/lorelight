export function getCollectionPath(userId, collection) {
  return `/profile/${userId}/${collection}`;
}

export function formatCollectionCount(tab, count) {
  return `${count.toLocaleString("en-US")} ${count === 1 ? tab.nouns.one : tab.nouns.other}`;
}

export function getAllLinkLabel(tab, total) {
  return `All ${formatCollectionCount(tab, total)}`;
}

export function getAllPageTitle(tab, name) {
  return `${tab.allTitlePrefix} ${name}`;
}

export function getEmptyState(tab, isOwner, name) {
  if (isOwner) {
    return tab.ownerEmpty;
  }

  return { title: tab.visitorEmpty.title, text: `${name} ${tab.visitorEmpty.textAfterName}`, action: null };
}
