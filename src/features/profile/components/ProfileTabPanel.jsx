import { Link } from "react-router";
import { RECENT_COUNT } from "../constants/profileTabs.js";
import { getAllLinkLabel, getCollectionPath } from "../utils/profileTabText.js";
import { getRecent } from "../utils/profileStats.js";
import ProfileCollectionGrid from "./ProfileCollectionGrid.jsx";
import ProfileEmptyState from "./ProfileEmptyState.jsx";

// One tab's panel: a small heading, an "All …" link when there are more than three items, and the
// three most recent items as cards. Every panel is rendered (the others `hidden`), so each tab's
// aria-controls points at a real element. tabIndex 0, as the tabs pattern asks when a panel may
// not start with anything focusable (e.g. a visitor's empty tab).
//   tab    one of PROFILE_TABS        items  every item of that collection the viewer may see
export default function ProfileTabPanel({ id, labelledBy, isHidden, tab, items, profile, isOwner }) {
  const total = items.length;
  const hasMore = total > RECENT_COUNT;

  return (
    <div role="tabpanel" id={id} aria-labelledby={labelledBy} hidden={isHidden} tabIndex={0} className="profile-panel">
      {total === 0 ? (
        <ProfileEmptyState tab={tab} isOwner={isOwner} name={profile.display_name} />
      ) : (
        <>
          <div className="profile-panel-head">
            <h2 className="profile-panel-title">
              {tab.panelTitle}
              {hasMore && (
                <span className="profile-panel-count">
                  {" "}
                  · {RECENT_COUNT} of {total.toLocaleString("en-US")}
                </span>
              )}
            </h2>

            {hasMore && (
              <Link to={getCollectionPath(profile.id, tab.value)} className="profile-all-link">
                {getAllLinkLabel(tab, total)}
                <span className="profile-all-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            )}
          </div>

          <ProfileCollectionGrid
            collection={tab.value}
            items={getRecent(items, tab.dateField)}
            isOwner={isOwner}
          />
        </>
      )}
    </div>
  );
}
