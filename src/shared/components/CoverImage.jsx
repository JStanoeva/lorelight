import { useState } from "react";
import ImagePlaceholder from "./ImagePlaceholder.jsx";

// The parent sets the size and must be `relative overflow-hidden`.
export default function CoverImage({ src, seed, alt = "", placeholder }) {
  // Remembering which address failed gives a new address a fresh try, without an effect.
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return placeholder ?? <ImagePlaceholder seed={seed} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      // Image addresses can point to any site: don't tell it which Lorelight page is open.
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      className="absolute inset-0 size-full object-cover"
    />
  );
}
