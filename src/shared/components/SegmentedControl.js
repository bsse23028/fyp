// SEGMENTED CONTROL - two (or more) choices side by side, one selected: the rounded "pill tabs"
// of the inspo ("Hobbies | Goals"): a soft lilac track, the chosen one is a white pill with purple text.
// Used for the language choice ("English" / "اردو") and for tabs inside a screen.
//
//   <SegmentedControl
//     options={[{ id: 'en', label: 'English' }, { id: 'ur', label: 'اردو' }]}
//     value={language}
//     onChange={setLanguage}
//   />

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { DESIGN } from '../theme/designConfig';
import { CALM_SHADOW, FONTS, PALETTE } from '../theme/theme';

export default function SegmentedControl({ options, value, onChange, style }) {
  return (
    <View style={[styles.wrap, style]}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.item, selected && styles.itemSelected, selected && CALM_SHADOW.soft]}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    padding: 5,
    borderRadius: (DESIGN.PILL_HEIGHT + 10) / 2,
    backgroundColor: PALETTE.pastelLilac,
  },
  item: {
    flex: 1,
    minHeight: DESIGN.PILL_HEIGHT,
    borderRadius: DESIGN.PILL_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemSelected: {
    backgroundColor: PALETTE.cloudWhite,
  },
  text: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 14,
    color: PALETTE.mutedPlum,
  },
  textSelected: {
    color: PALETTE.purple,
  },
});
