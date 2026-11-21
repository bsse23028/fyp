// APP AREAS - every part of the app (outside the learning modules) and its screens, in one list.
//
// Each area is one folder in src/screens/ with an index.js that lists ITS OWN screens (SCREENS).
// The navigator (app/navigation/AppNavigator.js) registers APP_SCREENS; learning modules
// (src/modules/...) add their screens themselves (MODULE_SCREENS in src/modules/index.js).
//
//   onboarding   Splash, Welcome, the intro cards
//   auth         log in, sign up, codes, passwords
//   permissions  camera + microphone (once)
//   child        create a child, "Who is learning?", My Buddy
//   parent       the 4 bottom-bar tabs of Parent Mode
//   profile      one child's profile
//   account      the parent's own account
//   home         Child Mode home
//
// ADD A NEW AREA: make the folder with its own index.js (copy one), import it here and add it to AREAS.

import { SCREENS as onboarding } from './onboarding';
import { SCREENS as auth } from './auth';
import { SCREENS as permissions } from './permissions';
import { SCREENS as child } from './child';
import { SCREENS as parent } from './parent';
import { SCREENS as profile } from './profile';
import { SCREENS as account } from './account';
import { SCREENS as home } from './home';

export const AREAS = { onboarding, auth, permissions, child, parent, profile, account, home };

// every screen of every area, ready for the navigator
export const APP_SCREENS = Object.values(AREAS).flat();
