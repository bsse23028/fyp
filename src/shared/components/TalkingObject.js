// TALKING OBJECT - turns a picture (an emoji now, an image later) into a friendly little character:
// two blinking eyes that glance toward the child's last touch, a smile that talks while the voice speaks,
// two noodle arms with round mitten hands, two oval feet and a soft shadow on the floor.
//
//   <TalkingObject emoji="🍎" size={150} mood="wave" moodKey={n} speaking={talking} active onPress={...} />
//
//   mood     'idle' | 'wave' | 'dance' | 'jump' | 'happy'   (change moodKey to play the same mood again)
//   speaking true while the voice talks: the mouth opens and closes
//   active   false = the page is not on screen: every loop (blink, sway, talking) stops
//   calm     true = only blinking (no arm sway), for screens with several pictures (Star Check)
//   onPress  makes it tappable: a tap plays "dance" (or "jump" if it is already dancing) and calls onPress
//   hitSlop  extra tappable space around it (points)
//   face     optional overrides for this one picture (see talkingObjectConfig.js)
//
// Every size, position and speed is in talkingObjectConfig.js. All motion goes through utils/motion.js.

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, View } from 'react-native';
import { animationsEnabled, motion } from '../utils/motion';
import { onTouch } from '../utils/touchPoint';
import { TALKING_COLORS, TALKING_MOTION, faceFor } from './talkingObjectConfig';

const COLORS = TALKING_COLORS;
const M = TALKING_MOTION;
const degrees = (value, range = 360) => value.interpolate({ inputRange: [-range, range], outputRange: [`-${range}deg`, `${range}deg`] });

// ---------- one eye: white circle, dark pupil, tiny shine ----------
function Eye({ x, y, size, pupilSize, look, blink }) {
  const pupil = size * pupilSize;
  return (
    <Animated.View
      style={[
        styles.eye,
        { left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: size / 2, transform: [{ scaleY: blink }] },
      ]}
    >
      <Animated.View
        style={{
          width: pupil,
          height: pupil,
          borderRadius: pupil / 2,
          backgroundColor: COLORS.pupil,
          transform: [{ translateX: look.x }, { translateY: look.y }],
        }}
      >
        <View style={[styles.shine, { width: pupil * 0.32, height: pupil * 0.32, borderRadius: pupil * 0.16 }]} />
      </Animated.View>
    </Animated.View>
  );
}

// ---------- the mouth: a smile, or an opening mouth while talking ----------
function Mouth({ x, y, width, height, speaking, active, stroke }) {
  const open = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!speaking || !active) {
      open.setValue(0.3);
      return undefined;
    }
    const half = 1000 / M.talkPerSecond / 2;
    const animation = motion.loop(
      motion.sequence([motion.timing(open, 1, { duration: half }), motion.timing(open, 0.3, { duration: half })])
    );
    animation.start();
    return () => animation.stop();
  }, [speaking, active]);

  if (speaking) {
    const h = height * 1.5;
    return (
      <Animated.View
        style={[
          styles.openMouth,
          { left: x - width / 2, top: y - h / 2, width, height: h, borderRadius: width / 2, transform: [{ scaleY: open }] },
        ]}
      >
        <View style={[styles.tongue, { width: width * 0.55, height: h * 0.35, borderRadius: width }]} />
      </Animated.View>
    );
  }
  return (
    <View
      style={{
        position: 'absolute',
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
        borderBottomWidth: stroke,
        borderLeftWidth: stroke * 0.6,
        borderRightWidth: stroke * 0.6,
        borderColor: COLORS.mouth,
        borderBottomLeftRadius: width / 2,
        borderBottomRightRadius: width / 2,
        borderTopWidth: 0,
      }}
    />
  );
}

