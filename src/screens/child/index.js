// CHILD AREA - child profiles: create one, "Who is learning?" (start Child Mode), change the buddy (My Buddy).
//
// This file is the ONLY list of this area's screens. The navigator (app/navigation/AppNavigator.js) reads it
// through src/screens/index.js. A screen's `name` is what navigation.navigate('...') uses.
// ADD A SCREEN TO THIS AREA: create the file in this folder, import it below and add one line to SCREENS.

import CreateChildProfileScreen from './CreateChildProfileScreen';
import ProfilePickerScreen from './ProfilePickerScreen';
import EditAvatarScreen from './EditAvatarScreen';

export const SCREENS = [
  { name: 'CreateChildProfile', component: CreateChildProfileScreen },
  { name: 'ProfilePicker', component: ProfilePickerScreen },
  { name: 'EditAvatar', component: EditAvatarScreen },
];
