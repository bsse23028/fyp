// SPLASH SCREEN - first screen: Buddy says hi.
//
// It is a FIXED screen (no scrolling). Sizes are worked out from the phone's
// height so the whole screen always fits, on small and big phones alike:
//
//   header
//   [ Buddy + speech bubble ]
//   Welcome to KidBuddy
//   subtitle
//   ...space...
//   [ Continue ]
//   small print
//
// Props: { navigation }

import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import MascotSpeech from '../../shared/components/MascotSpeech';
import Button from '../../shared/components/Button';
import { useDevice } from '../../app/context/DeviceContext';
import { COLORS, FONTS, FONT_SIZES } from '../../shared/theme/theme';

export default function SplashScreen({ navigation }) {
  const { height } = useWindowDimensions();
  const { markIntroSeen } = useDevice();

  // Mascot is ~21% of the screen height, but never too small or too big.
  const mascotSize = Math.max(110, Math.min(190, height * 0.21));

  return (
    <Screen>
      <View style={styles.body}>
        <View style={{ marginTop: height * 0.05 }}>
          <MascotSpeech size={mascotSize} line1="Hi, I'm" line2="Buddy!" />
        </View>

        <Text style={[styles.title, { marginTop: height * 0.05 }]}>Welcome to KidBuddy</Text>
        <Text style={styles.subtitle}>A safe, ad-free place to practice, play, and grow.</Text>

        {/* pushes the button to the bottom */}
        <View style={styles.spacer} />

        {/* replace (not navigate) so "back" can never return to the splash.
            markIntroSeen() saves that the splash was shown, so the next time
            the app opens it starts directly on Welcome. */}
        <Button
          title="Continue"
          onPress={() => {
            markIntroSeen();
            navigation.replace('Welcome');
          }}
          style={styles.button}
        />

        <Text style={styles.smallPrint}>
          <Text style={styles.smallPrintBold}>Learning, your way.</Text> Activities that adjust to
          your child, step by step.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: FONT_SIZES.welcomeTitle,
    color: COLORS.warmText,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: FONT_SIZES.copy,
    lineHeight: 22,
    color: COLORS.warmMuted,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  button: {
    alignSelf: 'stretch',
  },
  smallPrint: {
    marginTop: 12,
    fontFamily: FONTS.interRegular,
    fontSize: FONT_SIZES.small,
    lineHeight: 18,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  smallPrintBold: {
    fontFamily: FONTS.interBold,
    color: COLORS.text,
  },
});
