// TRACE CANVAS - one letter to trace with a finger, stroke by stroke (data/traceStrokes.js).
// It draws a soft white "road" in the shape of the letter, a dashed guide with little arrows for the
// stroke to do now, a dashed ring where it ends, and round number badges where each stroke starts.
// The child's colour line only grows ALONG the road, so tracing always looks neat and is never "wrong":
// a finger that wanders off simply does nothing. A pointing hand shows the way when the child waits.
//   <TraceCanvas char="A" width={300} color="#EE7B2B" active onStrokeStart={(i, cue) => ...}
//                onStrokeDone={(i, total) => ...} onDone={() => ...} />
// Every number is in traceConfig.js. All motion goes through utils/motion.js.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Text from '../../../../shared/components/AppText';
import { motion, usePulse } from '../../../../shared/utils/motion';
import { playSound } from '../../../../shared/utils/sounds';
import { strokesFor, TRACE_BOX } from '../../data/traceStrokes';
import { arrowPath, arrowsAlong, pathData, resample, strokeCue } from './traceMath';
import { TRACE } from './traceConfig';
import { CALM, FONTS } from '../../../../shared/theme/theme';

const ROAD_EDGE = '#D9D3CB';
const ROAD = '#FFFFFF';
const GUIDE = '#A99F95';

function Badge({ number, x, y, color, current, active }) {
  const pulse = usePulse(current && active, { duration: 700 });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const size = TRACE.BADGE_SIZE;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.badge,
        { left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        { opacity: current ? 1 : 0.55, transform: [{ scale }] },
      ]}
    >
      <Text style={[styles.badgeText, { fontSize: size * 0.5 }]}>{number}</Text>
    </Animated.View>
  );
}

