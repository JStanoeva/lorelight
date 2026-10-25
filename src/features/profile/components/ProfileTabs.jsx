import { useRef } from "react";
import { PROFILE_TABS } from "../constants/profileTabs.js";

// The four tabs, following the WAI-ARIA tabs pattern with automatic activation: only the chosen tab
// is in the Tab order (roving tabindex); Left/Right move to the previous/next tab (wrapping),
// Home/End to the first/last, and moving also chooses the tab.
//   activeValue           the chosen tab's value
//   counts                { projects: 5, lore: 14, … }: the number shown on each tab
//   onSelect(value)       chooses a tab
//   getTabId / getPanelId link each tab to its panel (aria-controls / aria-labelledby)
export default function ProfileTabs({ activeValue, counts, onSelect, getTabId, getPanelId }) {
  const tabRefs = useRef([]);

  function handleKeyDown(event, index) {
    // Leave browser shortcuts such as Alt+← (Back) alone
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const lastIndex = PROFILE_TABS.length - 1;
    let nextIndex = null;

    if (event.key === "ArrowRight") nextIndex = index === lastIndex ? 0 : index + 1;
    if (event.key === "ArrowLeft") nextIndex = index === 0 ? lastIndex : index - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = lastIndex;

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    tabRefs.current[nextIndex]?.focus();
    onSelect(PROFILE_TABS[nextIndex].value);
  }

  return (
    <div role="tablist" aria-label="Creator's collections" className="profile-tablist">
      {PROFILE_TABS.map((tab, index) => {
        const isActive = tab.value === activeValue;

        return (
          <button
            key={tab.value}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={getTabId(tab.value)}
            aria-selected={isActive}
            aria-controls={getPanelId(tab.value)}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(tab.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className="profile-tab"
          >
            <span className="profile-tab-label">{tab.label}</span>
            <span className="profile-tab-count">{counts[tab.value].toLocaleString("en-US")}</span>
          </button>
        );
      })}
    </div>
  );
}
