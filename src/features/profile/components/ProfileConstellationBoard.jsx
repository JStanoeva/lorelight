import { Link, useSearchParams } from "react-router";
import Icon from "../../../shared/components/Icon.jsx";
import ConstellationBoard from "../../constellation/components/ConstellationBoard.jsx";
import { getCategoryFilter } from "../../lore/utils/catalogFilters.js";

// A creator's whole Constellation on their "All saved" page: the same pin board as My Constellation,
// read-only for everyone (Remove lives on My Constellation, which the owner gets a link to). The
// chosen category lives in the URL (?category=location), as on My Constellation.
//   entries  the saves, newest first     profile  whose Constellation it is
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
