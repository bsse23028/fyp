// HOME AREA - Child Mode home: the buddy + the 6 learning group tiles (learningGroups.js), and the page of a
// group (LearningGroup) that lists its modules from the FYP proposal ("Coming soon" when not built).
//
// This file is the ONLY list of this area's screens. The navigator (app/navigation/AppNavigator.js) reads it
// through src/screens/index.js. A screen's `name` is what navigation.navigate('...') uses.
// ADD A SCREEN TO THIS AREA: create the file in this folder, import it below and add one line to SCREENS.

import ChildHomeScreen from './ChildHomeScreen';
import LearningGroupScreen from './LearningGroupScreen';

export const SCREENS = [
  { name: 'ChildHome', component: ChildHomeScreen },
  { name: 'LearningGroup', component: LearningGroupScreen, options: { animation: 'fade' } },
];
