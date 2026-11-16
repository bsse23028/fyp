// GLASS BAR - the floating quick-start bar of Child Home: three big round buttons (icon + tiny label)
// on one glass strip: Alphabets, Words, Sentences. One tap opens that English section directly.
//   pressing  the button squashes with a spring, a soft pop plays, the icon does one small hop,
//             and the section opens a moment later (so the hop is seen)
//   hintId    the button with this id glows slowly ("continue here"); the glow stops when `active` is false
//             (the screen is not in front) and never starts when animations are off
// Where it sits (top or bottom) is decided by ChildHomeScreen with NAV_POSITION in homeConfig.js.
// The buttons and their screens are in homeConfig.js (QUICK_START). Props: { active, hintId, onOpen(item) }

import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text as PlainText, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../shared/components/AppText';
import Glass from './Glass';
import { hop, pressIn, pressOut, usePulse } from '../../../shared/utils/motion';
import { playSound } from '../../../shared/utils/sounds';
import { CALM, FONTS, GLASS } from '../../../shared/theme/theme';
import { HOME, QUICK_START } from '../homeConfig';

function QuickButton({ item, glowing, onOpen }) {
  const press = useRef(new Animated.Value(1)).current; // the squash while pressed
  const lift = useRef(new Animated.Value(0)).current; // the icon's hop
  const squash = useRef(new Animated.Value(1)).current;
  const glow = usePulse(glowing, { duration: HOME.BAR_GLOW_TIME });
  const timer = useRef(null);
  const size = HOME.BAR_BUTTON;

  useEffect(() => () => clearTimeout(timer.current), []);

  function handlePress() {
    playSound('pop');
    hop(lift, squash, HOME.BAR_ICON_HOP).start();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onOpen(item), HOME.BAR_NAV_DELAY);
  }

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => pressIn(press)}
      onPressOut={() => pressOut(press)}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      style={styles.item}
    >
      <Animated.View style={{ transform: [{ scale: press }] }}>
        {/* the soft "continue here" glow behind the button */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glow,
            { width: size + 14, height: size + 14, borderRadius: (size + 14) / 2 },
            { opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.75] }) },
          ]}
        />
        <View style={[styles.button, { width: size, height: size, borderRadius: size / 2 }]}>
          <Animated.View style={{ transform: [{ translateY: lift }, { scale: squash }] }}>
            {item.icon === 'abc' ? (
              <PlainText style={[styles.abc, { color: item.color }]}>ABC</PlainText>
            ) : (
              <Ionicons name={item.icon} size={HOME.BAR_ICON} color={item.color} />
            )}
          </Animated.View>
        </View>
      </Animated.View>
      <Text style={styles.label} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
}

export default function GlassBar({ active, hintId, onOpen }) {
  return (
    <Glass style={styles.bar} radius={GLASS.radiusLarge}>
      {QUICK_START.map((item) => (
        <QuickButton key={item.id} item={item} glowing={active && hintId === item.id} onOpen={onOpen} />
      ))}
    </Glass>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: HOME.BAR_PADDING,
    paddingHorizontal: HOME.BAR_PADDING,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    top: -7,
    left: -7,
    backgroundColor: CALM.yellow,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLASS.fillStrong,
    borderWidth: GLASS.borderWidth,
    borderColor: GLASS.border,
  },
  abc: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 20,
    letterSpacing: 0.5,
  },
  label: {
    marginTop: 4,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 12,
    color: CALM.textSoft,
    textAlign: 'center',
  },
});
