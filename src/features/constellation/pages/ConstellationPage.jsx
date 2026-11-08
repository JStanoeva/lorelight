import { useSearchParams } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { getCategoryFilter } from "../../lore/utils/catalogFilters.js";
import PageTitle from "../../../shared/components/PageTitle.jsx";
import ConstellationBoard from "../components/ConstellationBoard.jsx";
import ConstellationHero from "../components/ConstellationHero.jsx";
import { useConstellation } from "../hooks/useConstellation.js";
import { constellationService } from "../services/constellationService.js";

// AuthGuard lets only logged-in users in, so `user` is always set here
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

  function handleRemove(loreId) {
    return constellationService.unsaveLore(loreId, user.id);
  }

  return (
    <div className="constellation-page">
      <PageTitle title="My Constellation" />
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
