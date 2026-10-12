import { createContext } from "react";

// The value is provided by AuthProvider. It stays null outside it, which useAuth reports.
export const AuthContext = createContext(null);
