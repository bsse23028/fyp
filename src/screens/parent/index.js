// PARENT AREA - Parent Mode: the four bottom-bar tabs (Home, Plan, Progress, Me = Settings).
//
// This file is the ONLY list of this area's screens. The navigator (app/navigation/AppNavigator.js) reads it
// through src/screens/index.js. A screen's `name` is what navigation.navigate('...') uses.
// ADD A SCREEN TO THIS AREA: create the file in this folder, import it below and add one line to SCREENS.

import ParentHomeScreen from './ParentHomeScreen';
import ParentPlanScreen from './ParentPlanScreen';
import ParentProgressScreen from './ParentProgressScreen';
import ParentSettingsScreen from './ParentSettingsScreen';

export const SCREENS = [
  { name: 'ParentHome', component: ParentHomeScreen },
  { name: 'ParentPlan', component: ParentPlanScreen },
  { name: 'ParentProgress', component: ParentProgressScreen },
  { name: 'ParentSettings', component: ParentSettingsScreen },
];
