import { Link } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import CatalogNotice from "./CatalogNotice.jsx";

// After sign-up, GuestGuard sends the new user straight to project creation.
const CREATE_AFTER_SIGN_UP = { from: { pathname: "/projects/create" } };

// No buttons while the session is still being read, so the wrong pair never flashes.
export default function EmptyCatalogNotice() {
  const { user, isAuthLoading } = useAuth();

  let actions = null;

  if (!isAuthLoading && user) {
    actions = (
      <>
        <Link to="/lore/create" className="btn btn-primary">
          Create Lore
        </Link>
        <Link to="/projects/create" className="btn btn-ghost">
          Start a project
        </Link>
      </>
    );
  } else if (!isAuthLoading) {
    actions = (
      <>
        <Link to="/register" state={CREATE_AFTER_SIGN_UP} className="btn btn-primary">
          Register to start writing
        </Link>
        <Link to="/login" className="btn btn-ghost">
          Log in
        </Link>
      </>
    );
  }

  return (
    <CatalogNotice
      title="No lore has been published yet"
      text="When a writer makes an entry and its project public, it appears here for everyone to read. Yours could be the first star on the map."
    >
      {actions}
    </CatalogNotice>
  );
}
