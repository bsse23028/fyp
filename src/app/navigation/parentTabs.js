// PARENT TABS - the buttons of the bottom bar in Parent Mode (shared/components/ParentTabBar.js).
// The bar is shown ONLY on these four screens. Child Mode never has a bottom bar (on purpose).
//
//   screen = the screen name in AppNavigator.js
//   icon / iconOn = Ionicons names (outline when not chosen, filled when chosen)
// To add a tab: add a line here (4 or 5 tabs fit well on a phone).

export const PARENT_TABS = [
  { screen: 'ParentHome', label: 'Home', icon: 'home-outline', iconOn: 'home' },
  { screen: 'ParentPlan', label: 'Plan', icon: 'calendar-outline', iconOn: 'calendar' },
  { screen: 'ParentProgress', label: 'Progress', icon: 'stats-chart-outline', iconOn: 'stats-chart' },
  { screen: 'ParentSettings', label: 'Me', icon: 'person-outline', iconOn: 'person' },
];

export const PARENT_TAB_SCREENS = PARENT_TABS.map((tab) => tab.screen);

export function isParentTabScreen(routeName) {
  return PARENT_TAB_SCREENS.includes(routeName);
}
