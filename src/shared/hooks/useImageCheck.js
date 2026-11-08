import { useEffect, useState } from "react";

// "none", "checking", "loaded" or "failed". "checking" is derived from the last result, so the
// effect never sets state synchronously.
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

    // After a newer link (or leaving the page), this picture's late answer is ignored
    return () => {
      isStale = true;
    };
  }, [src]);

  if (!src) {
    return "none";
  }

  return result.src === src ? result.status : "checking";
}
