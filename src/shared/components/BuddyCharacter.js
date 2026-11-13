// BUDDY CHARACTER - the child's own mascot (rabbit in Preview / when none), alive through transforms.
//   idle: slow bob + tiny sway.  tap: hop + squash + speech bubble ("Hey! I am your buddy!" first).
//   drag: pick it up anywhere (grows, tilts), release = small bounce back to its home corner.
//   mood: 'idle' | 'hop' | 'happy' | 'think' | 'cheer' | 'dance'  (change `moodKey` to play the same mood again)
//   message: optional bubble text (spoken, hides after ~3 s; change `messageKey` to show it again)
//   bubbleSide: show the bubble next to the buddy instead of above it (top of a scroll view)
// Place it with `style` (e.g. absolute bottom-left). All motion goes through utils/motion.js.

import React, { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import Text from './AppText';
import Mascot from './Mascot';
import Sparkles from './Sparkles';
import { hop, motion, useIdleSway, wiggle, wiggleRotate } from '../utils/motion';
import { speakUi } from '../utils/speech';
import { CALM, CALM_RADIUS, CALM_SHADOW, FONTS } from '../theme/theme';

const FIRST_LINE = 'Hey! I am your buddy!';
const FRIENDLY_LINES = ["Let's learn together!", "You're doing great!", 'I like learning with you!'];
const TAP_DISTANCE = 8;
const BUBBLE_TIME = 3000;

function SpeechBubble({ text, side }) {
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    motion.spring(pop, 1, { friction: 6, tension: 140 }).start();
  }, [text]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.bubble,
        side ? styles.bubbleSide : styles.bubbleTop,
        CALM_SHADOW.soft,
        { opacity: pop, transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] },
      ]}
    >
      <Text style={styles.bubbleText}>{text}</Text>
      <View style={[styles.bubbleTail, side ? styles.tailSide : styles.tailTop]} />
    </Animated.View>
  );
}

export default function BuddyCharacter({
  size = 96,
  mood = 'idle',
  moodKey = 0,
  message,
  messageKey = 0,
  avatar,
  bubbleSide = false,
  style,
}) {
  const pan = useRef(new Animated.ValueXY()).current;
  const held = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(0)).current;
  const squash = useRef(new Animated.Value(1)).current;
  const wiggleValue = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.Value(0)).current;
  const idle = useIdleSway();

  const [bubble, setBubble] = useState(null);
  const [sparkleKey, setSparkleKey] = useState(0);
  const taps = useRef(0);
  const hideTimer = useRef(null);
  const position = useRef({ x: 0, y: 0 });
  const moved = useRef(false);

  useEffect(() => {
    const id = pan.addListener((value) => {
      position.current = value;
    });
    return () => {
      pan.removeListener(id);
      clearTimeout(hideTimer.current);
    };
  }, []);

  function say(text) {
    clearTimeout(hideTimer.current);
    setBubble({ text, key: Date.now() });
    speakUi(text);
    hideTimer.current = setTimeout(() => setBubble(null), BUBBLE_TIME);
  }

  function play(name) {
    if (name === 'hop') hop(lift, squash, 10).start();
    if (name === 'happy') motion.sequence([hop(lift, squash, 14), hop(lift, squash, 14), wiggle(wiggleValue)]).start();
    if (name === 'think') {
      motion
        .sequence([
          motion.timing(tilt, 1, { duration: 600 }),
          motion.delay(1400),
          motion.timing(tilt, 0, { duration: 600 }),
        ])
        .start();
    }
    if (name === 'dance') {
      setSparkleKey((k) => k + 1);
      motion
        .sequence([
          hop(lift, squash, 16),
          wiggle(wiggleValue, { swings: 4, duration: 110 }),
          hop(lift, squash, 16),
          wiggle(wiggleValue, { swings: 4, duration: 110 }),
        ])
        .start();
    }
    if (name === 'cheer') {
      setSparkleKey((k) => k + 1);
      motion.sequence([hop(lift, squash, 30), wiggle(wiggleValue, { swings: 6 })]).start();
    }
  }

  useEffect(() => {
    if (mood && mood !== 'idle') play(mood);
  }, [mood, moodKey]);

  useEffect(() => {
    if (message) say(message);
  }, [message, messageKey]);

  function handleTap() {
    hop(lift, squash, 22).start();
    say(taps.current === 0 ? FIRST_LINE : FRIENDLY_LINES[Math.floor(Math.random() * FRIENDLY_LINES.length)]);
    taps.current += 1;
  }

  function release() {
    pan.flattenOffset();
    if (!moved.current) {
      handleTap();
      return;
    }
    motion
      .parallel([
        motion.spring(held, 0, { friction: 5 }),
        motion.spring(pan, { x: 0, y: 0 }, { friction: 5, tension: 70 }),
        motion.sequence([motion.delay(250), motion.timing(squash, 0.92, { duration: 90 }), motion.spring(squash, 1, { friction: 4 })]),
      ])
      .start();
  }

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        moved.current = false;
        pan.stopAnimation();
        pan.setOffset(position.current);
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gesture) => {
        if (!moved.current && Math.hypot(gesture.dx, gesture.dy) < TAP_DISTANCE) return;
        if (!moved.current) {
          moved.current = true;
          motion.spring(held, 1, { friction: 6 }).start();
        }
        pan.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: () => release(),
      onPanResponderTerminate: () => release(),
    })
  ).current;

  const heldScale = held.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  const heldTilt = held.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-6deg'] });
  const thinkTilt = tilt.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-9deg'] });

  return (
    <Animated.View
      style={[
        styles.wrap,
        style,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale: heldScale }, { rotate: heldTilt }] },
      ]}
      {...responder.panHandlers}
      accessible
      accessibilityRole="button"
      accessibilityLabel="Buddy"
    >
      {bubble ? <SpeechBubble key={bubble.key} text={bubble.text} side={bubbleSide} /> : null}
      <Sparkles burstKey={sparkleKey} size={20} count={4} />
      <Animated.View style={idle}>
        <Animated.View
          style={{
            transform: [
              { translateY: lift },
              { scaleY: squash },
              { scaleX: squash.interpolate({ inputRange: [0.9, 1], outputRange: [1.06, 1] }) },
              { rotate: wiggleRotate(wiggleValue) },
              { rotate: thinkTilt },
            ],
          }}
        >
          <Mascot size={size} avatar={avatar} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
  bubble: {
    position: 'absolute',
    width: 200,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: CALM_RADIUS.medium,
    backgroundColor: CALM.surface,
  },
  bubbleText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 15,
    lineHeight: 20,
    color: CALM.text,
  },
  bubbleTop: {
    bottom: '100%',
    start: 0,
    marginBottom: 8,
  },
  bubbleSide: {
    top: 6,
    start: '100%',
    marginStart: 10,
  },
  bubbleTail: {
    position: 'absolute',
    width: 14,
    height: 14,
    backgroundColor: CALM.surface,
    transform: [{ rotate: '45deg' }],
  },
  tailTop: {
    bottom: -7,
    start: 24,
  },
  tailSide: {
    top: 14,
    start: -7,
  },
});
