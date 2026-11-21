// ONBOARDING AREA - the first screens on a new phone: Splash -> Welcome -> the 3 intro cards (Onboarding).
//
// This file is the ONLY list of this area's screens. The navigator (app/navigation/AppNavigator.js) reads it
// through src/screens/index.js. A screen's `name` is what navigation.navigate('...') uses.
// ADD A SCREEN TO THIS AREA: create the file in this folder, import it below and add one line to SCREENS.

import SplashScreen from './SplashScreen';
import { WelcomeScreen } from './WelcomeScreen';
import OnboardingScreen from './OnboardingScreen';

export const SCREENS = [
  { name: 'Splash', component: SplashScreen },
  { name: 'Welcome', component: WelcomeScreen },
  { name: 'Onboarding', component: OnboardingScreen },
];
