import { useId } from "react";
import { useSearchParams } from "react-router";
import Icon from "../../../shared/components/Icon.jsx";
import { PROFILE_TABS } from "../constants/profileTabs.js";
import { getProfileTab } from "../utils/getProfileTab.js";
import ProfileTabPanel from "./ProfileTabPanel.jsx";
import ProfileTabs from "./ProfileTabs.jsx";

// Switching tabs replaces the history entry, so Back still leaves the profile
export default function ProfileCollections({ collections, profile, isOwner }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = getProfileTab(searchParams.get("tab"));
  const idBase = useId();

  const getTabId = (value) => `${idBase}-tab-${value}`;
  const getPanelId = (value) => `${idBase}-panel-${value}`;
  const counts = Object.fromEntries(PROFILE_TABS.map((tab) => [tab.value, collections[tab.value].length]));

  function handleSelect(value) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", value);
    setSearchParams(nextParams, { replace: true });
  }

  return (
    <div className="profile-collections site-column">
      <div className="profile-tabs-bar">
        <ProfileTabs
          activeValue={activeTab.value}
          counts={counts}
          onSelect={handleSelect}
          getTabId={getTabId}
          getPanelId={getPanelId}
        />
        {isOwner && (
          <p className="profile-owner-note">
            <Icon name="eye" size={16} className="profile-owner-note-icon" />
            {activeTab.ownerNote}
          </p>
        )}
      </div>

      {PROFILE_TABS.map((tab) => (
        <ProfileTabPanel
          key={tab.value}
          id={getPanelId(tab.value)}
          labelledBy={getTabId(tab.value)}
          isHidden={tab.value !== activeTab.value}
          tab={tab}
          items={collections[tab.value]}
          profile={profile}
          isOwner={isOwner}
        />
      ))}
    </div>
  );
}