// ---------- one noodle arm with a round hand; it turns around the SHOULDER ----------
// React Native turns a view around its middle, so we move it up by half its length, turn it,
// and move it back down: the top end (the shoulder) then stays in place.
function Arm({ x, y, length, thickness, hand, angle }) {
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x - thickness / 2,
        top: y,
        width: thickness,
        height: length,
        borderRadius: thickness / 2,
        backgroundColor: COLORS.arm,
        transform: [{ translateY: -length / 2 }, { rotate: degrees(angle) }, { translateY: length / 2 }],
      }}
    >
      <View
        style={{
          position: 'absolute',
          bottom: -hand / 2,
          left: (thickness - hand) / 2,
          width: hand,
          height: hand,
          borderRadius: hand / 2,
          backgroundColor: COLORS.hand,
        }}
      />
    </Animated.View>
  );
}

export default function TalkingObject({
  emoji,
  image,
  size = 140,
  mood = 'idle',
  moodKey = 0,
  speaking = false,
  active = true,
  calm = false,
  onPress,
  hitSlop = 24,
  face,
}) {
  const f = faceFor(emoji, face);
  const S = size;

  // body motion
  const lift = useRef(new Animated.Value(0)).current; // up/down in points (negative = up)
  const tilt = useRef(new Animated.Value(0)).current; // -1 .. 1  ->  body leans left / right
  const sx = useRef(new Animated.Value(1)).current; // squash / stretch
  const sy = useRef(new Animated.Value(1)).current;
  // arms: the angle in degrees from "hanging straight down" (positive = turns clockwise)
  const armL = useRef(new Animated.Value(f.armRestAngle)).current;
  const armR = useRef(new Animated.Value(-f.armRestAngle)).current;
  const sway = useRef(new Animated.Value(0)).current; // -1 .. 1, the slow idle sway
  // face
  const blink = useRef(new Animated.Value(1)).current;
  const look = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const boxRef = useRef(null);
  const dancing = useRef(false);
  const running = useRef(null);

  // ----- blinking at random moments (only while the page is on screen) -----
  useEffect(() => {
    if (!active || f.ownFace || !animationsEnabled()) return undefined;
    let timer;
    const next = () => {
      const wait = M.blinkEveryMin + Math.random() * (M.blinkEveryMax - M.blinkEveryMin);
      timer = setTimeout(() => {
        motion
          .sequence([
            motion.timing(blink, 0.1, { duration: M.blinkMs / 2 }),
            motion.timing(blink, 1, { duration: M.blinkMs / 2 }),
          ])
          .start(next);
      }, wait);
    };
    next();
    return () => clearTimeout(timer);
  }, [active, f.ownFace]);

  // ----- the tiny slow arm sway -----
  useEffect(() => {
    if (!active || calm || !f.arms) {
      sway.setValue(0);
      return undefined;
    }
    const ease = Easing.inOut(Easing.sin);
    const animation = motion.loop(
      motion.sequence([
        motion.timing(sway, 1, { duration: M.swayMs / 2, easing: ease }),
        motion.timing(sway, -1, { duration: M.swayMs / 2, easing: ease }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [active, calm, f.arms]);

  // ----- the pupils glance toward the last touch, then look ahead again -----
  useEffect(() => {
    if (!active || f.ownFace) return undefined;
    let back;
    const stop = onTouch((x, y) => {
      if (!boxRef.current) return;
      boxRef.current.measure((bx, by, w, h, pageX, pageY) => {
        const dx = x - (pageX + w / 2);
        const dy = y - (pageY + h * f.eyeY);
        const distance = Math.max(1, Math.hypot(dx, dy));
        const reach = S * f.eyeSize * M.pupilMove;
        motion.spring(look, { x: (dx / distance) * reach, y: (dy / distance) * reach }, { friction: 7 }).start();
        clearTimeout(back);
        back = setTimeout(() => motion.spring(look, { x: 0, y: 0 }, { friction: 7 }).start(), M.pupilBackMs);
      });
    });
    return () => {
      stop();
      clearTimeout(back);
    };
  }, [active, f.ownFace]);

  // ----- the moods -----
  const t = (value, to, duration, easing) => motion.timing(value, to, { duration, easing });
  const rest = f.armRestAngle;

  function squash(strong) {
    return motion.sequence([
      motion.parallel([t(sy, strong ? 0.84 : 0.92, 90), t(sx, strong ? 1.14 : 1.07, 90)]),
      motion.parallel([motion.spring(sy, 1, { friction: 4, tension: 160 }), motion.spring(sx, 1, { friction: 4, tension: 160 })]),
    ]);
  }

  function hop(height) {
    return motion.sequence([
      t(lift, -S * height, 170, Easing.out(Easing.quad)),
      t(lift, 0, 150, Easing.in(Easing.quad)),
      squash(false),
    ]);
  }

  function armsTo(left, right, duration) {
    return motion.parallel([t(armL, left, duration), t(armR, right, duration)]);
  }

  function build(name) {
    const up = -M.waveRaise;
    const w = M.waveDegrees;
    if (name === 'wave') {
      return motion.parallel([
        motion.sequence([
          t(armR, up, 250),
          ...[1, -1, 1, -1, 1, 0].map((side) => t(armR, up + side * w, 150)),
          t(armR, -rest, 250),
        ]),
        motion.sequence([t(tilt, 0.35, 300), motion.delay(800), t(tilt, 0, 300)]),
      ]);
    }
    if (name === 'dance') {
      return motion.parallel([
        motion.sequence([...[1, -1, 1, -1, 1, -1].map((side) => t(tilt, side, 150)), t(tilt, 0, 150)]),
        motion.sequence([armsTo(140, -30, 220), armsTo(30, -140, 220), armsTo(140, -30, 220), armsTo(30, -140, 220), armsTo(rest, -rest, 220)]),
        motion.sequence([hop(M.hopHeight), hop(M.hopHeight)]),
      ]);
    }
    if (name === 'jump') {
      return motion.parallel([
        armsTo(rest, -rest, 200),
        motion.sequence([
          t(lift, -S * M.jumpHeight, 240, Easing.out(Easing.quad)),
          t(lift, 0, 200, Easing.in(Easing.quad)),
          squash(true),
        ]),
      ]);
    }
    if (name === 'happy') {
      return motion.parallel([
        hop(M.hopHeight * 0.8),
        motion.sequence([armsTo(150, -150, 180), motion.delay(250), armsTo(rest, -rest, 220)]),
      ]);
    }
    return null;
  }

  function play(name) {
    const animation = build(name);
    if (!animation) return;
    if (running.current) running.current.stop();
    [lift, tilt].forEach((v) => v.setValue(0));
    [sx, sy].forEach((v) => v.setValue(1));
    dancing.current = name === 'dance';
    running.current = animation;
    animation.start(() => {
      if (running.current === animation) {
        running.current = null;
        dancing.current = false;
      }
    });
  }

  useEffect(() => {
    if (mood && mood !== 'idle') play(mood);
  }, [mood, moodKey]);

  useEffect(() => () => running.current && running.current.stop(), []);

  function handlePress() {
    play(dancing.current ? 'jump' : 'dance');
    if (onPress) onPress();
  }

  // ----- layout (all from the config fractions) -----
  const faceCenter = S / 2 + f.faceX * S;
  const eye = S * f.eyeSize;
  const gap = (S * f.eyeGap) / 2;
  const armLength = S * f.armLength;
  const armThick = Math.max(3, S * f.armThickness);
  const hand = S * f.handSize;
  const footW = S * f.footWidth;
  const footH = S * f.footHeight;
  const floorY = f.feet ? S * (f.footY + f.footHeight) : S * 0.96;
  const swayDeg = sway.interpolate({ inputRange: [-1, 1], outputRange: [-M.swayDegrees, M.swayDegrees] });
  const leftAngle = Animated.add(armL, swayDeg);
  const rightAngle = Animated.add(armR, Animated.multiply(swayDeg, -1));
  const shadowScale = lift.interpolate({ inputRange: [-S * M.jumpHeight, 0], outputRange: [0.5, 1], extrapolate: 'clamp' });
  const shadowOpacity = lift.interpolate({ inputRange: [-S * M.jumpHeight, 0], outputRange: [0.05, 0.16], extrapolate: 'clamp' });

  const body = (
    <View ref={boxRef} collapsable={false} style={{ width: S, height: floorY + S * 0.1 }}>
      <Animated.View
        style={[
          styles.shadow,
          { top: floorY, left: S * 0.25, width: S * 0.5, height: S * 0.07, borderRadius: S * 0.035 },
          { opacity: shadowOpacity, transform: [{ scaleX: shadowScale }] },
        ]}
      />
      <Animated.View
        style={{
          width: S,
          height: floorY,
          transform: [
            { translateY: lift },
            { translateY: sy.interpolate({ inputRange: [0.5, 1.5], outputRange: [floorY * 0.25, -floorY * 0.25] }) },
            { rotate: tilt.interpolate({ inputRange: [-1, 1], outputRange: [`-${M.danceDegrees}deg`, `${M.danceDegrees}deg`] }) },
            { scaleX: sx },
            { scaleY: sy },
          ],
        }}
      >
        {f.feet && (
          <>
            <View style={[styles.foot, { left: S / 2 - S * f.footGap / 2 - footW / 2, top: S * f.footY, width: footW, height: footH, borderRadius: footH / 2 }]} />
            <View style={[styles.foot, { left: S / 2 + S * f.footGap / 2 - footW / 2, top: S * f.footY, width: footW, height: footH, borderRadius: footH / 2 }]} />
          </>
        )}
        {f.arms && (
          <>
            <Arm x={S / 2 - S * f.armSpread} y={S * f.armY} length={armLength} thickness={armThick} hand={hand} angle={leftAngle} />
            <Arm x={S / 2 + S * f.armSpread} y={S * f.armY} length={armLength} thickness={armThick} hand={hand} angle={rightAngle} />
          </>
        )}

        <View style={[styles.picture, { width: S, height: S }]}>
          {image ? (
            <Image source={image} resizeMode="contain" style={{ width: S * f.emojiScale, height: S * f.emojiScale }} />
          ) : (
            <Animated.Text style={{ fontSize: S * f.emojiScale * 0.82, lineHeight: S, textAlign: 'center' }}>{emoji}</Animated.Text>
          )}
        </View>

        {!f.ownFace && (
          <>
            <Eye x={faceCenter - gap} y={S * f.eyeY} size={eye} pupilSize={f.pupilSize} look={look} blink={blink} />
            <Eye x={faceCenter + gap} y={S * f.eyeY} size={eye} pupilSize={f.pupilSize} look={look} blink={blink} />
            <Mouth
              x={faceCenter}
              y={S * f.mouthY}
              width={S * f.mouthWidth}
              height={S * f.mouthHeight}
              speaking={speaking}
              active={active}
              stroke={Math.max(2, S * 0.022)}
            />
          </>
        )}
      </Animated.View>
    </View>
  );

  if (!onPress) return <View pointerEvents="none">{body}</View>;
  return (
    <Pressable onPress={handlePress} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel={emoji}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    position: 'absolute',
    backgroundColor: COLORS.shadow,
  },
  picture: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.eyeWhite,
    borderWidth: 1,
    borderColor: 'rgba(46, 42, 38, 0.15)',
  },
  shine: {
    position: 'absolute',
    top: '12%',
    left: '14%',
    backgroundColor: COLORS.eyeShine,
  },
  openMouth: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    backgroundColor: COLORS.mouth,
  },
  tongue: {
    marginBottom: '8%',
    backgroundColor: COLORS.tongue,
  },
  foot: {
    position: 'absolute',
    backgroundColor: COLORS.foot,
  },
});
