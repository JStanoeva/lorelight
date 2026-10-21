import ProfileSky from "./ProfileSky.jsx";

// The top of every profile page: the creator's sky (seeded by `seed`, their id) across the whole
// window, with the page's header card (`children`) in the site column on top of it.
// `isCompact` gives the "All …" pages a little less room above the card.
export default function ProfileHero({ seed, isCompact = false, children }) {
  return (
    <div className={isCompact ? "profile-hero profile-hero-compact" : "profile-hero"}>
      <ProfileSky seed={seed} />
      <div className="profile-hero-inner site-column">{children}</div>
    </div>
  );
}
