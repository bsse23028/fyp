// WELCOME SCREEN - "Let's grow together!" with Get Started / Log In, and (at the top) a
// "Sign up / Log in as Therapist" button that only shows a "Coming soon" pop-up for now.
// (The old second version, WelcomeAltScreen, was removed: no button ever opened it.)

import React, { useState } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import Mascot from '../../shared/components/Mascot';
import SoftButton from '../../shared/components/SoftButton';
import SoftShapes from '../../shared/components/SoftShapes';
import FadeInView from '../../shared/components/FadeInView';
import AnimatedPressable from '../../shared/components/AnimatedPressable';
import ComingSoonModal from '../../shared/components/ComingSoonModal';
import { useIdleBob } from '../../shared/utils/motion';
import { DESIGN } from '../../shared/theme/designConfig';
import { CALM, CALM_RADIUS, CALM_SIZES, FONTS, PALETTE } from '../../shared/theme/theme';

function TherapistButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatedPressable
        onPress={() => setOpen(true)}
        accessibilityLabel="Sign up / Log in as Therapist"
        style={styles.therapist}
      >
        <Text style={styles.therapistIcon}>🩺</Text>
        <Text style={styles.therapistText} numberOfLines={2}>
          Sign up / Log in as Therapist
        </Text>
        <View style={styles.soonTag}>
          <Text style={styles.soonText}>Soon</Text>
        </View>
      </AnimatedPressable>
      <ComingSoonModal
        visible={open}
        onClose={() => setOpen(false)}
        message="Therapist accounts are on the way. For now, parents can sign up and log in below."
      />
    </>
  );
}

// startStyle = an optional extra look for the "Get Started" button (it is made deep purple)
function WelcomeButtons({ navigation, startStyle }) {
  return (
    <View style={styles.buttons}>
      <SoftButton title="Get Started" onPress={() => navigation.navigate('Onboarding')} style={startStyle} />
      <SoftButton title="Log In" variant="secondary" onPress={() => navigation.navigate('LogIn')} />
    </View>
  );
}

// ---------- the screen (inspo look, like "Let's get sorted") ----------
// Soft shapes and the Therapist button at the top; in the middle the buddy on the LEFT with the text on
// its RIGHT ("Welcome to KidBuddy / Let's grow together! / Small steps, big smiles"); the two buttons at
// the BOTTOM. "Get Started" is deep purple (PALETTE.deepPurple). In Urdu the row is mirrored by itself.
// The buddy's size is WELCOME_MASCOT in theme/designConfig.js.
export function WelcomeScreen({ navigation }) {
  const { height } = useWindowDimensions();
  const mascotSize = height * DESIGN.WELCOME_MASCOT;
  const bob = useIdleBob({ height: 5 });

  return (
    <Screen>
      <SoftShapes />
      <View style={styles.body}>
        <FadeInView index={0} style={styles.stretch}>
          <TherapistButton />
        </FadeInView>

        {/* the buddy on the left, the words on its right */}
        <View style={styles.introRow}>
          <FadeInView index={1}>
            <Animated.View style={bob}>
              <Mascot size={mascotSize} />
            </Animated.View>
          </FadeInView>
          <FadeInView index={2} style={styles.introText}>
            <Text style={styles.eyebrow}>Welcome to KidBuddy</Text>
            <Text style={styles.bigTitle}>Let's grow together!</Text>
            <Text style={styles.introCopy}>Small steps, big smiles ;)</Text>
          </FadeInView>
        </View>

        {/* the buttons at the bottom */}
        <FadeInView index={3} style={styles.stretch}>
          <WelcomeButtons navigation={navigation} startStyle={styles.startButton} />
          <Text style={styles.smallPrint}>Not a replacement for your therapist.</Text>
        </FadeInView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
  },
  stretch: {
    alignSelf: 'stretch',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  therapist: {
    minHeight: CALM_SIZES.tap,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: CALM_RADIUS.medium,
    borderWidth: 2,
    borderColor: CALM.lavenderPale,
    backgroundColor: CALM.surface,
  },
  therapistIcon: {
    fontSize: 22,
    marginEnd: 10,
  },
  therapistText: {
    flex: 1,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 15,
    color: CALM.text,
  },
  soonTag: {
    marginStart: 8,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: CALM_RADIUS.pill,
    backgroundColor: PALETTE.blushPeach,
  },
  soonText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 12,
    color: CALM.textSoft,
  },
  title: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 27,
    color: CALM.heading,
    textAlign: 'center',
  },
  copy: {
    marginTop: 8,
    paddingHorizontal: 8,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 16,
    lineHeight: 23,
    color: CALM.textSoft,
    textAlign: 'center',
  },
  copyBold: {
    fontFamily: FONTS.nunitoExtraBold,
    color: CALM.text,
  },
  buttons: {
    gap: 12,
  },
  smallPrint: {
    marginTop: 12,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: CALM.textSoft,
    textAlign: 'center',
  },
  footerMascot: {
    marginTop: 12,
    alignItems: 'center',
  },
  // ----- version 1 (inspo look) -----
  introRow: {
    alignSelf: 'stretch',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  introText: {
    flex: 1,
    marginStart: 12,
  },
  startButton: {
    backgroundColor: PALETTE.deepPurple,
    borderColor: PALETTE.deepPurple,
  },
  eyebrow: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 17,
    color: CALM.primary,
  },
  bigTitle: {
    marginTop: 2,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 30,
    lineHeight: 36,
    color: CALM.heading,
  },
  introCopy: {
    marginTop: 8,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 16,
    lineHeight: 23,
    color: CALM.textSoft,
  },
});
