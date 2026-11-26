// CONFETTI - a "party popper": from the two bottom corners, soft pieces (rounded squares, circles, stars
// and a few 🎉 ✨) shoot up and inward in a fan, slow down at the top, then drift down while turning a
// little and fading (~1.8 s). ONE native-driven value moves every piece, so older phones do not lag.
//   <Confetti burstKey={n} />          plays each time burstKey changes (0 = nothing)
//   <Confetti burstKey={n} big />      the Result-page version (more pieces, higher)
// Never catches touches. With animations off it only shows one soft ✨ for a moment.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { animationsEnabled, motion } from '../utils/motion';
import { CALM, CALM_ACCENTS } from '../theme/theme';

const DURATION = 1800;
const MAX_PIECES = 24;
const COLORS = [...CALM_ACCENTS.map((a) => a.main), CALM.yellow, CALM.coral, CALM.sky, CALM.lavender];
const SHAPES = ['square', 'circle', 'square', 'circle', 'star'];
const EMOJI = ['🎉', '✨'];
const STEPS = [0, 0.1, 0.2, 0.3, 0.38, 0.5, 0.62, 0.75, 0.88, 1];
const TOP = 0.38;

const random = (min, max) => min + Math.random() * (max - min);

// A path that rises fast, slows at the top, then falls gently.
function makePiece(i, total, width, height, big) {
  const fromLeft = i % 2 === 0;
  const reach = random(0.15, big ? 0.55 : 0.45) * width;
  const peak = random(big ? 0.5 : 0.35, big ? 0.85 : 0.65) * height;
  const fall = random(0.18, 0.4) * height;
  const xs = STEPS.map((t) => (fromLeft ? 1 : -1) * reach * (t < TOP ? 1 - (1 - t / TOP) ** 2 : 1 + 0.25 * ((t - TOP) / (1 - TOP))) * 0.8);
  const ys = STEPS.map((t) => (t < TOP ? -peak * (1 - (1 - t / TOP) ** 2) : -peak + fall * ((t - TOP) / (1 - TOP)) ** 1.4));
  const emoji = i < 3 ? EMOJI[i % EMOJI.length] : null;
  return {
    key: i,
    fromLeft,
    xs,
    ys,
    turn: `${random(-200, 200).toFixed(0)}deg`,
    size: emoji ? random(18, 24) : random(8, 14),
    color: COLORS[i % COLORS.length],
    shape: emoji ? 'emoji' : SHAPES[i % SHAPES.length],
    emoji,
    delay: (i / total) * 0.06,
  };
}

function Piece({ piece, progress, height }) {
  const input = STEPS.map((t) => Math.min(1, piece.delay + t * (1 - piece.delay)));
  const style = {
    position: 'absolute',
    top: height - 10,
    [piece.fromLeft ? 'left' : 'right']: 8,
    opacity: progress.interpolate({ inputRange: [0, 0.05, 0.7, 1], outputRange: [0, 1, 1, 0] }),
    transform: [
      { translateX: progress.interpolate({ inputRange: input, outputRange: piece.xs }) },
      { translateY: progress.interpolate({ inputRange: input, outputRange: piece.ys }) },
      { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', piece.turn] }) },
    ],
  };

  if (piece.shape === 'emoji') return <Animated.Text style={[style, { fontSize: piece.size }]}>{piece.emoji}</Animated.Text>;
  if (piece.shape === 'star') {
    return <Animated.Text style={[style, { fontSize: piece.size * 1.6, color: piece.color }]}>★</Animated.Text>;
  }
  const radius = piece.shape === 'circle' ? piece.size / 2 : 3;
  return <Animated.View style={[style, { width: piece.size, height: piece.size, borderRadius: radius, backgroundColor: piece.color }]} />;
}

export default function Confetti({ burstKey = 0, big = false, count }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [shown, setShown] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const total = Math.min(MAX_PIECES, count || (big ? MAX_PIECES : 16));

  useEffect(() => {
    if (!burstKey) return undefined;
    setShown(burstKey);
    if (!animationsEnabled()) {
      const timer = setTimeout(() => setShown(0), 1200);
      return () => clearTimeout(timer);
    }
    progress.setValue(0);
    const animation = motion.timing(progress, 1, { duration: DURATION, easing: Easing.linear });
    animation.start(() => setShown(0));
    return () => animation.stop();
  }, [burstKey]);

  const pieces = useMemo(
    () => (size.width ? Array.from({ length: total }, (_, i) => makePiece(i, total, size.width, size.height, big)) : []),
    [shown, size.width, size.height]
  );

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {shown && !animationsEnabled() ? (
        <View style={styles.still}>
          <Text style={styles.stillSparkle}>✨</Text>
        </View>
      ) : null}
      {shown && animationsEnabled()
        ? pieces.map((piece) => <Piece key={`${shown}-${piece.key}`} piece={piece} progress={progress} height={size.height} />)
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  still: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stillSparkle: {
    fontSize: 44,
    opacity: 0.8,
  },
});
