// SEGMENTED CONTROL - two (or more) choices side by side, one selected.
// Used for the language choice ("English" / "اردو").
//
//   <SegmentedControl
//     options={[{ id: 'en', label: 'English' }, { id: 'ur', label: 'اردو' }]}
//     value={language}
//     onChange={setLanguage}
//   />

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { COLORS, FONTS } from '../theme/theme';

export default function SegmentedControl({ options, value, onChange }) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.item, selected && styles.itemSelected]}
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
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  item: {
    flex: 1,
    minHeight: 46,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemSelected: {
    backgroundColor: COLORS.primary,
  },
  text: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 13,
    color: COLORS.text,
  },
  textSelected: {
    color: COLORS.white,
  },
});
