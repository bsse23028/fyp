// PROGRESS RING - the big round "57% completed" ring of the inspo (drawn with react-native-svg).
// It is open at the bottom (DESIGN.RING_SWEEP degrees) and fills clockwise in Sunny Yellow.
//
//   <ProgressRing value={0.57} label="Completed" detail="15 of 26 letters" />
//
// Props: value (0..1), label (small word under the %), detail (a line under that), size, color, trackColor

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Text from './AppText';
import { DESIGN } from '../theme/designConfig';
import { FONTS, PALETTE } from '../theme/theme';

// One arc from `fromDeg` to `toDeg` (0 deg = top, clockwise) on a circle of radius r around (c, c).
function arcPath(c, r, fromDeg, toDeg) {
  const point = (deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return `${c + r * Math.cos(rad)} ${c + r * Math.sin(rad)}`;
  };
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${point(fromDeg)} A ${r} ${r} 0 ${large} 1 ${point(toDeg)}`;
}

export default function ProgressRing({
  value = 0,
  label,
  detail,
  size = DESIGN.RING_SIZE,
  color = PALETTE.sunny,
  trackColor = PALETTE.pastelLilac,
}) {
  const part = Math.max(0, Math.min(1, value || 0));
  const stroke = DESIGN.RING_STROKE;
  const c = size / 2;
  const r = c - stroke / 2;
  const start = -DESIGN.RING_SWEEP / 2;
  const end = DESIGN.RING_SWEEP / 2;
  const filledEnd = start + DESIGN.RING_SWEEP * part;

  return (
    <View style={[styles.wrap, { width: size, height: size }]} accessibilityLabel={`${Math.round(part * 100)}%`}>
      <Svg width={size} height={size}>
        <Path d={arcPath(c, r, start, end)} stroke={trackColor} strokeWidth={stroke} strokeLinecap="round" fill="none" />
        {part > 0.005 ? (
          <Path d={arcPath(c, r, start, filledEnd)} stroke={color} strokeWidth={stroke} strokeLinecap="round" fill="none" />
        ) : null}
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.percent}>{`${Math.round(part * 100)}%`}</Text>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  percent: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 44,
    lineHeight: 50,
    color: PALETTE.purple,
  },
  label: {
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 14,
    color: PALETTE.mutedPlum,
  },
  detail: {
    marginTop: 4,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 13,
    color: PALETTE.deepPlum,
    textAlign: 'center',
  },
});
