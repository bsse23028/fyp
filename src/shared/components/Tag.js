// TAG - a small rounded label, like "Hobby" or "Goal" in the inspo.
//
//   <Tag label="Child" />            pale peach with purple text
//   <Tag label="New" color={PALETTE.pastelMint} />
//
// Props: label, color (the pill colour), textColor, style

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import { DESIGN } from '../theme/designConfig';
import { FONTS, PALETTE } from '../theme/theme';

export default function Tag({ label, color = PALETTE.blushPeach, textColor = PALETTE.purple, style }) {
  return (
    <View style={[styles.tag, { backgroundColor: color }, style]}>
      <Text style={[styles.text, { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    minHeight: DESIGN.TAG_HEIGHT,
    paddingHorizontal: 14,
    borderRadius: DESIGN.TAG_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 13,
  },
});
