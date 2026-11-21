// PERMISSIONS AREA - camera + microphone, asked ONCE right after the account is created.
//
// This file is the ONLY list of this area's screens. The navigator (app/navigation/AppNavigator.js) reads it
// through src/screens/index.js. A screen's `name` is what navigation.navigate('...') uses.
// ADD A SCREEN TO THIS AREA: create the file in this folder, import it below and add one line to SCREENS.

import PermissionsScreen from './PermissionsScreen';

export const SCREENS = [
  { name: 'Permissions', component: PermissionsScreen },
];
