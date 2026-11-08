import { useState } from "react";
import { Link } from "react-router";
import AppreciateButton from "../../appreciation/components/AppreciateButton.jsx";
import { formatAppreciationCount } from "../../appreciation/utils/appreciationCount.js";
import SaveToConstellationButton from "../../constellation/components/SaveToConstellationButton.jsx";
import Icon from "../../../shared/components/Icon.jsx";
import { getVisibility } from "../utils/visibility.js";
import DeleteLoreDialog from "./DeleteLoreDialog.jsx";
import VisibilityBadge from "./VisibilityBadge.jsx";

const VISIBILITY_NOTES = {
  public: "Everyone can read this entry in the Lore Catalog.",
  private: "Only you can see this entry.",
  hidden: "This entry is public, but its project is private, so only you can see it for now.",
};

// The database only accepts appreciations and saves of lore that others can read
const CLOSED_REASONS = {
  private: "Appreciations and saves open once the entry is public.",
  hidden: "Appreciations and saves open once its project is public too.",
};

export default function LoreActions({ entry, isOwner, onDeleted, onAppreciationChange }) {
  // Kept here, not in the page, so an open dialog closes when another entry starts loading
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  // Others can only open entries that are public in a public project
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