export default function TraceCanvas({ char, width, color = CALM.primary, active = true, onStrokeStart, onStrokeDone, onDone }) {
  const strokes = useMemo(() => strokesFor(char), [char]);
  const dense = useMemo(() => strokes.map((s) => resample(s.points)), [strokes]);
  const scale = width / TRACE_BOX.width;
  const height = TRACE_BOX.height * scale;

  const [index, setIndex] = useState(0); // which stroke the child is doing
  const [progress, setProgress] = useState(0); // how far along that stroke (a point of `dense`)
  const [finished, setFinished] = useState(false);
  const state = useRef({ index: 0, progress: 0, busy: false, finished: false });
  const hint = useRef(new Animated.Value(0)).current;
  const hintFade = useRef(new Animated.Value(0)).current;
  const hintTimer = useRef(null);
  const hintCount = useRef(0);
  const hintAnimation = useRef(null);
  const callbacks = useRef({});
  callbacks.current = { onStrokeStart, onStrokeDone, onDone };

  // ----- the pointing hand -----
  function stopHint() {
    clearTimeout(hintTimer.current);
    if (hintAnimation.current) hintAnimation.current.stop();
    hintFade.setValue(0);
  }

  function scheduleHint(delay) {
    clearTimeout(hintTimer.current);
    if (!active || state.current.finished || hintCount.current >= TRACE.HINT_MAX) return;
    hintTimer.current = setTimeout(playHint, delay);
  }

  function playHint() {
    const road = dense[state.current.index];
    if (!road) return;
    hintCount.current += 1;
    hint.setValue(0);
    playSound('twinkle');
    const duration = Math.max(600, road.length * TRACE.STEP * TRACE.HINT_SPEED);
    const animation = motion.sequence([
      motion.timing(hintFade, 1, { duration: 200 }),
      motion.timing(hint, 1, { duration, easing: Easing.inOut(Easing.quad) }),
      motion.timing(hintFade, 0, { duration: 250 }),
    ]);
    hintAnimation.current = animation;
    animation.start(({ finished: ended }) => {
      if (ended) scheduleHint(TRACE.HINT_IDLE_MS);
    });
  }

  // ----- start / restart -----
  function begin() {
    stopHint();
    state.current = { index: 0, progress: 0, busy: false, finished: false };
    hintCount.current = 0;
    setIndex(0);
    setProgress(0);
    setFinished(false);
    if (callbacks.current.onStrokeStart) callbacks.current.onStrokeStart(0, strokeCue(strokes[0]));
    scheduleHint(TRACE.HINT_FIRST_MS);
  }

  useEffect(() => {
    begin();
    return stopHint;
  }, [char]);

  useEffect(() => {
    if (!active) stopHint();
    else scheduleHint(TRACE.HINT_IDLE_MS);
  }, [active]);

  // ----- tracing -----
  function finishStroke() {
    const s = state.current;
    const total = strokes.length;
    s.busy = true;
    s.progress = dense[s.index].length - 1;
    setProgress(s.progress);
    stopHint();
    if (callbacks.current.onStrokeDone) callbacks.current.onStrokeDone(s.index, total);
    setTimeout(() => {
      if (s.index + 1 < total) {
        s.index += 1;
        s.progress = 0;
        s.busy = false;
        hintCount.current = 0;
        setIndex(s.index);
        setProgress(0);
        if (callbacks.current.onStrokeStart) callbacks.current.onStrokeStart(s.index, strokeCue(strokes[s.index]));
        scheduleHint(TRACE.HINT_IDLE_MS);
      } else {
        s.finished = true;
        setFinished(true);
        if (callbacks.current.onDone) callbacks.current.onDone();
      }
    }, TRACE.STROKE_PAUSE_MS);
  }

  function follow(px, py) {
    const s = state.current;
    if (s.busy || s.finished) return;
    stopHint();
    scheduleHint(TRACE.HINT_IDLE_MS);
    const x = px / scale;
    const y = py / scale;
    const stroke = strokes[s.index];
    const road = dense[s.index];
    if (stroke.dot) {
      if (Math.hypot(x - road[0][0], y - road[0][1]) < TRACE.DOT_TOLERANCE) finishStroke();
      return;
    }
    let best = -1;
    let bestDistance = TRACE.TOLERANCE;
    const last = Math.min(road.length - 1, s.progress + TRACE.LOOK_AHEAD);
    for (let i = s.progress; i <= last; i++) {
      const d = Math.hypot(x - road[i][0], y - road[i][1]);
      if (d < bestDistance) {
        bestDistance = d;
        best = i;
      }
    }
    if (best > s.progress) {
      s.progress = best;
      setProgress(best);
      if (best >= (road.length - 1) * TRACE.FINISH_AT) finishStroke();
    }
  }

  // The responder is made once, so it always calls the newest `follow` through a ref.
  const followRef = useRef(follow);
  followRef.current = follow;
  const touch = (e) => followRef.current(e.nativeEvent.locationX, e.nativeEvent.locationY);
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: touch,
      onPanResponderMove: touch,
    })
  ).current;

  // ----- drawing -----
  const current = dense[index] || [];
  const currentStroke = strokes[index] || { dot: false };
  const arrows = finished || currentStroke.dot ? [] : arrowsAlong(current);
  const end = current[current.length - 1];

  // the pointing hand follows a few points of the current stroke
  const samples = current.filter((_, i) => i % Math.max(1, Math.floor(current.length / 24)) === 0);
  if (current.length && samples[samples.length - 1] !== end) samples.push(end);
  const input = samples.map((_, i) => (samples.length > 1 ? i / (samples.length - 1) : 0));
  const hand = TRACE.HINT_SIZE;
  const handStyle =
    samples.length > 1
      ? {
          opacity: hintFade,
          transform: [
            { translateX: hint.interpolate({ inputRange: input, outputRange: samples.map(([x]) => x * scale - hand * 0.35) }) },
            { translateY: hint.interpolate({ inputRange: input, outputRange: samples.map(([, y]) => y * scale - hand * 0.05) }) },
          ],
        }
      : { opacity: 0 };

  // badges: strokes that start at the same spot sit side by side
  const badges = [];
  strokes.forEach((stroke, i) => {
    const [sx, sy] = stroke.points[0];
    const twins = badges.filter((b) => Math.hypot(b.gx - sx, b.gy - sy) < 8).length;
    badges.push({ i, gx: sx, gy: sy, x: sx * scale - twins * TRACE.BADGE_SIZE * 1.05, y: sy * scale - TRACE.BADGE_SIZE * 0.2 });
  });

  return (
    <View style={{ width, height }} {...responder.panHandlers}>
      <Svg width={width} height={height} viewBox={`0 0 ${TRACE_BOX.width} ${TRACE_BOX.height}`} pointerEvents="none">
        {dense.map((road, i) => (
          <Path key={`edge${i}`} d={pathData(road)} stroke={ROAD_EDGE} strokeWidth={TRACE.ROAD_OUTLINE} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ))}
        {dense.map((road, i) => (
          <Path key={`road${i}`} d={pathData(road)} stroke={ROAD} strokeWidth={TRACE.ROAD_WIDTH} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ))}
        {dense.slice(0, finished ? dense.length : index).map((road, i) => (
          <Path key={`ink${i}`} d={pathData(road)} stroke={color} strokeWidth={TRACE.INK_WIDTH} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ))}
        {!finished && progress > 0 ? (
          <Path d={pathData(current.slice(0, progress + 1))} stroke={color} strokeWidth={TRACE.INK_WIDTH} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ) : null}
        {!finished && !currentStroke.dot ? (
          <Path d={pathData(current)} stroke={GUIDE} strokeWidth={TRACE.GUIDE_WIDTH} strokeDasharray={TRACE.GUIDE_DASH} strokeLinecap="round" fill="none" />
        ) : null}
        {arrows.map((arrow, i) => (
          <Path key={`arrow${i}`} d={arrowPath(arrow)} stroke={GUIDE} strokeWidth={TRACE.GUIDE_WIDTH * 1.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ))}
        {!finished && end && !currentStroke.dot ? (
          <Circle cx={end[0]} cy={end[1]} r={TRACE.END_RING} stroke={GUIDE} strokeWidth={1} strokeDasharray="1.2 1.6" fill="none" />
        ) : null}
      </Svg>

      {!finished &&
        badges
          .filter((b) => b.i >= index)
          .map((b) => (
            <Badge
              key={b.i}
              number={b.i + 1}
              x={b.x}
              y={b.y}
              color={TRACE.BADGE_COLORS[b.i % TRACE.BADGE_COLORS.length]}
              current={b.i === index}
              active={active}
            />
          ))}

      <Animated.View pointerEvents="none" style={[styles.hand, handStyle]}>
        <Animated.Text style={{ fontSize: hand }}>👆</Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontFamily: FONTS.nunitoBlack,
    color: '#FFFFFF',
  },
  hand: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
