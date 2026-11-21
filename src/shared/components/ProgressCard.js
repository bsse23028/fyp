// PROGRESS CARD - a white rounded list card (like "Play Violin" in the inspo): an icon on the left,
// a purple title, a small line and, if `progress` is given, a progress bar under it.
//
//   <ProgressCard icon="📖" title="Alphabets" subtitle="12 of 26 letters" progress={12 / 26} />
//
// Props: icon (emoji) OR iconName (a flat AppIcon name, drawn in iconTint) OR left (anything to draw on the
//        left, e.g. a buddy), iconColor (the square behind the icon), title, subtitle, progress (0..1, leave out = no bar), barColor, right (drawn on the
//        right, e.g. a ⋯ button), selected (purple edge), onPress, style

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import AnimatedPressable from './AnimatedPressable';
import ProgressBar from './ProgressBar';
import AppIcon from './AppIcon';
import { DESIGN } from '../theme/designConfig';
import { CALM_SHADOW, FONTS, PALETTE } from '../theme/theme';

export default function ProgressCard({
  icon,
  iconName,
  iconTint = PALETTE.purple,
  left,
  iconColor = PALETTE.blushPeach,
  title,
  subtitle,
  progress,
  barColor = PALETTE.sunny,
  right,
  selected = false,
  onPress,
  style,
}) {
  const Box = onPress ? AnimatedPressable : View;

  return (
    <Box
      onPress={onPress}
      accessibilityLabel={title}
      accessibilityState={onPress ? { selected } : undefined}
      style={[styles.card, CALM_SHADOW.soft, selected && styles.selected, style]}
    >
      {left ? (
        left
      ) : iconName ? (
        <View style={[styles.iconBox, { backgroundColor: iconColor }]}>
          <AppIcon name={iconName} size={26} color={iconTint} />
        </View>
      ) : icon ? (
        <View style={[styles.iconBox, { backgroundColor: iconColor }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
      ) : null}
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {typeof progress === 'number' ? <ProgressBar value={progress} color={barColor} style={styles.bar} /> : null}
      </View>
      {right}
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 12,
    paddingStart: 12,
    paddingEnd: 8,
    borderRadius: DESIGN.CARD_RADIUS,
    borderWidth: 2,
    borderColor: PALETTE.cloudWhite,
    backgroundColor: PALETTE.cloudWhite,
  },
  selected: {
    borderColor: PALETTE.purple,
  },
  iconBox: {
    width: DESIGN.CARD_ICON_BOX,
    height: DESIGN.CARD_ICON_BOX,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  icon: {
    fontSize: 24,
  },
  text: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 16,
    color: PALETTE.purple,
  },
  subtitle: {
    marginTop: 1,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: PALETTE.mutedPlum,
  },
  bar: {
    marginTop: 8,
  },
});
