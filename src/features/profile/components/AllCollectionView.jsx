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

  // An invalid id or an unknown creator; tabIndex -1 because focus can land here after Try again
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
              {/* Keeps the heading order between the page's h1 and the cards' h3 titles */}
              <h2 className="sr-only">{tab.listHeading}</h2>
              <ProfileCollectionGrid collection={tab.value} items={items} isOwner={isOwner} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
