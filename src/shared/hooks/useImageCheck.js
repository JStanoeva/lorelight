import { useEffect, useState } from "react";

// Whether an image link really shows a picture: "none" (no link), "checking", "loaded" or
// "failed". The browser loads the picture in the background (new Image()), as an <img> would,
// so a form can say before saving that a link doesn't work. Like the data hooks, "checking" is
// derived from the last result, so the effect never sets state synchronously.
export function useImageCheck(src) {
  const [result, setResult] = useState({ src: null, status: null });

  useEffect(() => {
    if (!src) {
      return;
    }

    let isStale = false;
    const image = new Image();
    // Image addresses can point to any site: don't tell it which Lorelight page is open
    image.referrerPolicy = "no-referrer";
    image.onload = () => {
      if (!isStale) setResult({ src, status: "loaded" });
    };
    image.onerror = () => {
      if (!isStale) setResult({ src, status: "failed" });
    };
    image.src = src;

    // A newer link (or leaving the page): ignore this picture's late answer
    return () => {
      isStale = true;
    };
  }, [src]);

  if (!src) {
    return "none";
  }

  return result.src === src ? result.status : "checking";
}
