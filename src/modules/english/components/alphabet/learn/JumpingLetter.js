// JUMPING LETTER - the big letter card standing on a soft shadow ellipse ("the floor").
// The ref gives animations for the Look page:
//   bigJump(onLand)  up ~80 px (300 ms), ONE full turn at the top (500 ms), down (250 ms), squash on landing
//   smallHop(onLand) a ~25 px hop with a small squash   (onLand runs the moment it touches the floor)
//   beat()     a quick grow-and-back (Say page, one per spoken sound)
//   reset()    back to rest at once (page left in the middle of a sequence)
// `inviting` adds a gentle pulse that asks for a tap; `room` = free space above for the jump. The shadow shrinks and fades as the letter rises.

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { motion, usePulse } from '../../../../../shared/utils/motion';
import { LessonLetter } from '../LetterCase';
import { CALM_RADIUS, CALM_SHADOW, FONTS } from '../../../../../shared/theme/theme';

const BIG_JUMP = 80;
const SMALL_HOP = 25;

const JumpingLetter = forwardRef(function JumpingLetter({ item, size, inviting = false, room = BIG_JUMP }, ref) {
  const lift = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const sx = useRef(new Animated.Value(1)).current;
  const sy = useRef(new Animated.Value(1)).current;
  const beatValue = useRef(new Animated.Value(1)).current;
  const pulse = usePulse(inviting, { duration: 1100 });

  function squash(strong) {
    const tall = strong ? 1.14 : 1.07;
    const flat = strong ? 0.86 : 0.93;
    return motion.sequence([
      motion.parallel([motion.timing(sy, tall, { duration: 90 }), motion.timing(sx, 2 - tall, { duration: 90 })]),
      motion.parallel([motion.timing(sy, flat, { duration: 110 }), motion.timing(sx, 2 - flat, { duration: 110 })]),
      motion.parallel([motion.spring(sy, 1, { friction: 4, tension: 160 }), motion.spring(sx, 1, { friction: 4, tension: 160 })]),
    ]);
  }

  useImperativeHandle(ref, () => ({
    bigJump: (onLand) =>
      motion.sequence([
        motion.timing(lift, -BIG_JUMP, { duration: 300, easing: Easing.out(Easing.quad) }),
        motion.timing(spin, 1, { duration: 500, easing: Easing.inOut(Easing.quad) }),
        motion.timing(spin, 0, { duration: 0 }),
        motion.timing(lift, 0, { duration: 250, easing: Easing.in(Easing.quad) }),
        motion.call(onLand),
        squash(true),
      ]),
    smallHop: (onLand) =>
      motion.sequence([
        motion.timing(lift, -SMALL_HOP, { duration: 180, easing: Easing.out(Easing.quad) }),
        motion.timing(lift, 0, { duration: 160, easing: Easing.in(Easing.quad) }),
        motion.call(onLand),
        squash(false),
      ]),
    beat: () =>
      motion.sequence([
        motion.timing(beatValue, 1.14, { duration: 160 }),
        motion.spring(beatValue, 1, { friction: 4, tension: 140 }),
      ]),
    reset: () => {
      [lift, spin].forEach((v) => v.stopAnimation(() => v.setValue(0)));
      [sx, sy, beatValue].forEach((v) => v.stopAnimation(() => v.setValue(1)));
    },
  }));

  const invite = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const shadowScale = lift.interpolate({ inputRange: [-BIG_JUMP, 0], outputRange: [0.45, 1], extrapolate: 'clamp' });
  const shadowOpacity = lift.interpolate({ inputRange: [-BIG_JUMP, 0], outputRange: [0.07, 0.2], extrapolate: 'clamp' });
  const cardHeight = size * 0.85;

  return (
    <View style={[styles.wrap, { width: size, height: cardHeight + room + 30 }]}>
      <Animated.View
        style={[
          styles.card,
          CALM_SHADOW.lifted,
          { width: size, height: cardHeight, backgroundColor: item.accent.pale },
          {
            transform: [
              { translateY: lift },
              { translateY: sy.interpolate({ inputRange: [0.5, 1.5], outputRange: [cardHeight * 0.25, -cardHeight * 0.25] }) },
              { scale: invite },
              { scale: beatValue },
              { scaleX: sx },
              { scaleY: sy },
              { rotate },
            ],
          },
        ]}
      >
        <LessonLetter item={item} style={[styles.letter, { fontSize: size * 0.56, lineHeight: size * 0.7, color: item.accent.deep }]} />
      </Animated.View>
      <Animated.View
        style={[styles.shadow, { width: size * 0.7, opacity: shadowOpacity, transform: [{ scaleX: shadowScale }] }]}
      />
    </View>
  );
});

export default JumpingLetter;

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  card: {
    borderRadius: CALM_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: FONTS.nunitoBlack,
  },
  shadow: {
    height: 18,
    marginTop: 10,
    borderRadius: 9,
    backgroundColor: '#3D2B1F',
  },
});
