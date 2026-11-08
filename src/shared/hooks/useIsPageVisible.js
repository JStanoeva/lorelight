import { useEffect, useState } from "react";

function isDocumentVisible() {
  return document.visibilityState === "visible";
}

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
