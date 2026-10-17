import { useState } from "react";
import ImagePlaceholder from "./ImagePlaceholder.jsx";

// Shows the image, or a generated placeholder when there is no image or it fails to load.
// The placeholder is the project sigil (from `seed`), unless a `placeholder` element is passed
// (lore passes its own emblem print). The parent sets the size and must be `relative overflow-hidden`.
export default function CoverImage({ src, seed, alt = "", placeholder }) {
  // Remembering WHICH address failed means a new address gets a fresh try, without an effect.
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
