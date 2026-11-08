import { useCallback, useEffect, useRef } from "react";

// Try again disappears once pressed, so focus would fall back to the document's start. Instead it
// moves to the heading the page shows now: give that heading `headingRef` and tabIndex={-1}.
export function useRetryFocus(isLoading, refetch) {
  const headingRef = useRef(null);
  const isRetryingRef = useRef(false);

  // After a Try again only: focuses the heading when loading starts and again when it ends
  useEffect(() => {
    if (!isRetryingRef.current) {
      return;
    }

    headingRef.current?.focus();

    if (!isLoading) {
      isRetryingRef.current = false;
    }
  }, [isLoading]);

  const retry = useCallback(() => {
    isRetryingRef.current = true;
    refetch();
  }, [refetch]);

  return { headingRef, retry };
}
