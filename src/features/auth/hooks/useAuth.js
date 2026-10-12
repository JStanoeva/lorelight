import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.js";

// Returns { user, isAuthLoading, login, register, logout }.
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
