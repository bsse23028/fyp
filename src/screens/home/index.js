// HOME AREA - Child Mode home: the buddy + the learning module tiles (each module opens its own hub).
//
// This file is the ONLY list of this area's screens. The navigator (app/navigation/AppNavigator.js) reads it
// through src/screens/index.js. A screen's `name` is what navigation.navigate('...') uses.
// ADD A SCREEN TO THIS AREA: create the file in this folder, import it below and add one line to SCREENS.

import ChildHomeScreen from './ChildHomeScreen';

export const SCREENS = [
  { name: 'ChildHome', component: ChildHomeScreen },
];
