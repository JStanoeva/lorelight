import { useNavigate } from "react-router";
import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import NotFoundState from "../../../shared/components/NotFoundState.jsx";
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

  async function handleSave(payload) {
    const updated = await profileService.updateProfile(profile.id, payload);

    // No row was updated (e.g. the session ended in another tab)
    if (!updated) {
      return "Your profile couldn't be saved. Reload the page and try again.";
    }

    navigate(`/profile/${profile.id}`);
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
    content = <ErrorMessage message={getErrorMessage(error)} onRetry={refetch} />;
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
      <div className="mx-auto max-w-2xl">
        <h1 className="page-title">Edit Profile</h1>
        <div className="mt-2">{content}</div>
      </div>
    </section>
  );
}
