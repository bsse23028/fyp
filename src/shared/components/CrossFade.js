// CROSS FADE - swaps its content without sliding: the old content fades out (~200 ms), the new one
// fades in while growing from 0.98 to 1 (~300 ms). Give each state its own `stepKey`.
//   <CrossFade stepKey={stage} onShown={(key) => ...}>{content for stage}</CrossFade>

import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { motion } from '../utils/motion';

export default function CrossFade({ stepKey, children, onShown, style }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [shownKey, setShownKey] = useState(stepKey);
  const lastChildren = useRef(children);
  const target = useRef(stepKey);

  if (shownKey === stepKey) lastChildren.current = children;

  useEffect(() => {
    target.current = stepKey;
    if (stepKey === shownKey) return;
    motion.timing(opacity, 0, { duration: 200 }).start(() => {
      const next = target.current;
      scale.setValue(0.98);
      setShownKey(next);
      motion.parallel([motion.timing(opacity, 1, { duration: 300 }), motion.timing(scale, 1, { duration: 300 })]).start();
      if (onShown) onShown(next);
    });
  }, [stepKey]);

  return (
    <Animated.View key={String(shownKey)} style={[styles.fill, style, { opacity, transform: [{ scale }] }]}>
      {shownKey === stepKey ? children : lastChildren.current}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
