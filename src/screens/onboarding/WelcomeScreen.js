// WELCOME SCREEN - "Let's grow together!" with Get Started / Log In, and (at the top) a
// "Sign up / Log in as Therapist" button that only shows a "Coming soon" pop-up for now.
// WelcomeScreen (version 1) is used by the app; WelcomeAltScreen (version 2, longer text) is
// also registered in AppNavigator.js. Both share the same buttons and the calm design.

import React, { useState } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import MascotSpeech from '../../shared/components/MascotSpeech';
import Mascot from '../../shared/components/Mascot';
import SoftButton from '../../shared/components/SoftButton';
import SoftShapes from '../../shared/components/SoftShapes';
import FadeInView from '../../shared/components/FadeInView';
import AnimatedPressable from '../../shared/components/AnimatedPressable';
import ComingSoonModal from '../../shared/components/ComingSoonModal';
import { useIdleBob } from '../../shared/utils/motion';
import { CALM, CALM_RADIUS, CALM_SIZES, FONTS } from '../../shared/theme/theme';

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

function WelcomeButtons({ navigation }) {
  return (
    <View style={styles.buttons}>
      <SoftButton title="Get Started" onPress={() => navigation.navigate('Onboarding')} />
      <SoftButton title="Log In" variant="secondary" onPress={() => navigation.navigate('LogIn')} />
    </View>
  );
}

function BobbingSpeech({ size }) {
  const bob = useIdleBob();
  return (
    <Animated.View style={bob}>
      <MascotSpeech size={size} line1="Let's grow" line2="together!" />
    </Animated.View>
  );
}

// ---------- VERSION 1 ----------
export function WelcomeScreen({ navigation }) {
  const { height } = useWindowDimensions();
  const mascotSize = Math.max(100, Math.min(175, height * 0.19));

  return (
    <Screen background={CALM.background}>
      <SoftShapes />
      <View style={styles.body}>
        <FadeInView index={0} style={styles.stretch}>
          <TherapistButton />
        </FadeInView>

        <View style={styles.center}>
          <FadeInView index={1}>
            <BobbingSpeech size={mascotSize} />
          </FadeInView>
          <FadeInView index={2}>
            <Text style={[styles.title, { marginTop: height * 0.03 }]}>Welcome to KidBuddy</Text>
          </FadeInView>
          <FadeInView index={3}>
            <Text style={styles.copy}>Small steps, big smiles ;)</Text>
          </FadeInView>
        </View>

        <FadeInView index={4} style={styles.stretch}>
          <WelcomeButtons navigation={navigation} />
          <Text style={styles.smallPrint}>Not a replacement for your therapist.</Text>
        </FadeInView>
      </View>
    </Screen>
  );
}

// ---------- VERSION 2 ----------
export function WelcomeAltScreen({ navigation }) {
  const { height } = useWindowDimensions();
  const mascotSize = Math.max(100, Math.min(175, height * 0.19));
  const smallMascot = Math.max(44, Math.min(64, height * 0.075));

  return (
    <Screen background={CALM.background}>
      <SoftShapes />
      <View style={styles.body}>
        <FadeInView index={0} style={styles.stretch}>
          <TherapistButton />
        </FadeInView>

        <View style={styles.center}>
          <FadeInView index={1}>
            <BobbingSpeech size={mascotSize} />
          </FadeInView>
          <FadeInView index={2}>
            <Text style={[styles.title, { marginTop: height * 0.03 }]}>Welcome to KidBuddy</Text>
          </FadeInView>
          <FadeInView index={3}>
            <Text style={styles.copy}>
              <Text style={styles.copyBold}>Made for every kind of learner.</Text> Reading, speech,
              emotions, routines, and more, all in one place.
            </Text>
          </FadeInView>
        </View>

        <FadeInView index={4} style={styles.stretch}>
          <WelcomeButtons navigation={navigation} />
          <Text style={styles.smallPrint}>See your child's wins and streaks in a simple, encouraging way.</Text>
          <View style={styles.footerMascot}>
            <Mascot size={smallMascot} />
          </View>
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
    borderColor: CALM.lavender,
    backgroundColor: CALM.lavenderPale,
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
    backgroundColor: CALM.surface,
  },
  soonText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 12,
    color: CALM.textSoft,
  },
  title: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 27,
    color: CALM.text,
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
});
