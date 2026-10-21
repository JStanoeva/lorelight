import { Link } from "react-router";
import EmptyState from "../../../shared/components/EmptyState.jsx";
import { getEmptyState } from "../utils/profileTabText.js";

// A tab (or "All …" page) with nothing in it. The owner gets a next step; a visitor one calm
// sentence and no button. `tab` is one of PROFILE_TABS.
export default function ProfileEmptyState({ tab, isOwner, name }) {
  const { title, text, action } = getEmptyState(tab, isOwner, name);

  return (
    <div className="profile-empty">
      <EmptyState title={title} text={text}>
        {action && (
          <Link to={action.to} className="btn btn-primary">
            {action.label}
          </Link>
        )}
      </EmptyState>
    </div>
  );
}
