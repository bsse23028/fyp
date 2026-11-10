// APP.JS - the starting point of the app.
//
// It does three things:
//   1. loads the fonts (and shows a spinner until they are ready)
//   2. wraps the app in the "providers" that share data with every screen:
//        Redux Toolkit <Provider>  - the store (child profiles, module data)   src/app/store
//        LanguageProvider          - English / Urdu
//        DeviceProvider            - phone settings
//        AuthProvider              - who is logged in (AuthContext)
//   3. shows the navigator, which holds all the screens

import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/app/store/store';
import ChildLoader from './src/app/store/ChildLoader';
import { LanguageProvider } from './src/app/context/LanguageContext';
import { AuthProvider } from './src/app/context/AuthContext';
import { DeviceProvider } from './src/app/context/DeviceContext';
import AppNavigator from './src/app/navigation/AppNavigator';
import { HeaderProvider } from './src/app/context/HeaderContext';
import { navigationRef, notifyRouteChange } from './src/app/navigation/navigationRef';
import { useDirection } from './src/shared/utils/direction';
import { fontAssets } from './src/shared/theme/fonts';
import { COLORS } from './src/shared/theme/theme';

// Flips the WHOLE app: English = left-to-right, Urdu = right-to-left.
function DirectionRoot({ children }) {
  const { directionStyle } = useDirection();
  return <View style={[{ flex: 1 }, directionStyle]}>{children}</View>;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  // Wait for the fonts. (If they fail to load, carry on with system fonts.)
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <LanguageProvider>
          <DeviceProvider>
            <AuthProvider>
              <ChildLoader />
              <DirectionRoot>
                <HeaderProvider>
                  <NavigationContainer
                    ref={navigationRef}
                    onReady={notifyRouteChange}
                    onStateChange={notifyRouteChange}
                  >
                    <StatusBar style="dark" hidden={false} backgroundColor={COLORS.white} translucent={false} />
                    <AppNavigator />
                  </NavigationContainer>
                </HeaderProvider>
              </DirectionRoot>
            </AuthProvider>
          </DeviceProvider>
        </LanguageProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
