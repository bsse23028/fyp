// EXPLORE WELCOME CARD - the big "New to KidBuddy?" card at the TOP of Parent Home, for first-time parents.
// It invites the parent to try Child Mode as the demo child Buddy (Explore KidBuddy = Preview, nothing saved).
// It shows until the parent explores once or taps "Not now" (remembered on the phone: KEYS.explored);
// after that the small "Explore KidBuddy" tile further down Parent Home is still there.
// Props: { onExplore, onHide }

import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import Mascot from '../../../shared/components/Mascot';
import Button from '../../../shared/components/Button';
import Tag from '../../../shared/components/Tag';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import { useIdleBob } from '../../../shared/utils/motion';
import { DESIGN } from '../../../shared/theme/designConfig';
import { CALM_SHADOW, FONTS, PALETTE } from '../../../shared/theme/theme';

const BLUE = '#2E6A8A'; // the same blue as the "Try KidBuddy first" intro card

export default function ExploreWelcomeCard({ onExplore, onHide }) {
  const bob = useIdleBob({ height: 5 });

  return (
    <View style={[styles.card, CALM_SHADOW.soft]}>
      <View style={styles.top}>
        <View style={styles.text}>
          <Tag label="New here?" color={PALETTE.cloudWhite} textColor={BLUE} />
          <Text style={styles.title}>See what your child will see</Text>
          <Text style={styles.copy}>Play as Buddy, our demo child, for a few minutes. Every activity is open and nothing is saved.</Text>
        </View>
        <Animated.View style={bob}>
          <Mascot size={110} avatar="puppy" />
        </Animated.View>
      </View>

      <Button title="Explore KidBuddy" onPress={onExplore} style={styles.button} />
      <AnimatedPressable onPress={onHide} hitSlop={8} accessibilityLabel="Not now" style={styles.later}>
        <Text style={styles.laterText}>Not now</Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 18,
    padding: 16,
    borderRadius: DESIGN.TILE_RADIUS,
    backgroundColor: PALETTE.pastelBlue,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    marginEnd: 8,
    alignItems: 'flex-start',
  },
  title: {
    marginTop: 8,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 21,
    lineHeight: 26,
    color: BLUE,
  },
  copy: {
    marginTop: 4,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: '#3E5568',
  },
  button: {
    marginTop: 14,
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  later: {
    alignSelf: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  laterText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 14,
    color: BLUE,
  },
});
