import { useEffect, useState } from "react";
import { authService } from "../services/authService.js";
import { AuthContext } from "./AuthContext.js";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // The first event delivers the stored session (or null). The callback only sets state:
    // awaiting other Supabase calls in it can block the client.
    const unsubscribe = authService.onAuthChange((session) => {
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    isAuthLoading,
    login: authService.signIn,
    register: authService.signUp,
    logout: authService.signOut,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}
