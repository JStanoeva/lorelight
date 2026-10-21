import { DEFAULT_PROFILE_TAB, PROFILE_TABS } from "../constants/profileTabs.js";

const FALLBACK_TAB = PROFILE_TABS.find((tab) => tab.value === DEFAULT_PROFILE_TAB);

// Whether a :collection route segment (or a ?tab= value) names one of the four tabs.
export function isProfileCollection(value) {
  return PROFILE_TABS.some((tab) => tab.value === value);
}

// The ?tab= value → its tab. A missing or unknown value shows the Projects tab.
export function getProfileTab(value) {
  return PROFILE_TABS.find((tab) => tab.value === value) ?? FALLBACK_TAB;
}
