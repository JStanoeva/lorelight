import { useRef } from "react";
import { useNavigate } from "react-router";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import NotFoundState from "../../../shared/components/NotFoundState.jsx";
import PageTitle from "../../../shared/components/PageTitle.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import ProfileForm from "../components/ProfileForm.jsx";
import { useOwnProfile } from "../hooks/useOwnProfile.js";
import { profileService } from "../services/profileService.js";
import { toProfileFormValues } from "../utils/profileValidation.js";
import "../styles/profile.css";
import "../styles/edit-profile.css";

// The same page as Edit Project and Edit Lore (a centred column, the title, one line naming what is
// edited, one card with the form), plus a live avatar preview at the top of the card. Only the
// logged-in user's own profile can be edited, so the address has no id.
export default function EditProfilePage() {
  const navigate = useNavigate();
  const { profile, isLoading, error, refetch } = useOwnProfile();
  const headingRef = useRef(null);

  async function handleSave(payload) {
    const updated = await profileService.updateProfile(profile.id, payload);

    // No row was updated (e.g. the session ended in another tab)
    if (!updated) {
      return "Your profile couldn't be saved. Reload the page and try again.";
    }

    navigate(`/profile/${profile.id}`);
  }

  // Try again disappears as soon as it's pressed, so focus moves to the page heading (h1), which stays
  function handleRetry() {
    refetch();
    headingRef.current.focus();
  }

  if (!isLoading && !error && !profile) {
    return (
      <section className="page">
        <NotFoundState title="Profile not found" text="This profile doesn't exist." />
      </section>
    );
  }

  let content;

  if (isLoading) {
    content = <Loader label="Loading your profile…" />;
  } else if (error) {
    content = <ErrorMessage message={getErrorMessage(error)} onRetry={handleRetry} />;
  } else {
    content = (
      <>
        <p className="mb-8 text-parchment-300 wrap-anywhere">
          Editing <span className="font-semibold text-parchment-100">@{profile.username}</span>
        </p>
        <ProfileForm
          key={profile.id}
          profileId={profile.id}
          initialValues={toProfileFormValues(profile)}
          cancelTo={`/profile/${profile.id}`}
          onSubmit={handleSave}
        />
      </>
    );
  }

  return (
    <section className="page">
      <PageTitle title="Edit Profile" />
      <div className="mx-auto max-w-2xl">
        {/* tabIndex -1: it can take focus from code (after Try again), but isn't a Tab stop */}
        <h1 ref={headingRef} tabIndex={-1} className="page-title">
          Edit Profile
        </h1>
        <div className="mt-2">{content}</div>
      </div>
    </section>
  );
}
