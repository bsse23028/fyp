// BUDDY CHARACTER - the child's own mascot (rabbit in Preview / when none), alive through transforms.
//   idle: slow bob + tiny sway.  tap: hop + squash + speech bubble ("Hey! I am your buddy!" first).
//   drag: pick it up anywhere (grows, tilts); on release it WADDLES back to its home corner.
//   mood: 'idle' | 'hop' | 'happy' | 'think' | 'cheer' | 'dance' | 'wave' | 'walk'
//         (change `moodKey` to play the same mood again)
//   message: optional bubble text (spoken, hides after ~3 s; change `messageKey` to show it again)
//   messageSilent: true = the bubble is only shown, not spoken
//   bubbleSide: show the bubble next to the buddy instead of above it (top of a scroll view)
//   enterFromLeft: start outside the left edge and walk in to the home corner, then wave and show "Hi!"
//   enterFromRight: the same from the right edge (a mirrored, right-to-left layout)
//   enterGreeting: the bubble shown on arrival ('Hi!' by default; null = only wave, no bubble)
//   active: false pauses the idle bob and sway (the screen is not in front)
//                  (onEntered runs when it has arrived)
//   idleThink: after ~8 s without any touch the buddy does a small "think" tilt (at most twice)
// With a ref:  buddy.current.walkTo(x, y, onArrive)   x / y = points away from the home corner
//              buddy.current.walkToCenter(parentWidth, onArrive)   buddy.current.wave('Hello!')
// While walking, touches on the buddy are ignored. Every number is in buddyConfig.js.
// Place it with `style` (e.g. absolute bottom-left). All motion goes through utils/motion.js.

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, StyleSheet, View } from 'react-native';
import Text from './AppText';
import Mascot from './Mascot';
import Sparkles from './Sparkles';
import { BUDDY_MOTION } from './buddyConfig';
import { useChild } from '../../app/store/useChild';
import { MASCOT_SCALE, getAvatar } from '../theme/avatars';
import { hop, motion, useIdleSway, wiggle, wiggleRotate } from '../utils/motion';
import { onTouch } from '../utils/touchPoint';
import { speakUi } from '../utils/speech';
import { playSound } from '../utils/sounds';
import { buddyVoice } from '../utils/voiceConfig';
import { CALM, CALM_RADIUS, CALM_SHADOW, FONTS } from '../theme/theme';

const FIRST_LINE = 'Hey! I am your buddy!';
const FRIENDLY_LINES = ["Let's learn together!", "You're doing great!", 'I like learning with you!'];
const TAP_DISTANCE = 8;
const BUBBLE_TIME = 3000;
const BM = BUDDY_MOTION;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

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

