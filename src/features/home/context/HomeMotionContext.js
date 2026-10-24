import { createContext } from "react";

// The value is provided by HomeMotionProvider. It stays null outside it, which useHomeMotion
// reports.
export const HomeMotionContext = createContext(null);
