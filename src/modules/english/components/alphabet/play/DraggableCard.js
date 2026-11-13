// DRAGGABLE CARD - a card the child drags with a finger (PanResponder). It grows a little while held.
// The round decides what happens on release through the ref:
//   measure(cb)        window position of the card at rest
//   glideBack()        softly returns home
//   snapTo(dx, dy, cb) glides into a target, shrinks and fades (correct answer)
// Callbacks get the finger's travel (dx, dy) so the round can hit-test its targets.

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Animated, PanResponder, View } from 'react-native';
import { motion } from '../../../../../shared/utils/motion';

const DraggableCard = forwardRef(function DraggableCard({ children, disabled, onGrant, onMove, onRelease, style }, ref) {
  const pan = useRef(new Animated.ValueXY()).current;
  const lift = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const viewRef = useRef(null);
  const latest = useRef({});
  latest.current = { disabled, onGrant, onMove, onRelease };

  useImperativeHandle(ref, () => ({
    measure(cb) {
      if (viewRef.current) viewRef.current.measureInWindow(cb);
    },
    glideBack() {
      motion
        .parallel([motion.spring(pan, { x: 0, y: 0 }, { friction: 7, tension: 50 }), motion.spring(lift, 1, { friction: 6 })])
        .start();
    },
    snapTo(dx, dy, done) {
      motion
        .sequence([
          motion.parallel([
            motion.spring(pan, { x: dx, y: dy }, { friction: 7, tension: 60 }),
            motion.timing(lift, 0.55, { duration: 320 }),
          ]),
          motion.timing(fade, 0, { duration: 200 }),
        ])
        .start(() => done && done());
    },
  }));

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.disabled,
      onMoveShouldSetPanResponder: () => !latest.current.disabled,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        pan.stopAnimation();
        pan.setValue({ x: 0, y: 0 });
        if (latest.current.onGrant) latest.current.onGrant();
        motion.spring(lift, 1.08, { friction: 6 }).start();
      },
      onPanResponderMove: (_, g) => {
        pan.setValue({ x: g.dx, y: g.dy });
        if (latest.current.onMove) latest.current.onMove(g.dx, g.dy);
      },
      onPanResponderRelease: (_, g) => latest.current.onRelease && latest.current.onRelease(g.dx, g.dy),
      onPanResponderTerminate: (_, g) => latest.current.onRelease && latest.current.onRelease(g.dx, g.dy),
    })
  ).current;

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[style, { zIndex: 10, elevation: 10, opacity: fade, transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale: lift }] }]}
    >
      <View ref={viewRef} collapsable={false}>
        {children}
      </View>
    </Animated.View>
  );
});

export default DraggableCard;
