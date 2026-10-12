import { Navigate, Outlet, useLocation } from "react-router";
import Loader from "../../../shared/components/Loader.jsx";
import { useAuth } from "../hooks/useAuth.js";

const DEFAULT_TARGET = "/lore";

// location.state can hold anything (any link can set it, and it survives a page reload),
// so the remembered page is used only when it's a path inside this app. Browsers read
// "//site.com" and "/\site.com" (also with tabs or line breaks mixed in) as another site,
// and React Router throws instead of navigating there.
function getRedirectTarget(from) {
  const pathname = from?.pathname;

  const isAppPath =
    typeof pathname === "string" &&
    pathname.startsWith("/") &&
    !pathname.startsWith("//") &&
    !pathname.includes("\\") &&
    !/\s/.test(pathname);

  if (!isAppPath || pathname === "/login" || pathname === "/register") {
    return DEFAULT_TARGET;
  }

  const search = typeof from.search === "string" && from.search.startsWith("?") ? from.search : "";
  const hash = typeof from.hash === "string" && from.hash.startsWith("#") ? from.hash : "";

  return `${pathname}${search}${hash}`;
}

// Layout route for /login and /register: logged-in users go to the page they wanted, or the catalog.
export default function GuestGuard() {
  const { user, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return <Loader />;
  }

  if (user) {
    return <Navigate to={getRedirectTarget(location.state?.from)} replace />;
  }

  return <Outlet />;
}
