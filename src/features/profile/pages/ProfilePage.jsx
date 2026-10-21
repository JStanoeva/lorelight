import { useParams } from "react-router";
import NotFoundState from "../../../shared/components/NotFoundState.jsx";
import { useAuth } from "../../auth/hooks/useAuth.js";
import ProfileCollections from "../components/ProfileCollections.jsx";
import ProfileErrorState from "../components/ProfileErrorState.jsx";
import ProfileHeader from "../components/ProfileHeader.jsx";
import ProfileHero from "../components/ProfileHero.jsx";
import ProfileSkeleton from "../components/ProfileSkeleton.jsx";
import { useProfile } from "../hooks/useProfile.js";
import { useRetryFocus } from "../hooks/useRetryFocus.js";
import { getStarColor } from "../utils/getStarColor.js";
import { getCreatorTitle, getProfileStats, getSpotlightProject } from "../utils/profileStats.js";
import "../styles/profile.css";

// A Creator Profile (/profile/:userId): the header card under the creator's own sky, then four
// tabs with the three most recent items each. useProfile loads the profile and all four lists at
// once; everything else (the figures, the creator title, the world they're building now) is
// worked out here from those lists. Row Level Security decides what the lists hold: the owner gets
// everything, visitors only public items.
export default function ProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const { profile, projects, lore, constellation, appreciated, isLoading, error, refetch } = useProfile(userId);
  const { headingRef, retry } = useRetryFocus(isLoading, refetch);

  if (isLoading) {
    // Known before the profile arrives (ids are lowercase in the database, the URL may not be), so
    // the skeleton can keep room for the owner's Edit profile button and note
    const isOwnProfile = Boolean(user) && user.id === userId.toLowerCase();
    return <ProfileSkeleton isOwnProfile={isOwnProfile} headingRef={headingRef} />;
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
  const collections = { projects, lore, constellation, appreciated };

  return (
    <div className="profile-page" style={{ "--star": starColor.hex }}>
      <ProfileHero seed={profile.id}>
        <ProfileHeader
          profile={profile}
          starColor={starColor}
          stats={getProfileStats(collections)}
          creatorTitle={getCreatorTitle(lore)}
          spotlight={getSpotlightProject(projects)}
          isOwner={isOwner}
          headingRef={headingRef}
        />
      </ProfileHero>

      <ProfileCollections collections={collections} profile={profile} isOwner={isOwner} />
    </div>
  );
}
