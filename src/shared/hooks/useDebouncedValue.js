import { useEffect, useState } from "react";

// `value`, but only once it has stopped changing for `delay` milliseconds. Edit Profile uses it
// to check an avatar link when the typing pauses, instead of loading a picture on every keystroke.
export function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Every change starts a new timer, and the cleanup cancels the previous one
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
