import { useCallback, useEffect, useRef } from "react";

// Keeps keyboard focus on the page after Try again. The button disappears as soon as it's pressed
// (the loading view replaces the error, then the profile or the error again), and focus would fall
// back to the start of the document. Instead it moves to the heading of whatever the page shows
// now: give that heading `headingRef` and tabIndex={-1}.
//   isLoading  the data hook's isLoading      refetch  the data hook's refetch
// Returns { headingRef, retry }: pass `retry` to the Try again button.
export function useRetryFocus(isLoading, refetch) {
  const headingRef = useRef(null);
  const isRetryingRef = useRef(false);

  // Runs after each switch between loading and loaded (or failed). Only after a Try again, not
  // when the page is first opened.
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
