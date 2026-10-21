import { useState } from "react";
import NebulaAvatar from "./NebulaAvatar.jsx";
import "../styles/nebula-avatar.css";

// The profile's picture: the avatar_url image, or the generated Nebula Wash when there is no link
// or the image fails to load. Like CoverImage, it fills its parent, which sets the size and the
// frame shape and must be `position: relative; overflow: hidden`. Always decorative (alt=""):
// the creator's name is written right beside it.
//   src       profile.avatar_url (may be null)
//   seed      profile.id, so the same creator always gets the same nebula
//   colorHex  starColor.hex
export default function ProfileAvatarImage({ src, seed, colorHex }) {
  // Remembering WHICH address failed means a new address gets a fresh try, without an effect
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return <NebulaAvatar seed={seed} colorHex={colorHex} />;
  }

  return (
    <img
      src={src}
      alt=""
      decoding="async"
      // Image addresses can point to any site: don't tell it which Lorelight page is open
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      className="profile-avatar-image"
    />
  );
}
