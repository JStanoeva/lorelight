import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../features/auth/hooks/useAuth.js";
import { getErrorMessage } from "../../shared/utils/getErrorMessage.js";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

export default function MainLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [logoutError, setLogoutError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isHome = pathname === "/";

  // Logout lives here, not in Header: going to Home gives Header a new key, so state set in
  // the old Header after the await would be lost.
  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setLogoutError("");

    // Home first, then clear the session, or AuthGuard would send the guest to /login.
    if (!isHome) {
      navigate("/");
    }

    try {
      await logout();
    } catch (error) {
      setLogoutError(`Couldn't log out. ${getErrorMessage(error)}`);
    } finally {
      setIsLoggingOut(false);
    }
  }

  function handleDismissLogoutError() {
    setLogoutError("");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* A new key on entering or leaving Home resets the scroll-spy and closes the menu */}
      <Header
        key={isHome ? "home" : "app"}
        isHome={isHome}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
      />

      {/* Fixed, so it never moves the page. The solid outer box sits under alert-error's tint. */}
      {logoutError && (
        <div className="fixed inset-x-4 top-(--header-height) z-30 mx-auto mt-3 max-w-xl rounded-lg bg-night-900 shadow-lg shadow-black/40">
          <div
            role="alert"
            className="alert-error flex flex-col items-start gap-3 text-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{logoutError}</p>
            <button
              type="button"
              onClick={handleDismissLogoutError}
              className="btn btn-ghost shrink-0"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* A column, so a page can stretch to fill the space above the footer */}
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
