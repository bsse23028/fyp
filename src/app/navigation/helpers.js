// NAVIGATION HELPERS - small shortcuts used by several screens.

// Go to the Log In screen and clear the screens that were above it,
// so pressing "back" afterwards cannot return to a half-finished flow.
// (Welcome stays underneath, so Android's back button still makes sense.)
export function goToLogIn(navigation) {
  navigation.reset({
    index: 1,
    routes: [{ name: 'Welcome' }, { name: 'LogIn' }],
  });
}

// Go to a screen as the new "first" screen (used after login / sign-up,
// and by the 🏠 Home buttons).
export function goToStart(navigation, screenName) {
  navigation.reset({ index: 0, routes: [{ name: screenName }] });
}

// "Who is learning?" as the first screen (the parent pressed Open Child Mode).
// Parent Mode home.
export function goToProfilePicker(navigation) {
  goToStart(navigation, 'ProfilePicker');
}

export function goToParentHome(navigation) {
  goToStart(navigation, 'ParentHome');
}

// Child Home as the ONLY screen of the stack. There is nothing underneath it,
// so a child can never "go back" into "Who is learning?" or Parent Mode.
// The only way out of Child Mode is the 🔒 Parent button + the Parent PIN.
export function goToChildHome(navigation) {
  goToStart(navigation, 'ChildHome');
}

// Where should a logged-in parent start?
//   has a child profile            -> Parent Home (always Parent Mode first)
//   no child, permissions asked    -> Create Child Profile
//   no child, permissions not yet  -> Permissions (asked once per phone)
export function getParentStartScreen(childProfiles, permissions) {
  if (childProfiles.length > 0) return 'ParentHome';
  return permissions.asked ? 'CreateChildProfile' : 'Permissions';
}

// Parent Progress for one child (opened from a child card on Parent Home).
export function goToProgress(navigation, childId) {
  navigation.navigate('ParentProgress', { childId });
}
