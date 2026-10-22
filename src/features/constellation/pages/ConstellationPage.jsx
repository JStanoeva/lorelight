import { useSearchParams } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { getCategoryFilter } from "../../lore/utils/catalogFilters.js";
import ConstellationBoard from "../components/ConstellationBoard.jsx";
import ConstellationHero from "../components/ConstellationHero.jsx";
import { useConstellation } from "../hooks/useConstellation.js";
import { constellationService } from "../services/constellationService.js";

// My Constellation: the logged-in user's saved lore as a pin board (AuthGuard lets only users in).
// The chosen category lives in the URL (/constellation?category=location), like the catalog's
// filters, so it survives a refresh and Back/Forward step through the categories.
export default function ConstellationPage() {
  const { user } = useAuth();
  const { entries, isLoading, error, refetch, removeEntry } = useConstellation(user.id);
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

  // The card's Remove button waits for this Promise (its pending state). Once the database has
  // confirmed the removal, the card calls onRemoved (removeEntry) inside its own transition, so
  // the entry leaves the list in the same moment the card's pending state ends.
  function handleRemove(loreId) {
    return constellationService.unsaveLore(loreId, user.id);
  }

  return (
    <div className="constellation-page">
      <div className="constellation-sky" aria-hidden="true" />
      <ConstellationHero />
      <ConstellationBoard
        entries={entries}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        isOwner
        ownerId={user.id}
        category={category}
        onCategoryChange={handleCategoryChange}
        onRemove={handleRemove}
        onRemoved={removeEntry}
      />
    </div>
  );
}
