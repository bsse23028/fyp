// PASTEL TILE - one rounded pastel card of a grid (like "Reading / Leisure" in the inspo):
// an icon in the top corner, a bold purple title and a small line under it. Springy press.
//
//   <PastelTile title="Alphabets" subtitle="Letters and sounds" icon="🔤" color={CATEGORY.learning.pale} onPress={...} />
//
// Props: title, subtitle, icon (an emoji, or an Ionicons name with iconSet="ionicons"), iconColor,
//        iconName (a flat AppIcon name, e.g. "gamepad-variant" - the inspo look),
//        iconNode (anything to draw instead of the icon, e.g. a bobbing icon),
//        soon (true = not built yet: quiet grey tile, faded icon, SOON in theme.js),
//        color (the tile colour), textColor, onPress, disabled, minHeight (taller tiles), style, children (drawn in the tile, e.g. a buddy)
// Half width by default (two tiles per row): pass style={{ width: '100%' }} for a full-width tile.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './AppText';
import AnimatedPressable from './AnimatedPressable';
import AppIcon from './AppIcon';
import { DESIGN } from '../theme/designConfig';
import { FONTS, PALETTE, SOON } from '../theme/theme';

export default function PastelTile({
  title,
  subtitle,
  icon,
  iconSet = 'emoji',
  iconColor = PALETTE.purple,
  iconName,
  iconNode,
  color = PALETTE.pastelLilac,
  textColor = PALETTE.purple,
  onPress,
  disabled,
  minHeight,
  style,
  children,
  soon = false,
}) {
  const shownIconColor = soon ? SOON.icon : iconColor;
  // the outer View takes the place in the grid (width, gap); the tile inside fills it
  return (
    <View style={[styles.place, style]}>
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={title}
      style={[styles.tile, { backgroundColor: soon ? SOON.tile : color }, minHeight ? { minHeight } : null]}
    >
      <View style={soon ? styles.iconSoon : null}>
        {iconNode ? (
          iconNode
        ) : iconName ? (
          <AppIcon name={iconName} size={DESIGN.TILE_ICON + 4} color={shownIconColor} />
        ) : icon ? (
          iconSet === 'ionicons' ? (
            <Ionicons name={icon} size={DESIGN.TILE_ICON} color={shownIconColor} />
          ) : (
            <Text style={styles.emoji}>{icon}</Text>
          )
        ) : null}
      </View>
      <View style={styles.spacer} />
      <Text style={[styles.title, { color: soon ? SOON.text : textColor }]} numberOfLines={2}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
      {children}
    </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  place: {
    width: '48%',
    marginBottom: DESIGN.TILE_GAP,
  },
  tile: {
    flexGrow: 1,
    minHeight: DESIGN.TILE_MIN_HEIGHT,
    padding: 16,
    borderRadius: DESIGN.TILE_RADIUS,
    overflow: 'hidden',
  },
  iconSoon: {
    opacity: SOON.iconOpacity,
  },
  emoji: {
    fontSize: DESIGN.TILE_ICON,
    lineHeight: DESIGN.TILE_ICON * 1.25,
  },
  spacer: {
    flex: 1,
    minHeight: 10,
  },
  title: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 18,
    lineHeight: 22,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 13,
    lineHeight: 17,
    color: PALETTE.mutedPlum,
  },
});
