// PROFILE AREA - one child's profile: the hub (Edit profile), one part of it, personalize stories.
//
// This file is the ONLY list of this area's screens. The navigator (app/navigation/AppNavigator.js) reads it
// through src/screens/index.js. A screen's `name` is what navigation.navigate('...') uses.
// ADD A SCREEN TO THIS AREA: create the file in this folder, import it below and add one line to SCREENS.

import EditProfileScreen from './EditProfileScreen';
import EditChildSectionScreen from './EditChildSectionScreen';
import PersonalizeStoriesScreen from './PersonalizeStoriesScreen';

export const SCREENS = [
  { name: 'EditProfile', component: EditProfileScreen },
  { name: 'EditChildSection', component: EditChildSectionScreen },
  { name: 'PersonalizeStories', component: PersonalizeStoriesScreen },
];
