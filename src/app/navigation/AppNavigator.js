// APP NAVIGATOR - the list of every screen in the app.
//
// ADD A NEW SCREEN IN 2 STEPS:
//   1. create the file in src/screens/...
//   2. import it here and add a <Stack.Screen name="..." component={...} />
// Then open it from any screen with:  navigation.navigate('ScreenName')
//
// SCREENS OF A LEARNING MODULE (English, Numbers ...) are NOT listed here. Each module lists
// its own screens in src/modules/<module>/index.js and they are added below automatically.
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

import SplashScreen from '../../screens/onboarding/SplashScreen';
import { WelcomeScreen, WelcomeAltScreen } from '../../screens/onboarding/WelcomeScreen';
import OnboardingScreen from '../../screens/onboarding/OnboardingScreen';
import LoginScreen from '../../screens/auth/LoginScreen';
import SignUpScreen from '../../screens/auth/SignUpScreen';
import EmailVerificationScreen from '../../screens/auth/EmailVerificationScreen';
import ForgotPasswordScreen from '../../screens/auth/ForgotPasswordScreen';
import PasswordOtpScreen from '../../screens/auth/PasswordOtpScreen';
import ResetPasswordScreen from '../../screens/auth/ResetPasswordScreen';
import PermissionsScreen from '../../screens/permissions/PermissionsScreen';
import CreateChildProfileScreen from '../../screens/child/CreateChildProfileScreen';
import ChildHomeScreen from '../../screens/home/ChildHomeScreen';
import EditProfileScreen from '../../screens/profile/EditProfileScreen';
import EditChildSectionScreen from '../../screens/profile/EditChildSectionScreen';
import PersonalizeStoriesScreen from '../../screens/profile/PersonalizeStoriesScreen';
import ParentProfileScreen from '../../screens/account/ParentProfileScreen';
import ChangePasswordScreen from '../../screens/account/ChangePasswordScreen';
import UpdatePinScreen from '../../screens/account/UpdatePinScreen';
import ParentHomeScreen from '../../screens/parent/ParentHomeScreen';
import ParentPlanScreen from '../../screens/parent/ParentPlanScreen';
import ParentProgressScreen from '../../screens/parent/ParentProgressScreen';
import ParentSettingsScreen from '../../screens/parent/ParentSettingsScreen';
import ProfilePickerScreen from '../../screens/child/ProfilePickerScreen';
import EditAvatarScreen from '../../screens/child/EditAvatarScreen';

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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  let startScreen;
  if (user) startScreen = getParentStartScreen(childProfiles, permissions);
  else startScreen = introSeen ? 'Welcome' : 'Splash';

  // The header sits ABOVE the navigator: it never slides or changes. Only the screens below it move.
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
    <FixedHeader />
    <Stack.Navigator
      initialRouteName={startScreen}
      screenOptions={{
        headerShown: false, // every screen draws its own header (see Screen.js)
        animation: isRTL ? 'slide_from_left' : 'slide_from_right', // follows the reading direction
        contentStyle: { backgroundColor: COLORS.white, ...directionStyle },
        // Keep the phone's status bar (time, battery ...) visible on every screen:
        // dark icons on a white bar.
        statusBarStyle: 'dark',
        statusBarBackgroundColor: COLORS.white,
        statusBarTranslucent: false,
        statusBarHidden: false,
      }}
    >
      {/* Welcome flow */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="WelcomeAlt" component={WelcomeAltScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />

      {/* Log in / sign up / forgot password */}
      <Stack.Screen name="LogIn" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="PasswordOtp" component={PasswordOtpScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

      {/* After the account is created: permissions (once), then the child profile */}
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen name="CreateChildProfile" component={CreateChildProfileScreen} />

      {/* PARENT MODE (everything is reached from Parent Home; 🏠 in the header returns) */}
      <Stack.Screen name="ParentHome" component={ParentHomeScreen} />
      <Stack.Screen name="ParentPlan" component={ParentPlanScreen} />
      <Stack.Screen name="ParentProgress" component={ParentProgressScreen} />
      <Stack.Screen name="ParentSettings" component={ParentSettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="EditChildSection" component={EditChildSectionScreen} />
      <Stack.Screen name="PersonalizeStories" component={PersonalizeStoriesScreen} />
      <Stack.Screen name="ParentProfile" component={ParentProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="UpdatePin" component={UpdatePinScreen} />

      {/* CHILD MODE (🏠 and 🔒 Parent in the header) */}
      <Stack.Screen name="ProfilePicker" component={ProfilePickerScreen} />
      <Stack.Screen name="ChildHome" component={ChildHomeScreen} />
      <Stack.Screen name="EditAvatar" component={EditAvatarScreen} />

      {/* LEARNING MODULES (English, later Numbers, Feelings ...).
          Their screens are listed by each module, see src/modules/index.js */}
      {MODULE_SCREENS.map((screen) => (
        <Stack.Screen key={screen.name} name={screen.name} component={screen.component} options={screen.options} />
      ))}
    </Stack.Navigator>
    </View>
  );
}
