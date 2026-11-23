// AUTH HEADING - the top of form screens (log in, sign up, codes, passwords ...), in the inspo look:
// the buddy (bobbing gently), the big purple title and a soft sentence.
//
//   <AuthHeading title="Hey there, you're back!" subtitle="..." />          the buddy on top, centred
//   <AuthHeading title="Create your account" subtitle="..." side />         the words on the left, the buddy
//                                                                           on the right (saves height)
//   <AuthHeading title="..." subtitle="..." mascot={false} />                no buddy
//
// Props: title, subtitle, mascot (true = show the buddy), side (true = buddy beside the words),
//        avatar (which buddy; default = the one shown everywhere), mascotSize (side only; default AUTH_MASCOT_SIDE)
// In Urdu the `side` row is mirrored by itself (the buddy moves to the left).

import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from './AppText';
import Mascot from './Mascot';
import { useIdleBob } from '../utils/motion';
import { DESIGN } from '../theme/designConfig';
import { globalStyles } from '../theme/globalStyles';

export default function AuthHeading({ title, subtitle, mascot = true, side = false, avatar, mascotSize }) {
  const bob = useIdleBob({ height: 5 });

  const words = (
    <>
      <Text style={globalStyles.heading} accessibilityRole="header">
        {title}
      </Text>
      <Text style={globalStyles.subheading}>{subtitle}</Text>
    </>
  );

  if (side) {
    return (
      <View style={styles.row}>
        <View style={styles.words}>{words}</View>
        {mascot ? (
          <Animated.View style={[styles.sideMascot, bob]}>
            <Mascot size={mascotSize || DESIGN.AUTH_MASCOT_SIDE} avatar={avatar} />
          </Animated.View>
        ) : null}
      </View>
    );
  }

  return (
    <View>
      {mascot ? (
        <Animated.View style={[styles.mascot, bob]}>
          <Mascot size={DESIGN.AUTH_MASCOT} avatar={avatar} />
        </Animated.View>
      ) : null}
      {words}
    </View>
  );
}

const styles = StyleSheet.create({
  mascot: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  words: {
    flex: 1,
  },
  sideMascot: {
    marginStart: 10,
  },
});
