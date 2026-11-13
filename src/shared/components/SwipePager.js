// SWIPE PAGER - a row of full-width pages moved by the child's finger (PanResponder + Animated).
//   swipe left = next, swipe right = previous; the page follows the finger, then slides on (~350 ms,
//   ease-out) or springs back. A locked direction only stretches a little and springs back.
// It uses the NON-capture move handler and only reacts to mostly-horizontal moves, so draggable
// children (cards, the buddy) always win. `swipeZone(index)` = 'bottom' allows swipes only from the
// bottom strip of that page. With animations off, pages change instantly.
//   <SwipePager ref={pager} count={7} index={i} onIndexChange={setI} canGoNext={fn} canGoBack={fn}
//               onBlocked={(dir) => ...} renderPage={(i) => ...} />
//   pager.current.next() / back() / nudge()      onSlide(target) runs when a page starts sliding in

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, StyleSheet, View } from 'react-native';
import { motion } from '../utils/motion';

const SLIDE_MS = 350;
const STRETCH = 0.22;
const MAX_STRETCH = 46;
const BOTTOM_STRIP = 90;

const SwipePager = forwardRef(function SwipePager(
  { count, index, onIndexChange, onSlide, canGoNext, canGoBack, onBlocked, swipeZone, renderPage, style },
  ref
) {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const position = useRef(new Animated.Value(0)).current;
  const busy = useRef(false);
  const frameRef = useRef(null);
  const frameTop = useRef(0);
  const latest = useRef({});
  latest.current = { index, width, height, count, onIndexChange, onSlide, canGoNext, canGoBack, onBlocked, swipeZone };

  useEffect(() => {
    if (!busy.current) position.setValue(-index * width);
  }, [width, index]);

  function settle(target) {
    const { width: w, onSlide: slide } = latest.current;
    busy.current = true;
    if (slide) slide(target);
    motion.timing(position, -target * w, { duration: SLIDE_MS, easing: Easing.out(Easing.cubic) }).start(() => {
      busy.current = false;
      if (target !== latest.current.index) latest.current.onIndexChange(target);
    });
  }

  function springHome() {
    const { index: i, width: w } = latest.current;
    motion.spring(position, -i * w, { friction: 7, tension: 90 }).start();
  }

  function stretch(direction) {
    const { index: i, width: w } = latest.current;
    motion
      .sequence([
        motion.timing(position, -i * w - direction * MAX_STRETCH * 0.7, { duration: 140 }),
        motion.spring(position, -i * w, { friction: 5, tension: 120 }),
      ])
      .start();
  }

  function tryMove(direction) {
    const { index: i, count: n, canGoNext: next, canGoBack: back, onBlocked: blocked } = latest.current;
    if (busy.current) return;
    const target = i + direction;
    if (target < 0 || target >= n) return;
    const allowed = direction > 0 ? next(i) : back(i);
    if (allowed) settle(target);
    else {
      stretch(direction);
      if (blocked) blocked(direction);
    }
  }

  useImperativeHandle(ref, () => ({
    next: () => tryMove(1),
    back: () => tryMove(-1),
    nudge: () => stretch(1),
  }));

  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => {
        if (busy.current) return false;
        const horizontal = Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.6;
        if (!horizontal) return false;
        const { swipeZone: zone, index: i, height: h } = latest.current;
        if (zone && zone(i) === 'bottom') return g.y0 - frameTop.current > h - BOTTOM_STRIP;
        return true;
      },
      onPanResponderMove: (_, g) => {
        const { index: i, width: w, count: n, canGoNext: next, canGoBack: back } = latest.current;
        const forward = g.dx < 0;
        const open = forward ? i < n - 1 && next(i) : i > 0 && back(i);
        const dx = open ? g.dx : Math.sign(g.dx) * Math.min(MAX_STRETCH, Math.abs(g.dx) * STRETCH);
        position.setValue(-i * w + dx);
      },
      onPanResponderRelease: (_, g) => {
        const { width: w } = latest.current;
        const far = Math.abs(g.dx) > w * 0.22 || Math.abs(g.vx) > 0.5;
        if (!far) {
          springHome();
          return;
        }
        const direction = g.dx < 0 ? 1 : -1;
        const { index: i, count: n, canGoNext: next, canGoBack: back, onBlocked: blocked } = latest.current;
        const target = i + direction;
        const allowed = target >= 0 && target < n && (direction > 0 ? next(i) : back(i));
        if (allowed) settle(target);
        else {
          springHome();
          if (blocked && target >= 0 && target < n) blocked(direction);
        }
      },
      onPanResponderTerminate: () => springHome(),
    })
  ).current;

  return (
    <View
      ref={frameRef}
      style={[styles.frame, style]}
      onLayout={(e) => {
        setWidth(e.nativeEvent.layout.width);
        setHeight(e.nativeEvent.layout.height);
        if (frameRef.current) frameRef.current.measure((x, y, w, h, pageX, pageY) => (frameTop.current = pageY));
      }}
      {...responder.panHandlers}
    >
      {width > 0 && (
        <Animated.View style={[styles.row, { width: width * count, transform: [{ translateX: position }] }]}>
          {Array.from({ length: count }).map((_, i) => (
            <View key={i} style={{ width, height: '100%' }}>
              {renderPage(i)}
            </View>
          ))}
        </Animated.View>
      )}
    </View>
  );
});

export default SwipePager;

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    overflow: 'hidden',
    direction: 'ltr',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
});
