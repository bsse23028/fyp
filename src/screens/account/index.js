// ACCOUNT AREA - the parent's own account: My account (name), change password, update PIN.
//
// This file is the ONLY list of this area's screens. The navigator (app/navigation/AppNavigator.js) reads it
// through src/screens/index.js. A screen's `name` is what navigation.navigate('...') uses.
// ADD A SCREEN TO THIS AREA: create the file in this folder, import it below and add one line to SCREENS.

import ParentProfileScreen from './ParentProfileScreen';
import ChangePasswordScreen from './ChangePasswordScreen';
import UpdatePinScreen from './UpdatePinScreen';

export const SCREENS = [
  { name: 'ParentProfile', component: ParentProfileScreen },
  { name: 'ChangePassword', component: ChangePasswordScreen },
  { name: 'UpdatePin', component: UpdatePinScreen },
];
