// APP NAVIGATOR - registers every screen of the app. It does NOT list screens itself:
//   - each app AREA lists its own screens in src/screens/<area>/index.js (collected in src/screens/index.js)
//   - each learning MODULE lists its own screens in src/modules/<module>/index.js (src/modules/index.js)
// ADD A NEW SCREEN: add it to its area's (or module's) index.js. Nothing here has to change.
// Then open it with:  navigation.navigate('ScreenName')
//
// WHERE THE APP STARTS (decided once, when the app opens):
//   logged in + has a child profile   -> Parent Home (the app ALWAYS opens in Parent Mode;
//                                        the parent taps "Open Child Mode" to hand it to a child)
//   logged in, no child profile yet   -> Create Child Profile (or Permissions)
//   logged out, intro seen before     -> Welcome
//   logged out, first time on phone   -> Splash

import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import FixedHeader from '../../shared/components/FixedHeader';
import ParentTabBar from '../../shared/components/ParentTabBar';
import LoadError from '../../shared/components/LoadError';
import { DEMO_MODE } from '../../shared/config';
import { useDirection } from '../../shared/utils/direction';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useChild } from '../store/useChild';
import { useDevice } from '../context/DeviceContext';
import { getParentStartScreen } from './helpers';
import { MODULE_SCREENS } from '../../modules';
import { COLORS } from '../../shared/theme/theme';
import { screenColorsFor } from '../../shared/theme/screenColors';

import { APP_SCREENS } from '../../screens';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading: authLoading, startupError, retryRestoreSession } = useAuth();
  const {
    childProfiles,
    loading: childLoading,
    error: childError,
    optionsStatus,
    optionsError,
    loadChildren,
    loadOptions,
  } = useChild();
  const { introSeen, permissions, loading: deviceLoading } = useDevice();
  const { isRTL, directionStyle } = useDirection();

  // The choice lists: wait for them. If they failed, DEMO_MODE carries on with the
  // built-in lists (see useChildOptions.js); otherwise the app shows Retry.
  const optionsLoading = optionsStatus === 'idle' || optionsStatus === 'loading';
  const optionsProblem = optionsStatus === 'failed' && !DEMO_MODE ? optionsError : null;

  // The server could not be reached while the app was opening: say so, with a Retry button.
  // (childError only counts while the FIRST list is still missing; later problems are shown
  // by the screen that asked, e.g. Log In.)
  const problem = startupError || (childLoading && childError) || optionsProblem;
  if (problem) {
    const handleRetry = () => {
      if (startupError) {
        retryRestoreSession(); // the children are loaded after it, by ChildLoader
        return;
      }
      if (optionsProblem) loadOptions();
      if (childLoading && childError) loadChildren().catch(() => {}); // a new error shows here again
    };
    return <LoadError message={problem} onRetry={handleRetry} />;
  }

  // Wait until everything saved on the phone (and the first answers of the server) has arrived.
  if (authLoading || childLoading || deviceLoading || optionsLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  let startScreen;
  if (user) startScreen = getParentStartScreen(childProfiles, permissions);
  else startScreen = introSeen ? 'Welcome' : 'Splash';

  // The header sits ABOVE the navigator: it never slides or changes. Only the screens below it move.
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
    <FixedHeader />
    <Stack.Navigator
      initialRouteName={startScreen}
      screenOptions={({ route }) => ({
        headerShown: false, // every screen draws its own header (see Screen.js)
        animation: isRTL ? 'slide_from_left' : 'slide_from_right', // follows the reading direction
        contentStyle: { backgroundColor: screenColorsFor(route.name).page, ...directionStyle },
        // Keep the phone's status bar (time, battery ...) visible on every screen:
        // dark icons on a bar of the same colour as the top bar (theme/screenColors.js).
        statusBarStyle: 'dark',
        statusBarBackgroundColor: screenColorsFor(route.name).header,
        statusBarTranslucent: false,
        statusBarHidden: false,
      })}
    >
      {/* APP AREAS (onboarding, auth, permissions, child, parent, profile, account, home): src/screens/index.js */}
      {APP_SCREENS.map((screen) => (
        <Stack.Screen key={screen.name} name={screen.name} component={screen.component} options={screen.options} />
      ))}

      {/* LEARNING MODULES (English, later Numbers, Feelings ...).
          Their screens are listed by each module, see src/modules/index.js */}
      {MODULE_SCREENS.map((screen) => (
        <Stack.Screen key={screen.name} name={screen.name} component={screen.component} options={screen.options} />
      ))}
    </Stack.Navigator>
    {/* Parent Mode's bottom bar (only on Home / Plan / Progress / Me, see parentTabs.js) */}
    <ParentTabBar />
    </View>
  );
}
