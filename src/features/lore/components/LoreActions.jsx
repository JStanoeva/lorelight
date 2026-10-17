import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Icon from "../../../shared/components/Icon.jsx";
import { getVisibility } from "../utils/visibility.js";
import DeleteLoreDialog from "./DeleteLoreDialog.jsx";
import VisibilityBadge from "./VisibilityBadge.jsx";

// Who can see the entry, in one sentence for its author (see getVisibility)
const VISIBILITY_NOTES = {
  public: "Everyone can read this entry in the Lore Catalog.",
  private: "Only you can see this entry.",
  hidden: "This entry is public, but its project is private, so only you can see it for now.",
};

function formatAppreciationCount(count) {
  if (count === 0) return "No appreciations yet";
  if (count === 1) return "1 appreciation";
  return `${count} appreciations`;
}

// The row under the banner: the appreciation count for everyone, and for the author the Edit and
// Delete actions plus a note on who can see the entry.
export default function LoreActions({ entry, isOwner }) {
  const navigate = useNavigate();
  // Kept here (not in the page), so an open dialog closes by itself when another entry starts
  // loading: this row is replaced by the loader, and its state goes with it
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  // The author always sees their own project, so entry.project is there
  const visibility = isOwner ? getVisibility(entry, entry.project) : null;

  return (
    <div className="lore-toolbar">
      <div className="lore-actions">
        <p className="lore-appreciations">
          <Icon name="heart" />
          {formatAppreciationCount(entry.appreciation_count)}
        </p>

        {isOwner && (
          <div className="lore-owner-tools">
            <Link to={`/lore/${entry.id}/edit`} className="btn btn-ghost">
              <Icon name="pencil" />
              Edit
            </Link>
            <button type="button" className="btn btn-danger" onClick={() => setIsDeleteOpen(true)}>
              <Icon name="trash" />
              Delete
            </button>
          </div>
        )}
      </div>

      {isOwner && (
        <p className="lore-visibility">
          <VisibilityBadge visibility={visibility} />
          <span>{VISIBILITY_NOTES[visibility]}</span>
        </p>
      )}

      {/* isOwner too: if the user logs out (e.g. in another tab) while it's open, it disappears */}
      {isOwner && isDeleteOpen && (
        <DeleteLoreDialog
          entry={entry}
          onCancel={() => setIsDeleteOpen(false)}
          onDeleted={() => navigate(`/projects/${entry.project_id}`)}
        />
      )}
    </div>
  );
}
