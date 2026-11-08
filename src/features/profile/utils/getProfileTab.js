import { DEFAULT_PROFILE_TAB, PROFILE_TABS } from "../constants/profileTabs.js";

const FALLBACK_TAB = PROFILE_TABS.find((tab) => tab.value === DEFAULT_PROFILE_TAB);

export function isProfileCollection(value) {
  return PROFILE_TABS.some((tab) => tab.value === value);
}

export function getProfileTab(value) {
  return PROFILE_TABS.find((tab) => tab.value === value) ?? FALLBACK_TAB;
}
