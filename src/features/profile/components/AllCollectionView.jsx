import NotFoundState from "../../../shared/components/NotFoundState.jsx";
import PageTitle from "../../../shared/components/PageTitle.jsx";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useProfile } from "../hooks/useProfile.js";
import { useRetryFocus } from "../hooks/useRetryFocus.js";
import { getStarColor } from "../utils/getStarColor.js";
import { sortByNewest } from "../utils/profileStats.js";
import { getAllPageTitle } from "../utils/profileTabText.js";
import AllCollectionHeader from "./AllCollectionHeader.jsx";
import AllCollectionSkeleton from "./AllCollectionSkeleton.jsx";
import ProfileCollectionGrid from "./ProfileCollectionGrid.jsx";
import ProfileConstellationBoard from "./ProfileConstellationBoard.jsx";
import ProfileEmptyState from "./ProfileEmptyState.jsx";
import ProfileErrorState from "./ProfileErrorState.jsx";
import ProfileHero from "./ProfileHero.jsx";

// An "All …" page: every item of one of a creator's collections that the viewer may see, newest
// first, under a compact version of the profile's card. It loads with the same hook as the
// profile, so the counts always match the tab the visitor came from. Every item is shown at once
// (no paging yet). The Constellation is shown as its pin board, the others as a card grid.
// `tab` is one of PROFILE_TABS (ProfileCollectionPage has already checked the URL's collection).
export default function AllCollectionView({ userId, tab }) {
  const { user } = useAuth();
  const profileState = useProfile(userId);
  const { profile, isLoading, error, refetch } = profileState;
  const { headingRef, retry } = useRetryFocus(isLoading, refetch);

  if (isLoading) {
    return <AllCollectionSkeleton label={`Loading ${tab.nouns.other}…`} headingRef={headingRef} />;
  }

  if (error) {
    return <ProfileErrorState error={error} onRetry={retry} headingRef={headingRef} />;
  }

  // An invalid id or a creator who doesn't exist. tabIndex -1: focus can land here after Try again.
  if (!profile) {
    return (
      <section ref={headingRef} tabIndex={-1} className="page">
        <NotFoundState title="Creator not found" text="This creator doesn't exist, or the link is incomplete." />
      </section>
    );
  }

  // Compared with the loaded profile's id, not the URL's, which may be written in capitals
  const isOwner = user?.id === profile.id;
  const starColor = getStarColor(profile.star_color);
  const items = sortByNewest(profileState[tab.value], tab.dateField);
  const isBoard = tab.value === "constellation" && items.length > 0;

  return (
    <div className={isBoard ? "profile-page profile-page-board" : "profile-page"} style={{ "--star": starColor.hex }}>
      <PageTitle title={getAllPageTitle(tab, profile.display_name)} />
      <ProfileHero seed={profile.id} isCompact>
        <AllCollectionHeader
          profile={profile}
          starColor={starColor}
          tab={tab}
          total={items.length}
          isOwner={isOwner}
          showCount={!isBoard}
          headingRef={headingRef}
        />
      </ProfileHero>

      {isBoard ? (
        <ProfileConstellationBoard entries={items} profile={profile} isOwner={isOwner} />
      ) : (
        <div className="profile-all-body site-column">
          {items.length === 0 ? (
            <ProfileEmptyState tab={tab} isOwner={isOwner} name={profile.display_name} />
          ) : (
            <>
              {/* Between the page's h1 and the cards' titles, like the catalog's hidden "Lore entries" */}
              <h2 className="sr-only">{tab.listHeading}</h2>
              <ProfileCollectionGrid collection={tab.value} items={items} isOwner={isOwner} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
