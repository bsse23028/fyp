// SPLASH SCREEN - first screen on a new phone: logo + Buddy pop in over soft floating shapes.
// It stays until "Continue" is pressed; Continue saves introSeen and replaces it with Welcome
// (so the next launch skips it and "back" can never return here).

import React from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import Text from '../../shared/components/AppText';
import Screen from '../../shared/components/Screen';
import Mascot from '../../shared/components/Mascot';
import BrandLogo from '../../shared/components/BrandLogo';
import SoftButton from '../../shared/components/SoftButton';
import SoftShapes from '../../shared/components/SoftShapes';
import FadeInView from '../../shared/components/FadeInView';
import { useDevice } from '../../app/context/DeviceContext';
import { useIdleBob, useScaleIn } from '../../shared/utils/motion';
import { CALM, FONTS } from '../../shared/theme/theme';

export default function SplashScreen({ navigation }) {
  const { height } = useWindowDimensions();
  const { markIntroSeen } = useDevice();

  const mascotSize = Math.max(120, Math.min(210, height * 0.24));
  const logoPop = useScaleIn(80);
  const mascotPop = useScaleIn(260);
  const bob = useIdleBob();

  function handleContinue() {
    markIntroSeen();
    navigation.replace('Welcome');
  }

  return (
    <Screen background={CALM.background}>
      <SoftShapes />
      <View style={styles.body}>
        <View style={styles.center}>
          <Animated.View style={logoPop}>
            <BrandLogo height={Math.max(44, Math.min(60, height * 0.065))} />
          </Animated.View>

          <Animated.View style={[styles.mascotWrap, mascotPop]}>
            <View style={[styles.halo, { width: mascotSize * 1.15, height: mascotSize * 1.15, borderRadius: mascotSize }]} />
            <Animated.View style={bob}>
              <Mascot size={mascotSize} />
            </Animated.View>
          </Animated.View>

          <FadeInView index={4}>
            <Text style={styles.title}>KidBuddy</Text>
          </FadeInView>
          <FadeInView index={5}>
            <Text style={styles.tagline}>Calm, playful learning, one small step at a time.</Text>
          </FadeInView>
        </View>

        <FadeInView index={7} style={styles.bottom}>
          <SoftButton title="Continue" onPress={handleContinue} />
          <Text style={styles.smallPrint}>A safe, ad-free place to practice, play, and grow.</Text>
        </FadeInView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotWrap: {
    marginTop: 22,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    backgroundColor: CALM.surface,
    opacity: 0.85,
  },
  title: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 34,
    color: CALM.text,
    textAlign: 'center',
  },
  tagline: {
    marginTop: 8,
    paddingHorizontal: 12,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 17,
    lineHeight: 24,
    color: CALM.textSoft,
    textAlign: 'center',
  },
  bottom: {
    alignSelf: 'stretch',
  },
  smallPrint: {
    marginTop: 12,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: CALM.textSoft,
    textAlign: 'center',
  },
});
