// STAT TILE - a small pastel tile with one big number (like "50 pages read" in the inspo).
//
//   <StatTile value={12} label="Sessions this week" icon="📊" color={PALETTE.pastelMint} />
//
// Props: value, label, icon (emoji) OR iconName (a flat AppIcon name), color (tile colour), valueColor, style

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import AppIcon from './AppIcon';
import { DESIGN } from '../theme/designConfig';
import { FONTS, PALETTE } from '../theme/theme';

export default function StatTile({ value, label, icon, iconName, color = PALETTE.pastelMint, valueColor = PALETTE.purple, style }) {
  return (
    <View style={[styles.tile, { backgroundColor: color }, style]}>
      <View style={styles.top}>
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
        {iconName ? (
          <AppIcon name={iconName} size={24} color={valueColor} style={styles.flatIcon} />
        ) : icon ? (
          <Text style={styles.icon}>{icon}</Text>
        ) : null}
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 96,
    padding: 14,
    borderRadius: DESIGN.TILE_RADIUS - 4,
    justifyContent: 'space-between',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 30,
    lineHeight: 36,
  },
  icon: {
    marginStart: 6,
    fontSize: 20,
  },
  flatIcon: {
    marginStart: 6,
  },
  label: {
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 12,
    lineHeight: 15,
    color: PALETTE.mutedPlum,
  },
});
