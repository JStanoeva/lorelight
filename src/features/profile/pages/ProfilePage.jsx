import { useParams } from "react-router";
import NotFoundState from "../../../shared/components/NotFoundState.jsx";
import PageTitle from "../../../shared/components/PageTitle.jsx";
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

export default function ProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const { profile, projects, lore, constellation, appreciated, isLoading, error, refetch } = useProfile(userId);
  const { headingRef, retry } = useRetryFocus(isLoading, refetch);

  if (isLoading) {
    // From the URL, since the profile hasn't arrived yet (ids are lowercase in the database)
    const isOwnProfile = Boolean(user) && user.id === userId.toLowerCase();
    return <ProfileSkeleton isOwnProfile={isOwnProfile} headingRef={headingRef} />;
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
  const collections = { projects, lore, constellation, appreciated };

  return (
    <div className="profile-page" style={{ "--star": starColor.hex }}>
      <PageTitle title={profile.display_name} />
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
