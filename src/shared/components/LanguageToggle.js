// LANGUAGE TOGGLE - the small "English | اردو" switch in the header.
// The selected side is filled indigo with a dark outline (as in Figma).

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { useLanguage } from '../../app/context/LanguageContext';
import { COLORS, FONTS } from '../theme/theme';

const OPTIONS = [
  { id: 'en', label: 'English' },
  { id: 'ur', label: 'اردو' },
];

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={styles.wrap}>
      {OPTIONS.map((option) => {
        const selected = language === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => setLanguage(option.id)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={option.id === 'en' ? 'English' : 'Urdu'}
            accessibilityState={{ selected }}
            style={[styles.item, selected && styles.itemSelected]}
          >
            <Text
              style={[
                option.id === 'ur' ? styles.urduText : styles.latinText,
                selected ? styles.textSelected : styles.textNormal,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  item: {
    minWidth: 46,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.bubble,
  },
  latinText: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 11,
  },
  urduText: {
    fontSize: 13,
  },
  textSelected: {
    color: COLORS.white,
  },
  textNormal: {
    color: COLORS.text,
  },
});
