// GLASS - the "glass" look of the Child Home screen: a see-through white layer with a thin light border,
// a soft shadow and large rounded corners. Everything glassy on that screen is built with it.
//   <Glass style={{ padding: 12 }} radius={28}> ... </Glass>
//   <Glass blur={false}> ... </Glass>     never blurred, only the see-through layer (cheaper; the module cards)
// With USE_BLUR (homeConfig.js) the background behind it is also blurred (expo-blur). On Android the blur
// needs to know WHAT to blur: HomeBackground gives its view through GlassContext. Without it (or with
// USE_BLUR = false) the plain see-through layer is shown, which always works.

import React, { createContext, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { GLASS } from '../../../shared/theme/theme';
import { HOME } from '../homeConfig';

// HomeBackground puts a ref to its blur target in here.
export const GlassContext = createContext(null);

export default function Glass({ children, style, radius = GLASS.radius, strong = false, blur = true }) {
  const blurTarget = useContext(GlassContext);
  const fill = { backgroundColor: strong ? GLASS.fillStrong : GLASS.fill };

  return (
    <View style={[styles.shadow, { borderRadius: radius }, style]}>
      <View style={[StyleSheet.absoluteFill, styles.clip, { borderRadius: radius }]}>
        {HOME.USE_BLUR && blur && blurTarget ? (
          <BlurView
            style={StyleSheet.absoluteFill}
            intensity={HOME.BLUR_INTENSITY}
            tint="light"
            blurTarget={blurTarget}
            blurMethod="dimezisBlurView"
          />
        ) : null}
        <View style={[StyleSheet.absoluteFill, fill]} />
      </View>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.border, { borderRadius: radius }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    ...GLASS.shadow,
  },
  clip: {
    overflow: 'hidden',
  },
  border: {
    borderWidth: GLASS.borderWidth,
    borderColor: GLASS.border,
  },
});
