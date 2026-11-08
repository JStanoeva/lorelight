import { useState } from "react";
import NebulaAvatar from "./NebulaAvatar.jsx";
import "../styles/nebula-avatar.css";

// Fills its parent, which must be `position: relative; overflow: hidden`. Decorative (alt=""):
// the creator's name is written right beside it.
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
