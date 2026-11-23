// RISING BUBBLE - one soap bubble with a letter picture inside, floating slowly from the bottom to the
// top of the game area while it sways gently. When it leaves the top, onGone() is called (the game makes a
// new bubble). A right tap pops it (grows + fades + sparkles, then onPopped); a wrong tap only wobbles it.
// `glowing` adds a soft pulsing glow (the hint). With animations off the bubbles stand still (bubble.restAt). `active` = false pauses it (screen not in front).
// Numbers are in gamesConfig.js (BUBBLE_GAME). All motion goes through utils/motion.js.

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import Sparkles from '../../../../shared/components/Sparkles';
import LetterArt from '../spelling/LetterArt';
import { LETTER_ART } from '../../data/letterImages';
import { animationsEnabled, motion, usePulse, wiggle, wiggleRotate } from '../../../../shared/utils/motion';
import { BUBBLE_GAME as G } from './gamesConfig';

export default function RisingBubble({ bubble, areaHeight, active, glowing, onTap, onGone, onPopped }) {
  const rise = useRef(new Animated.Value(0)).current; // 0 = below the bottom, 1 = above the top
  const pop = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const sway = usePulse(active && !bubble.popping, { duration: G.SWAY_MS + (bubble.id % 5) * 300 });
  const glow = usePulse(active && glowing && !bubble.popping, { duration: 700 });
  const [sparkle, setSparkle] = useState(0);
  const riseAnimation = useRef(null);

  // float up (and continue from where it stopped after a pause)
  useEffect(() => {
    if (!active || bubble.popping) return undefined;
    if (!animationsEnabled()) {
      rise.setValue(bubble.restAt); // animations off: the bubble just stands still at its own height
      return undefined;
    }
    rise.stopAnimation((now) => {
      const left = 1 - now;
      const animation = motion.sequence([
        motion.delay(now === 0 ? bubble.delay : 0),
        motion.timing(rise, 1, { duration: bubble.duration * left, easing: Easing.linear }),
      ]);
      riseAnimation.current = animation;
      animation.start(({ finished }) => {
        if (finished && onGone) onGone(bubble);
      });
    });
    return () => riseAnimation.current && riseAnimation.current.stop();
  }, [active, bubble.popping]);

  // the right tap: pop
  useEffect(() => {
    if (!bubble.popping) return;
    if (riseAnimation.current) riseAnimation.current.stop();
    setSparkle((k) => k + 1);
    motion.timing(pop, 1, { duration: 320 }).start(() => onPopped && onPopped(bubble));
  }, [bubble.popping]);

  // a wrong tap: a soft wobble, nothing else
  useEffect(() => {
    if (bubble.wobbleKey) wiggle(shake, { swings: 4, duration: 80 }).start();
  }, [bubble.wobbleKey]);

  const s = bubble.size;
  const art = LETTER_ART[bubble.char];
  const tint = art ? art.light : '#FFFFFF';
  const style = {
    opacity: pop.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
    transform: [
      { translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [areaHeight + s * 0.2, -s * 1.2] }) },
      { translateX: sway.interpolate({ inputRange: [0, 1], outputRange: [-G.SWAY / 2, G.SWAY / 2] }) },
      { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) },
      { rotate: wiggleRotate(shake, 8) },
    ],
  };

  return (
    <Animated.View style={[styles.spot, { left: bubble.x, width: s, height: s }, style]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.glow, { width: s + 18, height: s + 18, borderRadius: (s + 18) / 2, opacity: glow }]}
      />
      <Pressable onPress={() => onTap(bubble)} accessibilityRole="button" accessibilityLabel={bubble.char} hitSlop={8}>
        <View style={[styles.bubble, { width: s, height: s, borderRadius: s / 2 }]}>
          <View style={[styles.tint, { borderRadius: s / 2, backgroundColor: tint }]} />
          <LetterArt char={bubble.char} scale={G.LETTER_SCALE * (s / 96)} />
          <View style={[styles.shine, { width: s * 0.26, height: s * 0.16, borderRadius: s * 0.1, top: s * 0.14, left: s * 0.2 }]} />
        </View>
      </Pressable>
      <Sparkles burstKey={sparkle} size={20} count={4} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  spot: {
    position: 'absolute',
    top: 0,
  },
  glow: {
    position: 'absolute',
    top: -9,
    left: -9,
    backgroundColor: '#FBEBA5',
  },
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    overflow: 'hidden',
  },
  tint: {
    ...StyleSheet.absoluteFill,
    opacity: 0.35,
  },
  shine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    transform: [{ rotate: '-25deg' }],
  },
});
