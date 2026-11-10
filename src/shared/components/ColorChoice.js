// COLOUR CHOICE - a row of colour circles. Tap one to pick it, tap again to un-pick.
//
//   <ColorChoice label="Favourite colour" colours={COLOURS} value={colour} onChange={setColour} />
//
// Props: label, colours ([{ name, hex }]), value (the colour NAME, or ''), onChange

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { COLORS, FONTS } from '../theme/theme';

export default function ColorChoice({ label, colours, value, onChange }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {colours.map((colour) => {
          const on = value === colour.name;
          return (
            <Pressable
              key={colour.name}
              onPress={() => onChange(on ? '' : colour.name)}
              accessibilityRole="button"
              accessibilityLabel={colour.name}
              accessibilityState={{ selected: on }}
              style={styles.item}
            >
              <View style={[styles.ring, on && styles.ringOn]}>
                <View style={[styles.swatch, { backgroundColor: colour.hex }]}>
                  {on ? <Text style={[styles.tick, colour.name === 'White' || colour.name === 'Yellow' ? styles.tickDark : null]}>✓</Text> : null}
                </View>
              </View>
              <Text style={[styles.name, on && styles.nameOn]}>{colour.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 22,
  },
  label: {
    marginBottom: 10,
    fontFamily: FONTS.interSemiBold,
    fontSize: 13,
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    width: '20%', // 5 per row
    alignItems: 'center',
    marginBottom: 12,
  },
  ring: {
    padding: 3,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ringOn: {
    borderColor: COLORS.primary,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    fontFamily: FONTS.interBold,
    fontSize: 16,
    color: COLORS.white,
  },
  tickDark: {
    color: COLORS.text,
  },
  name: {
    marginTop: 4,
    fontFamily: FONTS.interMedium,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  nameOn: {
    fontFamily: FONTS.interBold,
    color: COLORS.primary,
  },
});
