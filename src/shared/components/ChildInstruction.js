// CHILD INSTRUCTION - the child's buddy asking one short thing in a speech bubble ("Pick the buddy you like"),
// the same look as the website. In Urdu the row is mirrored, so the buddy stands on the right.
//
//   <ChildInstruction text="Pick a word activity" />
//   <ChildInstruction text="..." avatar="fox" />      show another buddy (e.g. while choosing one)
//
// Sizes are in theme/designConfig.js (ASK_...).

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import Mascot from './Mascot';
import { DESIGN } from '../theme/designConfig';
import { CALM, CALM_SHADOW, FONTS } from '../theme/theme';

export default function ChildInstruction({ text, avatar }) {
  return (
    <View style={styles.row}>
      <Mascot size={DESIGN.ASK_MASCOT} avatar={avatar} />
      <View style={[styles.bubble, CALM_SHADOW.soft]}>
        <View style={styles.tail} />
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bubble: {
    flex: 1,
    marginStart: DESIGN.ASK_GAP,
    minHeight: 60,
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: CALM.surface,
  },
  // the little point of the bubble, toward the buddy
  tail: {
    position: 'absolute',
    start: -6,
    width: 14,
    height: 14,
    backgroundColor: CALM.surface,
    transform: [{ rotate: '45deg' }],
  },
  text: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 18,
    lineHeight: 24,
    color: CALM.text,
  },
});
