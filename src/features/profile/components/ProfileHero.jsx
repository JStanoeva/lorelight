import ProfileSky from "./ProfileSky.jsx";

export default function ProfileHero({ seed, isCompact = false, children }) {
  return (
    <div className={isCompact ? "profile-hero profile-hero-compact" : "profile-hero"}>
      <ProfileSky seed={seed} />
      <div className="profile-hero-inner site-column">{children}</div>
    </div>
  );
}