const BuddyCharacter = forwardRef(function BuddyCharacter(
  {
    size = 96,
    mood = 'idle',
    moodKey = 0,
    message,
    messageKey = 0,
    messageSilent = false, // true = show the bubble but do not speak it
    avatar,
    bubbleSide = false,
    enterFromLeft = false,
    enterFromRight = false,
    enterGreeting = 'Hi!',
    active = true, // false = the screen is not in front: the idle bob and sway pause
    onEntered,
    idleThink = false,
    style,
  },
  ref
) {
  const { displayAvatar } = useChild();
  const chosen = getAvatar(avatar || displayAvatar);
  const width = size * MASCOT_SCALE * chosen.ratio; // as wide as <Mascot size={size}> draws it
  const entering = enterFromLeft || enterFromRight;
  const offscreen = (enterFromRight ? 1 : -1) * (width + 40);

  // where the buddy is, as an offset from its home corner (drag AND walking move this)
  const pan = useRef(new Animated.ValueXY({ x: entering ? offscreen : 0, y: 0 })).current;
  const held = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(0)).current;
  const squash = useRef(new Animated.Value(1)).current;
  const wiggleValue = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.Value(0)).current;
  // walking
  const stepLift = useRef(new Animated.Value(0)).current;
  const walkTilt = useRef(new Animated.Value(0)).current;
  const facing = useRef(new Animated.Value(1)).current;
  // waving
  const waveTilt = useRef(new Animated.Value(0)).current;
  const idle = useIdleSway({ active });

  const [bubble, setBubble] = useState(null);
  const [sparkleKey, setSparkleKey] = useState(0);
  const taps = useRef(0);
  const hideTimer = useRef(null);
  const position = useRef({ x: entering ? offscreen : 0, y: 0 });
  const moved = useRef(false);
  const walking = useRef(false);
  const walkAnimation = useRef(null);
  const homeX = useRef(0);

  useEffect(() => {
    const id = pan.addListener((value) => {
      position.current = value;
    });
    return () => {
      pan.removeListener(id);
      clearTimeout(hideTimer.current);
      if (walkAnimation.current) walkAnimation.current.stop();
    };
  }, []);

  function say(text, silent) {
    clearTimeout(hideTimer.current);
    setBubble({ text, key: Date.now() });
    if (!silent) speakUi(text, undefined, buddyVoice(chosen.id)); // each avatar has its own voice (voiceConfig.js)
    hideTimer.current = setTimeout(() => setBubble(null), BUBBLE_TIME);
  }

  // ----- WAVE: the whole buddy rocks left and right a few times -----
  function wave(text, silent) {
    if (text) say(text, silent);
    const each = BM.waveMs / 5;
    motion.sequence([-1, 1, -1, 1, 0].map((side) => motion.timing(waveTilt, side, { duration: each }))).start();
  }

  // ----- WALK: a waddle to (x, y) points away from home -----
  function step(side) {
    const half = BM.stepMs / 2;
    return motion.parallel([
      motion.timing(walkTilt, side, { duration: BM.stepMs, easing: Easing.inOut(Easing.sin) }),
      motion.sequence([
        motion.timing(stepLift, -BM.stepHop, { duration: half, easing: Easing.out(Easing.quad) }),
        motion.timing(stepLift, 0, { duration: half, easing: Easing.in(Easing.quad) }),
      ]),
    ]);
  }

  function walkTo(x, y, onArrive, minMs = BM.walkMinMs) {
    if (walkAnimation.current) walkAnimation.current.stop();
    const from = position.current;
    const dx = x - from.x;
    const distance = Math.hypot(dx, y - from.y);
    const duration = clamp(distance * BM.walkMsPerPoint, minMs, BM.walkMaxMs);
    const pairs = Math.max(1, Math.round(duration / (BM.stepMs * 2)));
    walking.current = true;
    facing.setValue(BM.flipWhenWalkingLeft && dx < -2 ? -1 : 1);

    const animation = motion.sequence([
      motion.parallel([
        motion.timing(pan, { x, y }, { duration, easing: Easing.bezier(0.3, 0.15, 0.25, 1) }),
        motion.loop(motion.sequence([step(1), step(-1)]), pairs),
      ]),
      motion.parallel([
        motion.timing(walkTilt, 0, { duration: BM.slowDownMs }),
        motion.timing(stepLift, 0, { duration: BM.slowDownMs }),
      ]),
      motion.timing(squash, 0.92, { duration: 90 }),
      motion.spring(squash, 1, { friction: 4 }),
    ]);
    walkAnimation.current = animation;
    animation.start(({ finished }) => {
      if (walkAnimation.current !== animation) return;
      walkAnimation.current = null;
      walking.current = false;
      facing.setValue(1);
      if (finished && distance > 20) playSound('thump');
      if (finished && onArrive) onArrive();
    });
  }

  function walkToCenter(parentWidth, onArrive) {
    walkTo(parentWidth / 2 - (homeX.current + width / 2), 0, onArrive);
  }

  useImperativeHandle(ref, () => ({ walkTo, walkToCenter, wave }));

  // ----- walk in from the left when the lesson opens -----
  useEffect(() => {
    if (!entering) return;
    walkTo(0, 0, () => {
      wave(enterGreeting, true); // the bubble is shown, but it is not spoken
      if (onEntered) onEntered();
    });
  }, []);

  // ----- a small "think" tilt when nobody touched the screen for a while -----
  useEffect(() => {
    if (!idleThink) return undefined;
    let count = 0;
    let timer;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!walking.current) play('think');
        count += 1;
        if (count < BM.idleThinkTimes) schedule();
      }, BM.idleThinkMs);
    };
    const stop = onTouch(() => {
      count = 0;
      schedule();
    });
    schedule();
    return () => {
      stop();
      clearTimeout(timer);
    };
  }, [idleThink]);

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
    if (name === 'wave') wave();
    if (name === 'walk') motion.sequence([step(1), step(-1), step(1), step(-1), motion.timing(walkTilt, 0, { duration: 150 })]).start();
  }

  useEffect(() => {
    if (mood && mood !== 'idle') play(mood);
  }, [mood, moodKey]);

  useEffect(() => {
    if (message) say(message, messageSilent);
  }, [message, messageKey]);

  function handleTap() {
    playSound('giggle');
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
    motion.spring(held, 0, { friction: 5 }).start();
    walkTo(0, 0, null, BM.dragBackMinMs);
  }

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !walking.current,
      onMoveShouldSetPanResponder: () => !walking.current,
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
  const rock = walkTilt.interpolate({ inputRange: [-1, 1], outputRange: [`-${BM.stepTilt}deg`, `${BM.stepTilt}deg`] });
  const waveRock = waveTilt.interpolate({ inputRange: [-1, 1], outputRange: [`-${BM.waveDegrees}deg`, `${BM.waveDegrees}deg`] });

  return (
    <Animated.View
      style={[
        styles.wrap,
        style,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale: heldScale }, { rotate: heldTilt }] },
      ]}
      onLayout={(e) => {
        homeX.current = e.nativeEvent.layout.x;
      }}
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
              { translateY: stepLift },
              { scaleY: squash },
              { scaleX: squash.interpolate({ inputRange: [0.9, 1], outputRange: [1.06, 1] }) },
              { rotate: wiggleRotate(wiggleValue) },
              { rotate: thinkTilt },
              { rotate: rock },
              { rotate: waveRock },
            ],
          }}
        >
          <Animated.View style={{ transform: [{ scaleX: facing }] }}>
            <Mascot size={size} avatar={avatar} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
});

export default BuddyCharacter;

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
