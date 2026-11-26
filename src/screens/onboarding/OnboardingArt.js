// ONBOARDING ART - the picture on one intro card, built from the app's own pieces (no emoji):
// two soft see-through circles, one of the KidBuddy buddies big in the middle, and three round white
// badges with flat icons (AppIcon) floating around it. The buddy and the badges bob gently a few
// times (a short, calm animation that then rests).
//
//   <OnboardingArt height={240} avatar="bear" icons={[{ name: 'calendar-heart', color: '#8A33CF' }, ...]} />
//
// Props: height (of the card), avatar (a buddy id from theme/avatars.js), icons (3 x { name, color })
// Sizes are in ONBOARDING_ART below (parts of the card height, so it fits small and big phones).

import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Mascot from '../../shared/components/Mascot';
import AppIcon from '../../shared/components/AppIcon';
import { useIdleBob } from '../../shared/utils/motion';
import { CALM_SHADOW, PALETTE } from '../../shared/theme/theme';

export const ONBOARDING_ART = {
  MASCOT: 0.62, // height of the buddy (part of the card height)
  BADGE: 0.24, // size of one round icon badge (part of the card height)
  ICON: 0.5, // size of the icon inside its badge (part of the badge)
  BIG_CIRCLE: 0.75, // the soft circle behind the top corner
  SMALL_CIRCLE: 0.45, // the soft circle in the bottom corner
  // where the 3 badges sit (top / bottom / start / end as parts of the card)
  SPOTS: [
    { top: '10%', start: '9%' },
    { top: '14%', end: '9%' },
    { bottom: '10%', start: '14%' },
  ],
};

function Badge({ icon, size, spot, index }) {
  const bob = useIdleBob({ height: 4, duration: 1600 + index * 250, delay: 400 + index * 300 });
  return (
    <Animated.View
      style={[
        styles.badge,
        CALM_SHADOW.soft,
        spot,
        { width: size, height: size, borderRadius: size / 2 },
        bob,
      ]}
    >
      <AppIcon name={icon.name} size={size * ONBOARDING_ART.ICON} color={icon.color} />
    </Animated.View>
  );
}

export default function OnboardingArt({ height, avatar, icons = [] }) {
  const bob = useIdleBob({ height: 6 });
  const badge = height * ONBOARDING_ART.BADGE;
  const big = height * ONBOARDING_ART.BIG_CIRCLE;
  const small = height * ONBOARDING_ART.SMALL_CIRCLE;

  return (
    <View style={styles.fill} pointerEvents="none" importantForAccessibility="no-hide-descendants">
      {/* two soft see-through circles (decoration) */}
      <View style={[styles.circle, { width: big, height: big, borderRadius: big / 2, top: -big * 0.3, start: -big * 0.25 }]} />
      <View style={[styles.circle, { width: small, height: small, borderRadius: small / 2, bottom: -small * 0.25, end: -small * 0.15 }]} />

      {/* the buddy */}
      <Animated.View style={bob}>
        <Mascot size={height * ONBOARDING_ART.MASCOT} avatar={avatar} />
      </Animated.View>

      {/* the floating icon badges */}
      {icons.slice(0, ONBOARDING_ART.SPOTS.length).map((icon, i) => (
        <Badge key={icon.name} icon={icon} size={badge} spot={ONBOARDING_ART.SPOTS[i]} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    backgroundColor: PALETTE.cloudWhite,
    opacity: 0.4,
  },
  badge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.cloudWhite,
  },
});
