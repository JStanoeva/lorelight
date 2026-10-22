import { useState } from "react";
import { Link } from "react-router";
import AppreciateButton from "../../appreciation/components/AppreciateButton.jsx";
import { formatAppreciationCount } from "../../appreciation/utils/appreciationCount.js";
import SaveToConstellationButton from "../../constellation/components/SaveToConstellationButton.jsx";
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

// Why the author sees the count but no Appreciate or Save button: the database only accepts
// appreciations and saves of lore that others can read (the entry AND its project are public)
const CLOSED_REASONS = {
  private: "Appreciations and saves open once the entry is public.",
  hidden: "Appreciations and saves open once its project is public too.",
};

// The row under the banner: the Appreciate button with the count and the Save button (only the
// count, with a reason, on the author's entries that others can't see), and for the author the Edit
// and Delete actions plus a note on who can see the entry. `onDeleted` runs after a successful delete,
// `onAppreciationChange(change)` once the database has accepted a new appreciation (1) or its
// removal (-1).
export default function LoreActions({ entry, isOwner, onDeleted, onAppreciationChange }) {
  // Kept here (not in the page), so an open dialog closes by itself when another entry starts
  // loading: this row is replaced by the loader, and its state goes with it
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  // The author always sees their own project, so entry.project is there. Everyone else can only
  // ever open entries that are public in a public project.
  const visibility = isOwner ? getVisibility(entry, entry.project) : "public";

  return (
    <div className="lore-toolbar">
      <div className="lore-actions">
        {visibility === "public" ? (
          <div className="lore-reactions">
            <AppreciateButton entry={entry} onCountChange={onAppreciationChange} />
            <SaveToConstellationButton loreId={entry.id} />
          </div>
        ) : (
          // Appreciations kept from when the entry was public still count, so its author sees them
          <p className="lore-appreciations">
            <Icon name="heart" />
            {formatAppreciationCount(entry.appreciation_count)}{" "}
            <span className="lore-appreciations-reason">{CLOSED_REASONS[visibility]}</span>
          </p>
        )}

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
          onDeleted={onDeleted}
        />
      )}
    </div>
  );
}
