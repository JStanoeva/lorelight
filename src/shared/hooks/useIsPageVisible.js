import { useEffect, useState } from "react";

function isDocumentVisible() {
  return document.visibilityState === "visible";
}

// False while the browser tab is hidden (another tab is in front, or the window is minimised),
// so an endless animation can stop instead of using the battery for nobody.
export function useIsPageVisible() {
  const [isPageVisible, setIsPageVisible] = useState(isDocumentVisible);

  useEffect(() => {
    function handleVisibilityChange() {
      setIsPageVisible(isDocumentVisible());
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return isPageVisible;
}
