import { Link } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth.js";
import CatalogNotice from "./CatalogNotice.jsx";

// After sign-up, GuestGuard sends the new user straight to project creation (as on Home).
const CREATE_AFTER_SIGN_UP = { from: { pathname: "/projects/create" } };

// The catalog has no public lore at all (not just none that matches the filters): an invitation
// to write the first entry. Writing needs an account, so the buttons depend on who is looking:
// users go straight to writing, guests can register or log in. While the session is still being
// read there are no buttons, so nobody sees the wrong pair flash.
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
