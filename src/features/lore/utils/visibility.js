// Others can see an entry only when the entry AND its project are public (README §7).
// "hidden" = the entry is public, but its project is private, so nobody else sees it yet.
export function getVisibility(entry, project) {
  if (!entry.is_public) {
    return "private";
  }

  return project.is_public ? "public" : "hidden";
}

// The same rule for an entry loaded with its project embedded (entry.project.is_public).
// A missing project counts as not public.
export function isEffectivelyPublic(entry) {
  return entry.is_public === true && entry.project?.is_public === true;
}
