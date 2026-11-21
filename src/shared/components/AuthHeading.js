// AUTH HEADING - the top of form screens (log in, sign up, codes, passwords ...), in the inspo look:
// the buddy peeks in at the top (bobbing gently), then the big purple title and a soft sentence.
//
//   <AuthHeading title="Hey there, you're back!" subtitle="..." />
//   <AuthHeading title="..." subtitle="..." mascot={false} />     no buddy
//
// Props: title, subtitle, mascot (true = show the buddy), avatar (which buddy; default = the one shown everywhere)

import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from './AppText';
import Mascot from './Mascot';
import { useIdleBob } from '../utils/motion';
import { DESIGN } from '../theme/designConfig';
import { globalStyles } from '../theme/globalStyles';

export default function AuthHeading({ title, subtitle, mascot = true, avatar }) {
  const bob = useIdleBob({ height: 5 });

  return (
    <View>
      {mascot ? (
        <Animated.View style={[styles.mascot, bob]}>
          <Mascot size={DESIGN.AUTH_MASCOT} avatar={avatar} />
        </Animated.View>
      ) : null}
      <Text style={globalStyles.heading} accessibilityRole="header">
        {title}
      </Text>
      <Text style={globalStyles.subheading}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mascot: {
    alignSelf: 'center',
    marginBottom: 10,
  },
});
