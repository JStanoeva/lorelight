import { Link, useSearchParams } from "react-router";
import Icon from "../../../shared/components/Icon.jsx";
import ConstellationBoard from "../../constellation/components/ConstellationBoard.jsx";
import { getCategoryFilter } from "../../lore/utils/catalogFilters.js";

// Read-only for everyone, the owner included: Remove lives on My Constellation
export default function ProfileConstellationBoard({ entries, profile, isOwner }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = getCategoryFilter(searchParams);

  // Every change is a new history entry; the same category again would only add a duplicate
  function handleCategoryChange(nextCategory) {
    if (nextCategory === category) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    if (nextCategory) {
      nextParams.set("category", nextCategory);
    } else {
      nextParams.delete("category");
    }
    setSearchParams(nextParams);
  }

  return (
    <div className="profile-board">
      {isOwner && (
        <div className="profile-board-actions site-column">
          <Link to="/constellation" className="btn btn-ghost">
            Manage on My Constellation
            <Icon name="chevronRight" size={14} />
          </Link>
        </div>
      )}

      <ConstellationBoard
        entries={entries}
        isLoading={false}
        error={null}
        isOwner={false}
        ownerId={profile.id}
        ownerName={profile.display_name}
        category={category}
        onCategoryChange={handleCategoryChange}
      />
    </div>
  );
}
