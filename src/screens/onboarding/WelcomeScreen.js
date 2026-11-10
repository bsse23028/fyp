// WELCOME SCREEN - "Let's grow together!" with Get Started / Log In.
//
// The Figma file has TWO versions of this screen with different text:
//   WelcomeScreen     -> version 1 (short line, buttons at the very bottom)
//   WelcomeAltScreen  -> version 2 (longer text, small Buddy at the bottom)
// The app uses version 1. Both are registered in AppNavigator.js, so you can
// open version 2 (navigate('WelcomeAlt')) and later delete the one you
// don't want.
//
// Both are FIXED screens (no scrolling) sized from the phone's height.
//
// Props: { navigation }

import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import MascotSpeech from '../../shared/components/MascotSpeech';
import Mascot from '../../shared/components/Mascot';
import Button from '../../shared/components/Button';
import { COLORS, FONTS, FONT_SIZES } from '../../shared/theme/theme';

// The two big buttons, shared by both versions.
function WelcomeButtons({ navigation }) {
  return (
    <View style={styles.buttons}>
      <Button title="Get Started" onPress={() => navigation.navigate('Onboarding')} />
      <Button title="Log In" variant="secondary" onPress={() => navigation.navigate('LogIn')} />
    </View>
  );
}

// ---------- VERSION 1 ----------
export function WelcomeScreen({ navigation }) {
  const { height } = useWindowDimensions();
  const mascotSize = Math.max(105, Math.min(180, height * 0.2));

  return (
    <Screen>
      <View style={styles.body}>
        <MascotSpeech size={mascotSize} line1="Let's grow" line2="together!" />

        <Text style={[styles.title, { marginTop: height * 0.035 }]}>Welcome to KidBuddy</Text>
        <Text style={styles.copy}>Small steps, big smiles ;)</Text>

        <View style={styles.spacer} />

        <WelcomeButtons navigation={navigation} />
        <Text style={styles.smallPrint}>Not a replacement for your therapist.</Text>
      </View>
    </Screen>
  );
}

// ---------- VERSION 2 ----------
export function WelcomeAltScreen({ navigation }) {
  const { height } = useWindowDimensions();
  const mascotSize = Math.max(105, Math.min(180, height * 0.2));
  const smallMascot = Math.max(48, Math.min(72, height * 0.085));

  return (
    <Screen>
      <View style={styles.body}>
        <MascotSpeech size={mascotSize} line1="Let's grow" line2="together!" />

        <Text style={[styles.title, { marginTop: height * 0.035 }]}>Welcome to KidBuddy</Text>
        <Text style={styles.copy}>
          <Text style={styles.copyBold}>Made for every kind of learner.</Text> Reading, speech,
          emotions, routines, and more, all in one place.
        </Text>

        <View style={styles.spacer} />

        <WelcomeButtons navigation={navigation} />
        <Text style={styles.smallPrint}>
          See your child's wins and streaks in a simple, encouraging way.
        </Text>

        <Mascot size={smallMascot} style={styles.footerMascot} />
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
  copy: {
    marginTop: 8,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: FONT_SIZES.copy,
    lineHeight: 22,
    color: COLORS.warmMuted,
    textAlign: 'center',
  },
  copyBold: {
    fontFamily: FONTS.nunitoExtraBold,
    color: COLORS.warmText,
  },
  spacer: {
    flex: 1,
  },
  buttons: {
    alignSelf: 'stretch',
    gap: 10,
  },
  smallPrint: {
    marginTop: 12,
    fontFamily: FONTS.interRegular,
    fontSize: FONT_SIZES.small,
    lineHeight: 18,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  footerMascot: {
    marginTop: 16,
  },
});
