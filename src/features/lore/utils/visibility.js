// Others can see an entry only when the entry AND its project are public (README §7).
// "hidden" = the entry is public, but its project is private, so nobody else sees it yet.
export function getVisibility(entry, project) {
  if (!entry.is_public) {
    return "private";
  }

  return project.is_public ? "public" : "hidden";
}
